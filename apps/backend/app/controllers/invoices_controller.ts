import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'
import { generateInvoicePdf } from '../pdf/generate_pdf.js'
import { randomUUID } from 'node:crypto'
import {
  insertInvoiceItems,
  uploadInvoicePdfToStorage,
  processInvoiceItems,
  generatePdfSignedUrl,
} from '#services/invoice_service'
import {
  Invoice,
  Client,
  UserProfile,
  Insert,
  Update,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  Database,
} from '@inma/types'

// Types pour les relations spécifiques
interface InvoiceWithClientData extends Invoice {
  clients: {
    id: string
    first_name: string
    last_name: string
    email: string
    address: string | null
    phone_number: string | null
  }
}

interface SignedUrlOptions {
  expiresIn?: number
  download?: boolean | string
  filename?: string
}

export default class InvoicesController {
  public async index({ request, logger }: HttpContext) {
    const user = request.user
    logger.info(`[INVOICES] Fetching invoices for ${user.email}`)

    const { data, error } = await supabase
      .from('invoices')
      .select(
        `
        *,
        clients (
          id,
          first_name,
          last_name,
          email,
          address,
          phone_number
        )
      `
      )
      .eq('owner_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error(`[INVOICES] Failed to fetch: ${error.message}`)
      throw new Error(error.message)
    }

    return data as InvoiceWithClientData[]
  }

  public async store({ request, response, logger }: HttpContext) {
    const user = request.user
    const body: CreateInvoicePayload & { items?: any[] } = request.only([
      'client_id',
      'title',
      'total_amount',
      'expiration_date',
      'state',
      'items',
    ])
    const invoiceId = randomUUID()

    logger.info(`[INVOICES] Creating invoice for user ${user.email}`)

    if (Object.keys(body).length === 0) {
      logger.info(`[INVOICES] No fields provided for invoice creation`)
      return response.badRequest({ error: 'No fields provided for invoice creation' })
    }

    if (body.state) {
      const allowedStates: Database['public']['Enums']['invoice_state'][] = ['Draft', 'Sent']
      if (!allowedStates.includes(body.state)) {
        logger.warn(`[INVOICES] Invalid state for invoice creation: ${body.state}`)
        return response.badRequest({
          error: `Invalid state for invoice creation. Allowed states: ${allowedStates.join(', ')}`,
        })
      }
    }

    if (!body.client_id) {
      return response.badRequest({ error: 'client_id is required' })
    }

    if (!body.title) {
      return response.badRequest({ error: 'title is required' })
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', body.client_id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (clientError || !client) {
      return response.status(422).send({ error: 'Invalid or unauthorized client ID' })
    }

    const clientData = client as Client

    let itemsWithDetails: any[] = []
    let calculatedTotal = 0

    if (body.items && body.items.length > 0) {
      try {
        const result = await processInvoiceItems(user.id, body.items)
        itemsWithDetails = result.itemsWithDetails
        calculatedTotal = result.totalAmount
        body.total_amount = calculatedTotal
        logger.info(`[INVOICES] Calculated total: ${calculatedTotal}`)
      } catch (err: any) {
        return response.status(422).send({ error: err.message })
      }
    }

    let pdfUrl: string | null = null
    let signedUrl: string | null = null

    if (body.state === 'Sent') {
      try {
        const { data: owner } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', user.id)
          .single()

        const ownerData = owner as Pick<UserProfile, 'display_name' | 'email'>

        if (!ownerData) {
          logger.error(`[INVOICES] Failed to fetch user profile for PDF generation`)
          return response.badRequest({ error: 'User profile not found for PDF generation' })
        }

        const pdfBuffer = await generateInvoicePdf({
          title: body.title,
          invoice_id: invoiceId,
          total_amount: body.total_amount || 0,
          state: body.state,
          created_at: new Date(),
          expiration_date: body.expiration_date ? new Date(body.expiration_date) : undefined,

          owner_name: ownerData.display_name,
          owner_email: ownerData.email,
          client_first_name: clientData.first_name,
          client_last_name: clientData.last_name,
          client_email: clientData.email,
          client_address: clientData.address || undefined,
          client_phone: clientData.phone_number || undefined,
          items: itemsWithDetails,
        })

        pdfUrl = await uploadInvoicePdfToStorage(user.id, pdfBuffer, invoiceId)

        const { signedUrl: generatedSignedUrl, error: signedUrlError } = await generatePdfSignedUrl(
          user.id,
          invoiceId
        )

        if (signedUrlError) {
          logger.warn(`[INVOICES] Failed to generate signed URL: ${signedUrlError}`)
        } else {
          signedUrl = generatedSignedUrl
        }
      } catch (err: any) {
        logger.error(`[INVOICES] PDF generation/upload failed: ${err.message}`)
        return response
          .status(422)
          .send({ error: `Failed to generate or upload PDF: ${err.message}` })
      }
    }

    const insertData: Insert<'invoices'> = {
      id: invoiceId,
      client_id: body.client_id,
      title: body.title,
      total_amount: body.total_amount,
      expiration_date: body.expiration_date,
      state: body.state ?? 'Draft',
      owner_id: user.id,
      pdf_url: pdfUrl,
    }

    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert(insertData)
      .select()
      .single()

    if (invoiceError || !invoiceData) {
      logger.error(`[INVOICES] Invoice insert failed: ${invoiceError?.message}`)
      return response.status(500).send({ error: 'Failed to create invoice' })
    }

    const invoice = invoiceData as Invoice

    if (body.items && body.items.length > 0) {
      try {
        await insertInvoiceItems(user.id, invoiceId, body.items)
      } catch (err: any) {
        logger.error(`[INVOICES] Item insert failed: ${err.message}`)
        return response.status(422).send({ error: 'Invoice created, but item insertion failed' })
      }
    }

    logger.info(
      `[INVOICES] Invoice ${invoiceId} created successfully with state: ${body.state ?? 'Draft'}`
    )

    const responseData = {
      ...invoice,
      pdf_url: pdfUrl,
      ...(signedUrl && { signed_url: signedUrl }),
    }

    return responseData
  }

