import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { createServerClient } from '@supabase/ssr'
import { getAllCookies } from '../utils/cookie_utils.js'

export default class SupabaseAuthMiddleware {
  async handle({ request, response, logger }: HttpContext, next: NextFn) {
    const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return getAllCookies(request)
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookie(name, value, {
              ...options,
              maxAge: 24 * 60 * 60 * 1000,
              httpOnly: true,
              secure: options?.secure ?? process.env.NODE_ENV === 'production',
              sameSite: 'strict',
            })
          })
        },
      },
    })

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
