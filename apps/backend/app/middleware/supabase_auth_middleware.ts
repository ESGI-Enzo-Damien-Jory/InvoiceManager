import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { supabase } from '#start/supabase'

export default class SupabaseAuthMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const authHeader = request.header('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return response.unauthorized({ error: 'Missing Authorization token' })
    }

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data?.user) {
      return response.unauthorized({ error: 'Invalid or expired token' })
    }

    console.log('✅ Authenticated user:', data.user)
    console.log('🧠 request.user before:', request.user)

    // Attach the Supabase user to the request for use in controllers

    request.user = data.user
    console.log('🧠 request.user after:', request.user)

    // Continue to next handler
    await next()
  }
}
