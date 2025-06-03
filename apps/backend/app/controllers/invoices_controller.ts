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
          .from('users')
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
      'title',
      'total_amount',
      'expiration_date',
      'state',
      'client_id',
      'items',
    ])

    logger.info(`[INVOICES] Updating invoice ${invoiceId} for ${user.email}`)

    const { data: fullUser, error: userError } = await supabase
      .from('users')
      .select('display_name, email')
      .eq('id', user.id)
      .single()

    if (userError || !fullUser) {
      logger.error(`[INVOICES] User fetch failed: ${userError?.message}`)
      return response.badRequest({ error: 'User not found' })
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('first_name, last_name, email, address, phone_number')
      .eq('id', body.client_id)
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      logger.warn(`[INVOICES] Invalid client_id: ${body.client_id}`)
      return response.badRequest({ error: 'Client not found' })
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
        return response.badRequest({ error: err.message })
      }
    }

    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        title: body.title,
        total_amount: body.total_amount,
        expiration_date: body.expiration_date,
        state: body.state,
        client_id: body.client_id,
      })
      .match({ id: invoiceId, owner_id: user.id })
      .select()
      .single()

    if (updateError || !updatedInvoice) {
      logger.error(`[INVOICES] Update failed for ${invoiceId}: ${updateError?.message}`)
      return response.badRequest({ error: 'Failed to update invoice' })
    }

    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)

    if (body.items && body.items.length > 0) {
      const itemRows = body.items.map((item: any) => ({
        invoice_id: invoiceId,
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))

      const { error: insertItemsError } = await supabase.from('invoice_items').insert(itemRows)
      if (insertItemsError) {
        return response.badRequest({ error: 'Failed to update invoice items' })
      }
    }

    let pdfUrl: string | null = null
    let signedUrl: string | null = null

    if (body.state !== 'Draft') {
      try {
        const pdfBuffer = await generateInvoicePdf({
          title: body.title,
          invoice_id: invoiceId,
          total_amount: body.total_amount,
          state: body.state,
          created_at: new Date(updatedInvoice.created_at),
          expiration_date: body.expiration_date,

          owner_name: fullUser.display_name,
          owner_email: fullUser.email,

          client_first_name: client.first_name,
          client_last_name: client.last_name,
          client_email: client.email,
          client_address: client.address,
          client_phone: client.phone_number,
          items: itemsWithDetails,
        })

        pdfUrl = await uploadInvoicePdfToStorage(user.id, pdfBuffer, invoiceId)
        await supabase.from('invoices').update({ pdf_url: pdfUrl }).eq('id', invoiceId)

        const { signedUrl: generatedSignedUrl, error: signedUrlError } = await generatePdfSignedUrl(
          user.id,
          invoiceId
        )

        if (signedUrlError) {
          logger.warn(`[INVOICES] Failed to generate signed URL: ${signedUrlError}`)
        } else {
          signedUrl = generatedSignedUrl
        }
      } catch (uploadErr: any) {
        logger.error(`[INVOICES] Failed to upload PDF: ${uploadErr.message}`)
        return response.status(422).send({ error: `Failed to upload PDF: ${uploadErr.message}` })
      }
    }

    logger.info(`[INVOICES] Invoice ${invoiceId} updated successfully`)

    // Include signed URL in response if available
    const responseData = {
      ...updatedInvoice,
      pdf_url: pdfUrl,
      ...(signedUrl && { signed_url: signedUrl }),
    }

    return responseData
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
