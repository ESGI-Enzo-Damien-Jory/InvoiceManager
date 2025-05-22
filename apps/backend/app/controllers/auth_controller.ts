import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'
import env from '#start/env'

export default class AuthController {
  public async login({ request, response, logger }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    logger.info(`[AUTH] Login attempt for ${email}`)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      logger.warn(`[AUTH] Login failed for ${email}: ${error.message}`)
      return response.unauthorized({ error: error.message })
    }

    logger.info(`[AUTH] Login successful for ${email}`)
    return { token: data.session?.access_token, user: data.user }
  }

  public async register({ request, response, logger }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    logger.info(`[AUTH] Registration attempt for ${email}`)

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      logger.warn(`[AUTH] Registration failed for ${email}: ${error.message}`)
      return response.badRequest({ error: error.message })
    }

    logger.info(`[AUTH] Registration successful for ${email}`)
    return { message: 'Check your email for verification', user: data.user }
  }

  public async logout({ response, logger }: HttpContext) {
    const { error } = await supabase.auth.signOut()

    if (error) {
      logger.error(`[AUTH] Logout failed: ${error.message}`)
      return response.internalServerError({ error: error.message })
    }

    logger.info('[AUTH] Logout successful')
    return { message: 'Logged out' }
  }

  public async reset({ request, response, logger }: HttpContext) {
    const { email } = request.only(['email'])
    logger.info(`[AUTH] Password reset requested for ${email}`)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.get('FRONTEND_URL')}/auth/reset-callback`,
    })

    if (error) {
      logger.warn(`[AUTH] Reset email failed for ${email}: ${error.message}`)
      return response.badRequest({ error: error.message })
    }

    return { message: 'Password reset email sent' }
  }

  public async update({ request, response }: HttpContext) {
    const user = request.user
    const { display_name } = request.only(['display_name'])

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        ...(display_name && { display_name }),
      },
    })

    if (authError) {
      return response.badRequest({ error: authError.message })
    }

    const { error: dbError } = await supabase
      .from('users')
      .update({
        ...(display_name && { display_name }),
      })
      .eq('id', user.id)

    if (dbError) {
      return response.badRequest({ error: dbError.message })
    }

    return { message: 'User updated successfully' }
  }
}
