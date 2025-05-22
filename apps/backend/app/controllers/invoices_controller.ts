import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'

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

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        ...body,
        owner_id: user.id,
        state: 'Draft',
      })
      .select()

    if (error) {
      logger.error(`[INVOICES] Creation failed: ${error.message}`)
      throw new Error(error.message)
    }

    logger.info(`[INVOICES] Invoice created with ID: ${(data?.[0] as any)?.id}`)
    return data
  }

  public async update({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const body = request.only(['title', 'total_amount', 'expiration_date', 'state'])

    logger.info(`[INVOICES] Updating invoice ${params.id} for ${user.email}`)

    const { data, error } = await supabase
      .from('invoices')
      .update(body)
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
}
