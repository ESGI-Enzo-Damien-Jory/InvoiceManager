import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { supabase } from '#start/supabase'

export default class SupabaseAuthMiddleware {
  async handle({ request, response, logger }: HttpContext, next: NextFn) {
    const authHeader = request.header('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      logger.warn('[AUTH] Missing Authorization token')
      return response.unauthorized({ error: 'Missing Authorization token' })
    }

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data?.user) {
      logger.warn(
        `[AUTH] Invalid or expired token. Reason: ${error?.message ?? 'No user returned'}`
      )
      return response.unauthorized({ error: 'Invalid or expired token' })
    }

    const { id, email } = data.user
    logger.info(`[AUTH] Authenticated user: ${email} (ID: ${id})`)
    request.user = data.user

    await next()
  }
}
