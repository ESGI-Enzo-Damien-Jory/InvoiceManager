import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'

export default class InvoiceItemsController {
  public async index({ params, request, logger }: HttpContext) {
    const user = request.user
    const invoiceId = params.invoice_id

    logger.info(`[INVOICE_ITEMS] Fetching items for invoice ${invoiceId} by ${user.email}`)

    const { data, error } = await supabase
      .from('invoice_items')
      .select('*, items(name, price)')
      .eq('invoice_id', invoiceId)
      .is('deleted_at', null)

    if (error) {
      logger.error(`[INVOICE_ITEMS] Fetch failed: ${error.message}`)
      throw new Error(error.message)
    }

    return data
  }

  public async store({ request, logger }: HttpContext) {
    const user = request.user
    const body = request.only(['invoice_id', 'item_id', 'quantity', 'unit_price'])

    logger.info(
      `[INVOICE_ITEMS] Adding item ${body.item_id} to invoice ${body.invoice_id} by ${user.email}`
    )

    const { data, error } = await supabase.from('invoice_items').upsert([body]).select()

    if (error) {
      logger.error(`[INVOICE_ITEMS] Insert failed: ${error.message}`)
      throw new Error(error.message)
    }

    return data
  }

  public async update({ params, request, response, logger }: HttpContext) {
    const user = request.user
    const { invoice_id: invoiceId, item_id: itemId } = params
    const body = request.only(['quantity', 'unit_price'])

    logger.info(`[INVOICE_ITEMS] Updating item ${itemId} on invoice ${invoiceId} by ${user.email}`)

    const { data, error } = await supabase
      .from('invoice_items')
      .update(body)
      .match({ invoice_id: invoiceId, item_id: itemId })
      .select()

    if (error) {
      logger.error(`[INVOICE_ITEMS] Update failed: ${error.message}`)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return response.notFound({ error: 'Invoice item not found' })
    }

    logger.info(`[INVOICE_ITEMS] Item ${itemId} updated on invoice ${invoiceId}`)
    return data
  }

  public async destroy({ params, request, response, logger }: HttpContext) {
    const user = request.user
    const { invoice_id: invoiceId, item_id: itemId } = params

    logger.info(
      `[INVOICE_ITEMS] Removing item ${itemId} from invoice ${invoiceId} by ${user.email}`
    )

    const { data, error } = await supabase
      .from('invoice_items')
      .update({ deleted_at: new Date().toISOString() })
      .match({ invoice_id: invoiceId, item_id: itemId })
      .select()

    if (error) {
      logger.error(`[INVOICE_ITEMS] Deletion failed: ${error.message}`)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return response.notFound({ error: 'Invoice item not found' })
    }

    logger.info(`[INVOICE_ITEMS] Item ${itemId} removed from invoice ${invoiceId}`)
    return { deleted: true }
  }
}
