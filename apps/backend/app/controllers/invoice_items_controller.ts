import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'
import {
  InvoiceItem,
  Insert,
  Update,
  CreateInvoiceItemPayload,
  UpdateInvoiceItemPayload,
} from '@inma/types'

interface InvoiceItemWithItem extends InvoiceItem {
  items: {
    name: string
    price: number
  }
}

export default class InvoiceItemsController {
  public async index({ params, request, logger }: HttpContext) {
    const user = request.user
    const invoiceId: string = params.invoice_id

    logger.info(`[INVOICE_ITEMS] Fetching items for invoice ${invoiceId} by ${user.email}`)

    const { data, error } = await supabase
      .from('invoice_items')
      .select('*, items(name, price)')
      .eq('invoice_id', invoiceId)
      .is('deleted_at', null)

    if (error) {
      logger.error(`[INVOICE_ITEMS] Fetch failed for invoice ${invoiceId}: ${error.message}`)
      throw new Error(error.message)
    }

    logger.info(`[INVOICE_ITEMS] Found ${data?.length ?? 0} items`)
    return data as InvoiceItemWithItem[]
  }

  public async store({ request, logger }: HttpContext) {
    const user = request.user
    const body: CreateInvoiceItemPayload = request.only([
      'invoice_id',
      'item_id',
      'quantity',
      'unit_price',
    ])

    logger.info(
      `[INVOICE_ITEMS] Adding item ${body.item_id} to invoice ${body.invoice_id} by ${user.email}`
    )

    const insertData: Insert<'invoice_items'> = body

    const { data, error } = await supabase
      .from('invoice_items')
      .upsert([insertData], { onConflict: 'invoice_id,item_id' })
      .select()

    if (error) {
      logger.error(`[INVOICE_ITEMS] Insert failed: ${error.message}`)
      throw new Error(error.message)
    }

    logger.info(`[INVOICE_ITEMS] Item added or updated`)
    return data as InvoiceItem[]
  }

  public async update({ params, request, response, logger }: HttpContext) {
    const user = request.user
    const { invoice_id: invoiceId, item_id: itemId } = params
    const body: UpdateInvoiceItemPayload = request.only(['quantity', 'unit_price'])

    logger.info(`[INVOICE_ITEMS] Updating item ${itemId} on invoice ${invoiceId} by ${user.email}`)

    const updateData: Update<'invoice_items'> = body

    const { data, error } = await supabase
      .from('invoice_items')
      .update(updateData)
      .match({ invoice_id: invoiceId, item_id: itemId })
      .is('deleted_at', null)
      .select()

    if (error) {
      logger.error(`[INVOICE_ITEMS] Update failed: ${error.message}`)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      logger.warn(`[INVOICE_ITEMS] No matching item to update`)
      return response.notFound({ error: 'Invoice item not found' })
    }

    logger.info(`[INVOICE_ITEMS] Updated item ${itemId} on invoice ${invoiceId}`)
    return data as InvoiceItem[]
  }

  public async destroy({ params, request, response, logger }: HttpContext) {
    const user = request.user
    const { invoice_id: invoiceId, item_id: itemId } = params

    logger.info(
      `[INVOICE_ITEMS] Soft deleting item ${itemId} from invoice ${invoiceId} by ${user.email}`
    )

    const deleteData: Update<'invoice_items'> = { deleted_at: new Date().toISOString() }

    const { data, error } = await supabase
      .from('invoice_items')
      .update(deleteData)
      .match({ invoice_id: invoiceId, item_id: itemId })
      .is('deleted_at', null)
      .select()

    if (error) {
      logger.error(`[INVOICE_ITEMS] Deletion failed: ${error.message}`)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      logger.warn(`[INVOICE_ITEMS] No matching item to delete`)
      return response.notFound({ error: 'Invoice item not found' })
    }

    logger.info(`[INVOICE_ITEMS] Soft-deleted item ${itemId} on invoice ${invoiceId}`)
    return { deleted: true }
  }
}
