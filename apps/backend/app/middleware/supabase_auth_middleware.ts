import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { createCookieClient } from '../utils/cookie_utils.js'

export default class SupabaseAuthMiddleware {
  async handle({ request, response, logger }: HttpContext, next: NextFn) {
    const supabase = createCookieClient(request, response)

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        logger.warn(
          `[AUTH] Invalid or expired session. Reason: ${error?.message ?? 'No user returned'}`
        )
        return response.unauthorized({ error: 'Invalid or expired session' })
      }

      const { id, email } = user
      logger.info(`[AUTH] Authenticated user: ${email} (ID: ${id})`)

      request.user = user
      request.supabase = supabase

      await next()
    } catch (err: any) {
      logger.error(`[AUTH] Authentication error: ${err.message}`)
      return response.unauthorized({ error: 'Authentication failed' })
    }
  }
}
