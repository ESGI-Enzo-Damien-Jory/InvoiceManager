import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'

export default class UsersController {
  public async show({ request }: HttpContext) {
    const user = request.user

    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, email, phone_number, updated_at')
      .eq('id', user.id)
      .single()

    if (error) {
      throw new Error(`[USER] Failed to fetch profile: ${error.message}`)
    }

    return data
  }

  public async update({ request, logger }: HttpContext) {
    const user = request.user
    const updates = request.only(['display_name', 'phone_number'])

    logger.info(`[USER] Updating user ${user.id}`)

    const { data, error } = await supabase.from('users').update(updates).eq('id', user.id).select()

    if (error) {
      logger.error(`[USER] Update failed: ${error.message}`)
      throw new Error(error.message)
    }

    logger.info(`[USER] Profile updated for ${user.email}`)
    return data?.[0]
  }
}
