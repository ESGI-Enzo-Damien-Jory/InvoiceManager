import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'

export default class ClientsController {
  public async index({ request, logger }: HttpContext) {
    const user = request.user
    logger.info(`[CLIENTS] GET by ${user.email} (ID: ${user.id})`)

    const { count, error: countError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      logger.error(`[CLIENTS] Error fetching total count: ${countError.message}`)
    } else {
      logger.debug(`[CLIENTS] Total clients in DB: ${count}`)
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error(`[CLIENTS] Error fetching user clients: ${error.message}`)
      throw new Error(error.message)
    }

    logger.info(`[CLIENTS] Found ${data?.length ?? 0} active clients`)
    return data
  }

  public async store({ request, logger }: HttpContext) {
    const user = request.user
    const body = request.only(['first_name', 'last_name', 'email', 'phone_number', 'address'])

    logger.info(`[CLIENTS] Creating client for ${user.email}: ${body.first_name} ${body.last_name}`)

    const { data, error } = await supabase.from('clients').insert({ ...body, user_id: user.id })

    if (error) {
      logger.error(`[CLIENTS] Failed to create client: ${error.message}`)
      throw new Error(error.message)
    }

    logger.info(`[CLIENTS] Client created with ID: ${(data?.[0] as any)?.id}`)
    return data
  }

  public async update({ request, params, response, logger }: HttpContext) {
    const user = request.user
    const body = request.only(['first_name', 'last_name', 'email', 'phone_number', 'address'])

    logger.info(`[CLIENTS] Updating client ${params.id} for ${user.email}`)

    const { data, error } = await supabase
      .from('clients')
      .update(body)
      .match({ id: params.id, user_id: user.id })
      .select()

    if (error) {
      logger.error(`[CLIENTS] Failed to update client ${params.id}: ${error.message}`)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      logger.warn(`[CLIENTS] No client found to update with ID: ${params.id}`)
      return response.notFound({ error: 'Client not found' })
    }

    logger.info(`[CLIENTS] Client ${params.id} updated`)
    return data
  }

  public async destroy({ request, params, logger }: HttpContext) {
    const user = request.user
    logger.warn(`[CLIENTS] Deleting client ${params.id} for ${user.email}`)

    const { error } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .match({ id: params.id, user_id: user.id })

    if (error) {
      logger.error(`[CLIENTS] Failed to delete client ${params.id}: ${error.message}`)
      throw new Error(error.message)
    }

    logger.info(`[CLIENTS] Client ${params.id} soft-deleted`)
    return { deleted: true }
  }
}
