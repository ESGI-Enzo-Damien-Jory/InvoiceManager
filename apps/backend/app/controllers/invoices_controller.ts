import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'
import { generateInvoicePdf } from '../pdf/generate_pdf.js'
import { randomUUID } from 'node:crypto'
import { uploadInvoicePdfToStorage } from '#services/invoice_service'
import { Readable } from 'node:stream'

export default class InvoicesController {
  public async index({ request, logger }: HttpContext) {
    const user = request.user
    logger.info(`[INVOICES] Fetching invoices for ${user.email}`)

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('owner_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error(`[INVOICES] Failed to fetch: ${error.message}`)
      throw new Error(error.message)
    }

    return data
  }

  public async store({ request, logger }: HttpContext) {
    const user = request.user
    const body = request.only(['client_id', 'title', 'total_amount', 'expiration_date'])

    logger.info(`[INVOICES] Creating invoice for user ${user.email}`)

    const invoiceId = randomUUID()

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        id: invoiceId,
        ...body,
        owner_id: user.id,
        state: 'Draft',
      })
      .select()

    if (error) {
      logger.error(`[INVOICES] Creation failed: ${error.message}`)
      throw new Error(error.message)
    }

    const pdfBuffer = await generateInvoicePdf({
      a: body.title,
      b: user.email!,
      c: `$${body.total_amount}`,
    })

    const pdfUrl = await uploadInvoicePdfToStorage(user.id, pdfBuffer, invoiceId)

    await supabase.from('invoices').update({ pdf_url: pdfUrl }).eq('id', invoiceId)

    logger.info(`[INVOICES] Invoice created with ID: ${invoiceId}`)
    return { ...data[0], pdf_url: pdfUrl }
  }

  public async update({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const body = request.only(['title', 'total_amount', 'expiration_date', 'state'])

    logger.info(`[INVOICES] Updating invoice ${params.id} for ${user.email}`)

    const pdfBuffer = await generateInvoicePdf({
      a: body.title,
      b: user.email!,
      c: `$${body.total_amount}`,
    })

    const pdfUrl = await uploadInvoicePdfToStorage(user.id, pdfBuffer, params.id)

    const { data, error } = await supabase
      .from('invoices')
      .update({
        ...body,
        pdf_url: pdfUrl,
      })
      .match({ id: params.id, owner_id: user.id })
      .select()

    if (error) {
      logger.error(`[INVOICES] Update failed for ${params.id}: ${error.message}`)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      logger.warn(`[INVOICES] No invoice found to update with ID: ${params.id}`)
      return response.notFound({ error: 'Invoice not found' })
    }

    logger.info(`[INVOICES] Invoice ${params.id} updated successfully`)
    return data
  }

  public async destroy({ request, params, logger }: HttpContext) {
    const user = request.user

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
  }

  public async show({ request, params, response, logger }: HttpContext) {
    const user = request.user

    logger.info(`[INVOICES] Fetching invoice ${params.id} for ${user.email}`)

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .match({ id: params.id, owner_id: user.id })
      .single()

    if (error) {
      logger.error(`[INVOICES] Error fetching invoice ${params.id}: ${error.message}`)
      return response.notFound({ error: 'Invoice not found' })
    }

    logger.info(`[INVOICES] Invoice ${params.id} fetched successfully`)
    return data
  }

  public async download({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const invoiceId = params.id
    const filePath = `${user.id}/invoices/${invoiceId}.pdf`

    logger.info(`[INVOICES] Downloading invoice ${invoiceId} for ${user.email}`)

    const { data: file, error } = await supabase.storage.from('invoices').download(filePath)

    if (error || !file) {
      logger.error(`[INVOICES] Error downloading PDF: ${error?.message}`)
      return response.notFound({ error: 'PDF not found' })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const stream = Readable.from(buffer)

    response.header('Content-Type', 'application/pdf')
    response.header('Content-Disposition', `inline; filename="${invoiceId}.pdf"`)

    return response.stream(stream)
  }

  public async preview({ request, params, response, logger }: HttpContext) {
    const user = request.user

    logger.info(`[INVOICES] Previewing invoice ${params.id} for ${user.email}`)

    const { data, error } = await supabase
      .from('invoices')
      .select('pdf_url')
      .match({ id: params.id, owner_id: user.id })
      .single()

    if (error || !data?.pdf_url) {
      logger.warn(`[INVOICES] Preview failed: PDF URL not found for invoice ${params.id}`)
      return response.notFound({ error: 'PDF not found' })
    }

    return { pdf_url: data.pdf_url }
  }
}
