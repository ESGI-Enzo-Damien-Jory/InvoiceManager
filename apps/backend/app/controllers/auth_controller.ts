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

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      logger.error(`[AUTH] Failed to fetch profile for ${email}: ${profileError.message}`)
      return response.internalServerError({ error: 'Failed to retrieve user profile' })
    }

    logger.info(`[AUTH] Login successful for ${email}`)
    return {
      token: data.session?.access_token,
      user: {
        ...data.user,
        display_name: profile.display_name,
      },
    }
  }

  public async register({ request, response, logger }: HttpContext) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { email, password, display_name } = request.only(['email', 'password', 'display_name'])

    if (!display_name) {
      return response.badRequest({ error: 'Display name is required' })
    }

    logger.info(`[AUTH] Registration attempt for ${email}`)

    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (fetchError) {
      logger.error(`[AUTH] Error checking existing user for ${email}: ${fetchError.message}`)
      return response.internalServerError({ error: fetchError.message })
    }

    if (existingUsers && existingUsers.length > 0) {
      logger.warn(`[AUTH] Registration conflict for ${email}: User already exists`)
      return response.conflict({ error: 'User with this email already exists' })
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name },
      },
    })

    if (error) {
      logger.warn(`[AUTH] Registration failed for ${email}: ${error.message}`)
      return response.badRequest({ error: error.message })
    }

    logger.info(`[AUTH] Registration successful for ${email}`)

    if (data.user) {
      await supabase.from('users').update({ display_name }).eq('id', data.user.id)
    }

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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { display_name, phone_number } = request.only(['display_name', 'phone_number'])

    if (display_name) {
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name },
      })

      if (authError) {
        return response.badRequest({ error: authError.message })
      }
    }

    const { error: dbError } = await supabase
      .from('users')
      .update({
        ...(display_name && { display_name }),
        ...(phone_number && { phone_number }),
      })
      .eq('id', user.id)

    if (dbError) {
      return response.badRequest({ error: dbError.message })
    }

    return { message: 'User updated successfully' }
  }
}
