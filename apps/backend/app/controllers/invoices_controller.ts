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
import { Readable } from 'node:stream'

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

    return data
  }

  public async store({ request, response, logger }: HttpContext) {
    const user = request.user
    const body = request.only([
      'client_id',
      'title',
      'total_amount',
      'expiration_date',
      'state',
      'items',
    ])
    const invoiceId = randomUUID()

    logger.info(`[INVOICES] Creating invoice for user ${user.email}`)

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

    if (body.state !== 'Draft') {
      try {
        const { data: owner } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', user.id)
          .single()

        const pdfBuffer = await generateInvoicePdf({
          title: body.title,
          invoice_id: invoiceId,
          total_amount: body.total_amount,
          state: body.state,
          created_at: new Date(),
          expiration_date: body.expiration_date ? new Date(body.expiration_date) : undefined,

          owner_name: owner!.display_name,
          owner_email: owner!.email,
          client_first_name: client.first_name,
          client_last_name: client.last_name,
          client_email: client.email,
          client_address: client.address || undefined,
          client_phone: client.phone_number || undefined,
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

    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        id: invoiceId,
        client_id: body.client_id,
        title: body.title,
        total_amount: body.total_amount,
        expiration_date: body.expiration_date,
        state: body.state ?? 'Draft',
        owner_id: user.id,
        pdf_url: pdfUrl,
      })
      .select()
      .single()

    if (invoiceError || !invoiceData) {
      logger.error(`[INVOICES] Invoice insert failed: ${invoiceError?.message}`)
      return response.status(500).send({ error: 'Failed to create invoice' })
    }

    if (body.items && body.items.length > 0) {
      try {
        await insertInvoiceItems(user.id, invoiceId, body.items)
      } catch (err: any) {
        logger.error(`[INVOICES] Item insert failed: ${err.message}`)
        return response.status(422).send({ error: 'Invoice created, but item insertion failed' })
      }
    }

    logger.info(`[INVOICES] Invoice ${invoiceId} created successfully`)

    const responseData = {
      ...invoiceData,
      pdf_url: pdfUrl,
      ...(signedUrl && { signed_url: signedUrl }),
    }

    return responseData
  }

  public async update({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const invoiceId = params.id
    const body = request.only([
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

      const currentState = invoice.state
      const newState = body.state || currentState

      if (body.state) {
        const allowedStates = ['Draft', 'Sent', 'Cancelled', 'Paid', 'Overdue']
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

      if (currentState === 'Sent' || currentState === 'Paid' || currentState === 'Overdue') {
        if (!body.state || currentState === newState) {
          logger.warn(
            `[INVOICES] Attempted to modify fields of invoice ${invoiceId} in non-modifiable state: ${currentState}`
          )
          return response
            .status(422)
            .send({ error: `Cannot modify invoice fields in ${currentState} state` })
        }
      }

      if (currentState === newState && !body.state) {
        if (currentState !== 'Draft') {
          logger.warn(
            `[INVOICES] Attempted to modify fields of invoice ${invoiceId} in state: ${currentState}`
          )
          return response.status(422).send({ error: `Can only modify fields of Draft invoices` })
        }
      } else if (currentState === newState && body.state) {
        if (newState === 'Draft') {
        } else {
          logger.info(
            `[INVOICES] Invoice ${invoiceId} already in state "${newState}", no update needed`
          )
          return invoice
        }
      }

      if (currentState === 'Cancelled' && newState === 'Draft' && body.state) {
        const { data: updatedInvoice, error: updateError } = await supabase
          .from('invoices')
          .update({ state: newState })
          .eq('id', invoiceId)
          .select()
          .single()

        if (updateError || !updatedInvoice) {
          logger.error(`[INVOICES] Failed to update invoice state: ${updateError?.message}`)
          return response.internalServerError({ error: 'Failed to update invoice state' })
        }

        logger.info(`[INVOICES] Invoice ${invoiceId} state changed from Cancelled to Draft`)
        return updatedInvoice
      }

      const updateData: any = {}

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

      if (body.items && currentState === 'Draft') {
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
        return updatedInvoice
      }

      logger.info(`[INVOICES] Generating PDF for transition from Draft to Sent`)

      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('first_name, last_name, email, address, phone_number')
        .eq('id', updatedInvoice.client_id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single()

      if (clientError || !client) {
        logger.error(`[INVOICES] Client ${updatedInvoice.client_id} not found or unauthorized`)
        return response.badRequest({ error: 'Client data required for PDF generation' })
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        logger.error(`[INVOICES] Failed to fetch user profile: ${profileError?.message}`)
        return response.badRequest({ error: 'User profile not found' })
      }

      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('quantity, unit_price, item_id, items (name)')
        .eq('invoice_id', invoiceId)

      if (itemsError || !items) {
        logger.warn(`[INVOICES] No items found for invoice ${invoiceId}`)
      }

      const itemsWithDetails = (items || []).map((row: any) => ({
        name: row.items?.name,
        quantity: row.quantity,
        unit_price: row.unit_price,
      }))

      const pdfBuffer = await generateInvoicePdf({
        title: updatedInvoice.title,
        invoice_id: updatedInvoice.id,
        total_amount: updatedInvoice.total_amount,
        state: updatedInvoice.state,
        created_at: new Date(updatedInvoice.created_at),
        expiration_date: updatedInvoice.expiration_date
          ? new Date(updatedInvoice.expiration_date)
          : undefined,
        owner_name: profile.display_name,
        owner_email: profile.email,
        client_first_name: client.first_name,
        client_last_name: client.last_name,
        client_email: client.email,
        client_address: client.address,
        client_phone: client.phone_number,
        items: itemsWithDetails,
      })

      const pdfUrl = await uploadInvoicePdfToStorage(user.id, pdfBuffer, invoiceId)
      await supabase.from('invoices').update({ pdf_url: pdfUrl }).eq('id', invoiceId)

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
        ...updatedInvoice,
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

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ deleted_at: new Date().toISOString() })
        .match({ id: params.id, owner_id: user.id })

      if (error) {
        logger.error(`[INVOICES] Failed to delete ${params.id}: ${error.message}`)
        throw new Error(error.message)
      }

      logger.warn(`[INVOICES] Soft-deleted invoice ${params.id}`)
      return { deleted: true }
    } catch (error) {
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
      return data
    } catch (error) {
      logger.error(`[INVOICES] Unexpected error fetching invoice: ${error.message}`)
      return response.internalServerError({
        error: 'Failed to fetch invoice',
        details: error.message,
      })
    }
  }

  public async download({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const invoiceId = params.id
    const filePath = `${user.id}/invoices/${invoiceId}.pdf`

    logger.info(`[INVOICES] Downloading invoice ${invoiceId} for ${user.email}`)

    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, title')
        .match({ id: invoiceId, owner_id: user.id })
        .single()

      if (invoiceError || !invoice) {
        logger.warn(`[INVOICES] Invoice ${invoiceId} not found for user ${user.email}`)
        return response.notFound({ error: 'Invoice not found' })
      }

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
      const stream = Readable.from(buffer)

      const filename = invoice.title
        ? `${invoice.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${invoiceId.substring(0, 8)}.pdf`
        : `invoice-${invoiceId.substring(0, 8)}.pdf`

      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', `inline; filename="${filename}"`)

      logger.info(`[INVOICES] PDF download successful for invoice ${invoiceId}`)
      return response.stream(stream)
    } catch (error) {
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

      if (!data?.pdf_url) {
        logger.warn(`[INVOICES] PDF URL not found for invoice ${params.id}`)
        return response.notFound({ error: 'PDF not available for preview' })
      }

      logger.info(`[INVOICES] Preview URL retrieved for invoice ${params.id}`)
      return { pdf_url: data.pdf_url }
    } catch (error) {
      logger.error(`[INVOICES] Unexpected error during preview: ${error.message}`)
      return response.internalServerError({
        error: 'Failed to get preview',
        details: error.message,
      })
    }
  }

  public async generateSignedUrl({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const invoiceId = params.id
    const { expiresIn, download, filename } = request.only(['expiresIn', 'download', 'filename'])

    logger.info(`[INVOICES] Generating signed URL for invoice ${invoiceId} by ${user.email}`)

    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, title, state')
        .match({ id: invoiceId, owner_id: user.id })
        .single()

      if (invoiceError || !invoice) {
        logger.warn(`[INVOICES] Invoice ${invoiceId} not found for user ${user.email}`)
        return response.notFound({ error: 'Invoice not found' })
      }

      if (invoice.state === 'Draft') {
        logger.warn(`[INVOICES] Attempted to generate signed URL for draft invoice ${invoiceId}`)
        return response.badRequest({ error: 'Cannot generate signed URL for draft invoice' })
      }

      const options: any = {}

      if (expiresIn) {
        options.expiresIn = expiresIn
      }

      if (download) {
        options.download = filename || invoice.title || `invoice-${invoiceId.substring(0, 8)}`
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

      logger.info(`[INVOICES] Signed URL generated for invoice ${invoiceId}`)
      return {
        signed_url: signedUrl,
        expires_at: expirationDate.toISOString(),
        expires_in_seconds: actualExpiresIn,
      }
    } catch (error) {
      logger.error(`[INVOICES] Unexpected error generating signed URL: ${error.message}`)
      return response.internalServerError({
        error: 'Failed to generate signed URL',
        details: error.message,
      })
    }
  }
}
