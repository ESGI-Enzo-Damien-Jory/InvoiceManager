import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'
import { Item, Insert, Update, CreateItemPayload, UpdateItemPayload } from '@inma/types'

export default class ItemsController {
  public async index({ request, logger }: HttpContext) {
    const user = request.user
    logger.info(`[ITEMS] GET /items for user ${user.email}`)

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('owner_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error(`[ITEMS] Failed to fetch items: ${error.message}`)
      throw new Error(error.message)
    }

    const items = data as Item[]
    logger.info(`[ITEMS] Found ${items.length} items`)
    return items
  }

  public async store({ request, logger }: HttpContext) {
    const user = request.user
    const body: CreateItemPayload = request.only(['name', 'price'])

    logger.info(`[ITEMS] Creating item '${body.name}' for user ${user.email}`)

    const insertData: Insert<'items'> = {
      ...body,
      owner_id: user.id,
    }

    const { data, error } = await supabase.from('items').insert(insertData).select()

    if (error) {
      logger.error(`[ITEMS] Failed to create item: ${error.message}`)
      throw new Error(error.message)
    }

    const items = data as Item[]
    logger.info(`[ITEMS] Item created with ID: ${items[0]?.id}`)
    return items
  }

  public async update({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const body: UpdateItemPayload = request.only(['name', 'price'])
    const itemId: string = params.id

    logger.info(`[ITEMS] Attempting to update item ${itemId} for ${user.email}`)

    const updateData: Update<'items'> = body

    const { data, error } = await supabase
      .from('items')
      .update(updateData)
      .match({ id: itemId, owner_id: user.id })
      .is('deleted_at', null)
      .select()

    if (error) {
      logger.error(`[ITEMS] Update failed for ${itemId}: ${error.message}`)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      logger.warn(`[ITEMS] No item found to update with ID: ${itemId}`)
      return response.notFound({ error: 'Item not found' })
    }

    const items = data as Item[]
    logger.info(`[ITEMS] Item ${itemId} updated`)
    return items
  }

  public async destroy({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const itemId: string = params.id

    logger.warn(`[ITEMS] Soft-deleting item ${itemId} for user ${user.email}`)

    const deleteData: Update<'items'> = {
      deleted_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('items')
      .update(deleteData)
      .match({ id: itemId, owner_id: user.id })
      .is('deleted_at', null)
      .select()

    if (error) {
      logger.error(`[ITEMS] Failed to delete item ${itemId}: ${error.message}`)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      logger.warn(`[ITEMS] No item found to delete with ID: ${itemId}`)
      return response.notFound({ error: 'Item not found' })
    }

    logger.info(`[ITEMS] Item ${itemId} soft-deleted`)
    return { deleted: true }
  }

  public async show({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const itemId: string = params.id

    logger.info(`[ITEMS] Fetching item ${itemId} for user ${user.email}`)

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .match({ id: itemId, owner_id: user.id })
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      logger.error(`[ITEMS] Error fetching item ${itemId}: ${error?.message || 'Not found'}`)
      return response.notFound({ error: 'Item not found' })
    }

    const item = data as Item
    logger.info(`[ITEMS] Item ${itemId} fetched successfully`)
    return item
  }
}
