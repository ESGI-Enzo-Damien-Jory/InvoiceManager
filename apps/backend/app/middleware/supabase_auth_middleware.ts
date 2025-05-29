import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { createClient } from '@supabase/supabase-js'

export default class SupabaseAuthMiddleware {
  async handle({ request, response, logger }: HttpContext, next: NextFn) {
    const sessionCookie = request.plainCookie('supabase-session')

    if (!sessionCookie) {
      logger.warn('[AUTH] No session cookie found')
      return response.unauthorized({ error: 'No session found' })
    }

    try {
      const sessionData = JSON.parse(sessionCookie)

      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(sessionData.access_token)

      if (error || !user) {
        logger.warn(`[AUTH] Invalid session: ${error?.message ?? 'No user returned'}`)
        response.clearCookie('supabase-session')
        return response.unauthorized({ error: 'Invalid session' })
      }

      if (sessionData.expires_at && Date.now() / 1000 > sessionData.expires_at) {
        logger.warn('[AUTH] Session expired')
        response.clearCookie('supabase-session')
        return response.unauthorized({ error: 'Session expired' })
      }

      const { id, email } = user
      logger.info(`[AUTH] Authenticated user: ${email} (ID: ${id})`)

      request.user = user
      request.supabase = supabase

      await next()
    } catch (err: any) {
      logger.error(`[AUTH] Authentication error: ${err.message}`)
      response.clearCookie('supabase-session')
      return response.unauthorized({ error: 'Authentication failed' })
    }
  }
}
