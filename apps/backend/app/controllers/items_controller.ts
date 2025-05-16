import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'

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

    logger.info(`[ITEMS] Found ${data.length} items`)
    return data
  }

  public async store({ request, logger }: HttpContext) {
    const user = request.user
    const body = request.only(['name', 'price'])

    logger.info(`[ITEMS] Creating item '${body.name}' for user ${user.email}`)

    const { data, error } = await supabase
      .from('items')
      .insert({ ...body, owner_id: user.id })
      .select()

    if (error) {
      logger.error(`[ITEMS] Failed to create item: ${error.message}`)
      throw new Error(error.message)
    }

    logger.info(`[ITEMS] Item created with ID: ${(data?.[0] as any)?.id}`)
    return data
  }

  public async update({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const body = request.only(['name', 'price'])

    logger.info(`[ITEMS] Attempting to update item ${params.id} for ${user.email}`)

    const { data, error } = await supabase
      .from('items')
      .update(body)
      .match({ id: params.id, owner_id: user.id })
      .select()

    if (error) {
      logger.error(`[ITEMS] Update failed for ${params.id}: ${error.message}`)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      logger.warn(`[ITEMS] No item found to update with ID: ${params.id}`)
      return response.notFound({ error: 'Item not found' })
    }

    logger.info(`[ITEMS] Item ${params.id} updated`)
    return data
  }

  public async destroy({ request, params, logger }: HttpContext) {
    const user = request.user

    logger.warn(`[ITEMS] Soft-deleting item ${params.id} for user ${user.email}`)

    const { error } = await supabase
      .from('items')
      .update({ deleted_at: new Date().toISOString() })
      .match({ id: params.id, owner_id: user.id })

    if (error) {
      logger.error(`[ITEMS] Failed to delete item ${params.id}: ${error.message}`)
      throw new Error(error.message)
    }

    logger.info(`[ITEMS] Item ${params.id} soft-deleted`)
    return { deleted: true }
  }
}