  public async update({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const invoiceId: string = params.id
    const body: UpdateInvoicePayload & { items?: any[] } = request.only([
      'client_id',
      'title',
      'total_amount',
      'expiration_date',
      'state',
      'items',
    ])

    logger.info(`[INVOICES] Updating invoice ${invoiceId} for ${user.email}`)

    if (Object.keys(body).length === 0) {
      logger.info(`[INVOICES] No changes provided for invoice ${invoiceId}`)
      return response.badRequest({ error: 'No fields provided for update' })
    }

    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .match({ id: invoiceId, owner_id: user.id })
        .single()

      if (invoiceError || !invoice) {
        logger.warn(`[INVOICES] Invoice ${invoiceId} not found or not owned by user`)
        return response.notFound({ error: 'Invoice not found' })
      }

      const invoiceData = invoice as Invoice
      const currentState = invoiceData.state
      const newState = body.state || currentState

      if (body.state) {
        const allowedStates: Database['public']['Enums']['invoice_state'][] = [
          'Draft',
          'Sent',
          'Cancelled',
          'Paid',
          'Overdue',
        ]
        if (!allowedStates.includes(body.state)) {
          logger.warn(
            `[INVOICES] Invalid state transition attempted for invoice ${invoiceId}: from ${currentState} to ${newState}`
          )
          return response.badRequest({
            error: `Invalid state transition from ${currentState} to ${newState}. Allowed states: ${allowedStates.join(', ')}`,
          })
        }

        if (currentState === newState) {
          if (
            currentState === 'Sent' ||
            currentState === 'Paid' ||
            currentState === 'Overdue' ||
            currentState === 'Cancelled'
          ) {
            logger.warn(
              `[INVOICES] Attempted to update invoice ${invoiceId} in non-modifiable state: ${currentState}`
            )
            return response.status(422).send({
              error: `Cannot update invoice already in ${currentState} state`,
            })
          }
        }

        if (currentState === 'Draft') {
          if (newState !== 'Draft' && newState !== 'Sent') {
            logger.warn(
              `[INVOICES] Invalid state transition from ${currentState} to ${newState} for invoice ${invoiceId}`
            )
            return response.status(422).send({
              error: `Invalid state transition from ${currentState} to ${newState}. Draft can only go to Draft or Sent.`,
            })
          }
        } else if (currentState === 'Cancelled') {
          if (newState !== 'Draft') {
            logger.warn(
              `[INVOICES] Invalid state transition from ${currentState} to ${newState} for invoice ${invoiceId}`
            )
            return response.status(422).send({
              error: `Invalid state transition from ${currentState} to ${newState}. Cancelled can only go to Draft.`,
            })
          }
        } else if (
          currentState === 'Sent' ||
          currentState === 'Paid' ||
          currentState === 'Overdue'
        ) {
          logger.warn(
            `[INVOICES] Attempted to modify invoice ${invoiceId} in non-modifiable state: ${currentState}`
          )
          return response.status(422).send({
            error: `Cannot modify invoice in ${currentState} state`,
          })
        }
      }

      // Strict check: Only Draft invoices can be modified
      if (currentState !== 'Draft') {
        if (body.state && currentState !== newState) {
          // Allow state changes for non-Draft invoices (e.g., Sent -> Paid, Paid -> Overdue)
          logger.info(`[INVOICES] State change allowed for invoice ${invoiceId}: ${currentState} -> ${newState}`)
        } else {
          // Block any field modifications for non-Draft invoices
          logger.warn(
            `[INVOICES] Attempted to modify invoice ${invoiceId} in non-modifiable state: ${currentState}`
          )
          return response.status(422).send({ 
            error: `Cannot modify invoice in ${currentState} state. Only Draft invoices can be modified.` 
          })
        }
      }

      // If trying to modify fields of a non-Draft invoice without state change
      if (currentState !== 'Draft' && Object.keys(body).some(key => key !== 'state')) {
        logger.warn(
          `[INVOICES] Attempted to modify fields of invoice ${invoiceId} in state: ${currentState}`
        )
        return response.status(422).send({ 
          error: `Cannot modify invoice fields in ${currentState} state. Only Draft invoices can be modified.` 
        })
      }

      if (currentState === 'Cancelled' && newState === 'Draft' && body.state) {
        const updateStateData: Update<'invoices'> = { state: newState }

        const { data: updatedInvoice, error: updateError } = await supabase
          .from('invoices')
          .update(updateStateData)
          .eq('id', invoiceId)
          .select()
          .single()

        if (updateError || !updatedInvoice) {
          logger.error(`[INVOICES] Failed to update invoice state: ${updateError?.message}`)
          return response.internalServerError({ error: 'Failed to update invoice state' })
        }

        logger.info(`[INVOICES] Invoice ${invoiceId} state changed from Cancelled to Draft`)
        return updatedInvoice as Invoice
      }

      const updateData: Update<'invoices'> = {}

      if (currentState === 'Draft') {
        if (body.client_id !== undefined) updateData.client_id = body.client_id
        if (body.title !== undefined) updateData.title = body.title
        if (body.total_amount !== undefined) updateData.total_amount = body.total_amount
        if (body.expiration_date !== undefined) updateData.expiration_date = body.expiration_date

        if (body.items) {
          try {
            const result = await processInvoiceItems(user.id, body.items)
            updateData.total_amount = result.totalAmount
            logger.info(`[INVOICES] Calculated total: ${result.totalAmount}`)
          } catch (err: any) {
            return response.status(422).send({ error: err.message })
          }
        }
      }

      if (currentState !== newState) {
        updateData.state = newState
      }

      const { data: updatedInvoice, error: updateError } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select()
        .single()

      if (updateError || !updatedInvoice) {
        logger.error(`[INVOICES] Failed to update invoice: ${updateError?.message}`)
        return response.internalServerError({ error: 'Failed to update invoice' })
      }

      const updatedInvoiceData = updatedInvoice as Invoice

      if (body.items) {
        if (currentState !== 'Draft') {
          logger.warn(
            `[INVOICES] Attempted to modify items of invoice ${invoiceId} in non-modifiable state: ${currentState}`
          )
          return response.status(422).send({ 
            error: `Cannot modify invoice items in ${currentState} state. Only Draft invoices can be modified.` 
          })
        }
        
        try {
          await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)
          await insertInvoiceItems(user.id, invoiceId, body.items)
        } catch (err: any) {
          logger.error(`[INVOICES] Item update failed: ${err.message}`)
          return response.status(422).send({ error: 'Invoice updated, but item update failed' })
        }
      }

      const shouldGeneratePdf = currentState === 'Draft' && newState === 'Sent'

      if (!shouldGeneratePdf) {
        logger.info(
          `[INVOICES] PDF generation skipped - transition from ${currentState} to ${newState}`
        )
        return updatedInvoiceData
      }

      logger.info(`[INVOICES] Generating PDF for transition from Draft to Sent`)

      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('first_name, last_name, email, address, phone_number')
        .eq('id', updatedInvoiceData.client_id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single()

      if (clientError || !client) {
        logger.error(`[INVOICES] Client ${updatedInvoiceData.client_id} not found or unauthorized`)
        return response.badRequest({ error: 'Client data required for PDF generation' })
      }

      const clientData = client as Pick<
        Client,
        'first_name' | 'last_name' | 'email' | 'address' | 'phone_number'
      >

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        logger.error(`[INVOICES] Failed to fetch user profile: ${profileError?.message}`)
        return response.badRequest({ error: 'User profile not found' })
      }

      const profileData = profile as Pick<UserProfile, 'display_name' | 'email'>

      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('quantity, unit_price, item_id, items (name)')
        .eq('invoice_id', invoiceId)

      if (itemsError || !items) {
        logger.warn(`[INVOICES] No items found for invoice ${invoiceId}`)
      }

      const itemsData = items as any[] // Type flexible pour les relations Supabase

      const itemsWithDetails = (itemsData || []).map((row) => ({
        name: row.items?.name || 'Unknown Item',
        quantity: row.quantity,
        unit_price: row.unit_price,
      }))

      const pdfBuffer = await generateInvoicePdf({
        title: updatedInvoiceData.title,
        invoice_id: updatedInvoiceData.id,
        total_amount: updatedInvoiceData.total_amount || 0,
        state: updatedInvoiceData.state,
        created_at: new Date(updatedInvoiceData.created_at),
        expiration_date: updatedInvoiceData.expiration_date
          ? new Date(updatedInvoiceData.expiration_date)
          : undefined,
        owner_name: profileData.display_name,
        owner_email: profileData.email,
        client_first_name: clientData.first_name,
        client_last_name: clientData.last_name,
        client_email: clientData.email,
        client_address: clientData.address || undefined,
        client_phone: clientData.phone_number || undefined,
        items: itemsWithDetails,
      })

      const pdfUrl = await uploadInvoicePdfToStorage(user.id, pdfBuffer, invoiceId)
      const pdfUpdateData: Update<'invoices'> = { pdf_url: pdfUrl }
      await supabase.from('invoices').update(pdfUpdateData).eq('id', invoiceId)

      const { signedUrl, error: signedUrlError } = await generatePdfSignedUrl(user.id, invoiceId)

      let finalSignedUrl = null
      if (signedUrlError) {
        logger.warn(`[INVOICES] Failed to generate signed URL: ${signedUrlError}`)
      } else {
        finalSignedUrl = signedUrl
      }

      logger.info(
        `[INVOICES] Invoice ${invoiceId} updated from ${currentState} to ${newState} with PDF generated`
      )
      return {
        ...updatedInvoiceData,
        pdf_url: pdfUrl,
        signed_url: finalSignedUrl,
      }
    } catch (err: any) {
      logger.error(`[INVOICES] Unexpected error during invoice state update: ${err.message}`)
      return response.internalServerError({ error: 'Unexpected error', details: err.message })
    }
  }

  public async destroy({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const invoiceId: string = params.id

    logger.info(`[INVOICES] Attempting to delete invoice ${invoiceId} for ${user.email}`)

    try {
      // First check the invoice state
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('id, state')
        .match({ id: invoiceId, owner_id: user.id })
        .single()

      if (fetchError || !invoice) {
        logger.warn(`[INVOICES] Invoice ${invoiceId} not found for user ${user.email}`)
        return response.notFound({ error: 'Invoice not found' })
      }

      const invoiceData = invoice as Pick<Invoice, 'id' | 'state'>

      // Prevent deletion of sent, paid, or overdue invoices
      if (invoiceData.state === 'Sent' || invoiceData.state === 'Paid' || invoiceData.state === 'Overdue') {
        logger.warn(`[INVOICES] Attempted to delete invoice ${invoiceId} in non-deletable state: ${invoiceData.state}`)
        return response.status(422).send({
          error: `Cannot delete invoice in ${invoiceData.state} state. Only Draft and Cancelled invoices can be deleted.`
        })
      }

      const deleteData: Update<'invoices'> = { deleted_at: new Date().toISOString() }

      const { error } = await supabase
        .from('invoices')
        .update(deleteData)
        .match({ id: invoiceId, owner_id: user.id })

      if (error) {
        logger.error(`[INVOICES] Failed to delete ${invoiceId}: ${error.message}`)
        throw new Error(error.message)
      }

      logger.warn(`[INVOICES] Soft-deleted invoice ${invoiceId}`)
      return { deleted: true }
    } catch (error: any) {
      logger.error(`[INVOICES] Unexpected error during invoice deletion: ${error.message}`)
      return response.internalServerError({
        error: 'Failed to delete invoice',
        details: error.message,
      })
    }
  }

  public async show({ request, params, response, logger }: HttpContext) {
    const user = request.user

    logger.info(`[INVOICES] Fetching invoice ${params.id} for ${user.email}`)

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(
          `
          *,
          clients (
            id,
            first_name,
            last_name,
            email,
            address,
            phone_number
          )
        `
        )
        .match({ id: params.id, owner_id: user.id })
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn(`[INVOICES] Invoice ${params.id} not found for user ${user.email}`)
          return response.notFound({ error: 'Invoice not found' })
        }
        logger.error(`[INVOICES] Error fetching invoice ${params.id}: ${error.message}`)
        throw new Error(error.message)
      }

      logger.info(`[INVOICES] Invoice ${params.id} fetched successfully`)
      return data as InvoiceWithClientData
    } catch (error: any) {
      logger.error(`[INVOICES] Unexpected error fetching invoice: ${error.message}`)
      return response.internalServerError({
        error: 'Failed to fetch invoice',
        details: error.message,
      })
    }
  }

  public async getItems({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const invoiceId: string = params.id

    logger.info(`[INVOICES] Fetching items for invoice ${invoiceId} for ${user.email}`)

    try {
      // First verify the invoice belongs to the user
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id')
        .match({ id: invoiceId, owner_id: user.id })
        .single()

      if (invoiceError || !invoice) {
        logger.warn(`[INVOICES] Invoice ${invoiceId} not found for user ${user.email}`)
        return response.notFound({ error: 'Invoice not found' })
      }

      // Get invoice items with item details - invoice_items doesn't have an id column
      const { data: items, error } = await supabase
        .from('invoice_items')
        .select(
          `
          invoice_id,
          item_id,
          quantity,
          unit_price,
          items (
            id,
            name,
            price
          )
        `
        )
        .eq('invoice_id', invoiceId)
        .is('deleted_at', null)

      if (error) {
        logger.error(`[INVOICES] Error fetching items for invoice ${invoiceId}: ${error.message}`)
        throw new Error(error.message)
      }

      logger.info(`[INVOICES] Items fetched successfully for invoice ${invoiceId}`)
      return items
    } catch (error: any) {
      logger.error(`[INVOICES] Unexpected error fetching invoice items: ${error.message}`)
      return response.internalServerError({
        error: 'Failed to fetch invoice items',
        details: error.message,
      })
    }
  }

  public async download({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const invoiceId: string = params.id
    const filePath = `${user.id}/invoices/${invoiceId}.pdf`

    logger.info(`[INVOICES] Downloading invoice ${invoiceId} for ${user.email}`)

    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, title, state, pdf_url')
        .match({ id: invoiceId, owner_id: user.id })
        .single()

      if (invoiceError || !invoice) {
        logger.warn(`[INVOICES] Invoice ${invoiceId} not found for user ${user.email}`)
        return response.notFound({ error: 'Invoice not found' })
      }

      const invoiceData = invoice as Pick<Invoice, 'id' | 'title' | 'state' | 'pdf_url'>

      // Check if PDF exists in storage
      const { data: fileExists, error: checkError } = await supabase.storage
        .from('invoices')
        .list(user.id + '/invoices', {
          search: `${invoiceId}.pdf`,
        })

      if (checkError) {
        logger.error(`[INVOICES] Error checking file existence: ${checkError.message}`)
        return response.internalServerError({ error: 'Failed to check PDF existence' })
      }

      if (!fileExists || fileExists.length === 0) {
        logger.warn(`[INVOICES] PDF file not found in storage for invoice ${invoiceId}, attempting to generate it`)
        
        // Try to generate the PDF
        try {
          await this.generatePdfInternal(user.id, invoiceId, logger)
          logger.info(`[INVOICES] PDF generated successfully for invoice ${invoiceId}`)
        } catch (generateError: any) {
          logger.error(`[INVOICES] Failed to generate PDF: ${generateError.message}`)
          return response.notFound({ error: 'PDF file not found and could not be generated. Please ensure the invoice has been sent.' })
        }
      }

      logger.info(`[INVOICES] PDF file found, attempting download for invoice ${invoiceId}`)

      const { data: file, error } = await supabase.storage.from('invoices').download(filePath)

      if (error) {
        logger.error(`[INVOICES] Error downloading PDF: ${error.message}`)

        if (error.message.includes('Object not found')) {
          return response.notFound({ error: 'PDF file not found' })
        }

        throw new Error(error.message)
      }

      if (!file) {
        logger.error(`[INVOICES] PDF file is empty for invoice ${invoiceId}`)
        return response.notFound({ error: 'PDF file not found' })
      }

      const buffer = Buffer.from(await file.arrayBuffer())

      const filename = invoiceData.title
        ? `${invoiceData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${invoiceId.substring(0, 8)}.pdf`
        : `invoice-${invoiceId.substring(0, 8)}.pdf`

      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', `attachment; filename="${filename}"`)
      response.header('Content-Length', buffer.length.toString())

      logger.info(`[INVOICES] PDF download successful for invoice ${invoiceId}, size: ${buffer.length} bytes`)
      return response.send(buffer)
    } catch (error: any) {
      logger.error(`[INVOICES] Unexpected error during PDF download: ${error.message}`)
      return response.internalServerError({
        error: 'Failed to download PDF',
        details: error.message,
      })
    }
  }

  public async preview({ request, params, response, logger }: HttpContext) {
    const user = request.user

    logger.info(`[INVOICES] Previewing invoice ${params.id} for ${user.email}`)

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('pdf_url')
        .match({ id: params.id, owner_id: user.id })
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn(`[INVOICES] Invoice ${params.id} not found for user ${user.email}`)
          return response.notFound({ error: 'Invoice not found' })
        }
        logger.error(`[INVOICES] Error fetching invoice for preview: ${error.message}`)
        throw new Error(error.message)
      }

      const invoiceData = data as Pick<Invoice, 'pdf_url'>

      if (!invoiceData?.pdf_url) {
        logger.warn(`[INVOICES] PDF URL not found for invoice ${params.id}`)
        return response.notFound({ error: 'PDF not available for preview' })
      }

      logger.info(`[INVOICES] Preview URL retrieved for invoice ${params.id}`)
      return { pdf_url: invoiceData.pdf_url }
    } catch (error: any) {
      logger.error(`[INVOICES] Unexpected error during preview: ${error.message}`)
      return response.internalServerError({
        error: 'Failed to get preview',
        details: error.message,
      })
    }
  }

  public async generateSignedUrl({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const invoiceId: string = params.id
    const { expiresIn, download, filename }: SignedUrlOptions = request.only([
      'expiresIn',
      'download',
      'filename',
    ])

    logger.info(`[INVOICES] Generating signed URL for invoice ${invoiceId} by ${user.email}`)

    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, title, state, pdf_url')
        .match({ id: invoiceId, owner_id: user.id })
        .single()

      if (invoiceError || !invoice) {
        logger.warn(`[INVOICES] Invoice ${invoiceId} not found for user ${user.email}`)
        return response.notFound({ error: 'Invoice not found' })
      }

      const invoiceData = invoice as Pick<Invoice, 'id' | 'title' | 'state' | 'pdf_url'>

      if (invoiceData.state === 'Draft') {
        logger.warn(`[INVOICES] Attempted to generate signed URL for draft invoice ${invoiceId}`)
        return response.badRequest({ error: 'Cannot generate signed URL for draft invoice' })
      }

      // Check if PDF exists in storage
      const { data: fileExists, error: checkError } = await supabase.storage
        .from('invoices')
        .list(user.id + '/invoices', {
          search: `${invoiceId}.pdf`,
        })

      if (checkError) {
        logger.error(`[INVOICES] Error checking file existence: ${checkError.message}`)
        return response.internalServerError({ error: 'Failed to check PDF existence' })
      }

      if (!fileExists || fileExists.length === 0) {
        logger.warn(`[INVOICES] PDF file not found in storage for invoice ${invoiceId}, attempting to generate it`)
        
        // Try to generate the PDF
        try {
          await this.generatePdfInternal(user.id, invoiceId, logger)
          logger.info(`[INVOICES] PDF generated successfully for invoice ${invoiceId}`)
        } catch (generateError: any) {
          logger.error(`[INVOICES] Failed to generate PDF: ${generateError.message}`)
          return response.notFound({ error: 'PDF file not found and could not be generated. Please ensure the invoice has been sent.' })
        }
      }

      logger.info(`[INVOICES] PDF file found, generating signed URL for invoice ${invoiceId}`)

      const options: any = {}

      if (expiresIn) {
        options.expiresIn = expiresIn
      }

      if (download) {
        options.download = filename || invoiceData.title || `invoice-${invoiceId.substring(0, 8)}`
      }

      const { signedUrl, error: signedUrlError } = await generatePdfSignedUrl(
        user.id,
        invoiceId,
        options
      )

      if (signedUrlError) {
        logger.error(`[INVOICES] Failed to generate signed URL: ${signedUrlError}`)
        return response.internalServerError({ error: signedUrlError })
      }

      const actualExpiresIn = options.expiresIn || 3 * 24 * 60 * 60
      const expirationDate = new Date(Date.now() + actualExpiresIn * 1000)

      logger.info(`[INVOICES] Signed URL generated successfully for invoice ${invoiceId}`)
      return {
        signed_url: signedUrl,
        expires_at: expirationDate.toISOString(),
        expires_in_seconds: actualExpiresIn,
      }
    } catch (error: any) {
      logger.error(`[INVOICES] Unexpected error generating signed URL: ${error.message}`)
      return response.internalServerError({
        error: 'Failed to generate signed URL',
        details: error.message,
      })
    }
  }

  private async generatePdfInternal(userId: string, invoiceId: string, logger: any): Promise<string> {
    logger.info(`[INVOICES] Generating PDF for invoice ${invoiceId} by user ${userId}`)

    // Get invoice with all necessary data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id,
        title,
        total_amount,
        state,
        created_at,
        expiration_date,
        client_id,
        owner_id,
        clients (
          first_name,
          last_name,
          email,
          address,
          phone_number
        ),
        profiles!invoices_owner_id_fkey (
          display_name,
          email
        )
      `)
      .match({ id: invoiceId, owner_id: userId })
      .single()

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found')
    }

    // Get invoice items with item details
    const { data: invoiceItems, error: itemsError } = await supabase
      .from('invoice_items')
      .select(`
        item_id,
        quantity,
        unit_price,
        items (
          id,
          name,
          price
        )
      `)
      .eq('invoice_id', invoiceId)
      .is('deleted_at', null)

    if (itemsError) {
      throw new Error(`Failed to fetch invoice items: ${itemsError.message}`)
    }

    // Prepare data for PDF generation
    const invoiceData = {
      title: invoice.title,
      invoice_id: invoice.id,
      total_amount: invoice.total_amount || 0,
      state: invoice.state,
      created_at: new Date(invoice.created_at),
      expiration_date: invoice.expiration_date ? new Date(invoice.expiration_date) : undefined,
      owner_name: (invoice as any).profiles?.display_name || 'N/A',
      owner_email: (invoice as any).profiles?.email || 'N/A',
      client_first_name: (invoice as any).clients?.first_name || 'N/A',
      client_last_name: (invoice as any).clients?.last_name || 'N/A',
      client_email: (invoice as any).clients?.email || 'N/A',
      client_address: (invoice as any).clients?.address || '',
      client_phone: (invoice as any).clients?.phone_number || '',
      items: invoiceItems?.map(item => ({
        name: (item as any).items?.name || 'Unknown Item',
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
      })) || [],
    }

    logger.info(`[INVOICES] Generating PDF for invoice ${invoiceId}`)
    const pdfBuffer = await generateInvoicePdf(invoiceData)

    // Upload to storage
    const pdfUrl = await uploadInvoicePdfToStorage(userId, pdfBuffer, invoiceId)

    // Update invoice with PDF URL
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ pdf_url: pdfUrl })
      .eq('id', invoiceId)

    if (updateError) {
      logger.error(`[INVOICES] Error updating invoice with PDF URL: ${updateError.message}`)
      // Don't fail the request, PDF was generated successfully
    }

    logger.info(`[INVOICES] PDF generated and uploaded successfully for invoice ${invoiceId}`)
    return pdfUrl
  }

  public async generatePdf({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const invoiceId: string = params.id

    logger.info(`[INVOICES] Generating PDF for invoice ${invoiceId} by ${user.email}`)

    try {
      const pdfUrl = await this.generatePdfInternal(user.id, invoiceId, logger)
      
      return {
        message: 'PDF generated successfully',
        pdf_url: pdfUrl,
      }
    } catch (error: any) {
      logger.error(`[INVOICES] Error generating PDF: ${error.message}`)
      return response.internalServerError({
        error: 'Failed to generate PDF',
        details: error.message,
      })
    }
  }
}
