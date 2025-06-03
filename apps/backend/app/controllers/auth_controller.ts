import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#start/supabase'
import env from '#start/env'

export default class AuthController {
  public async login({ request, response, logger }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    logger.info(`[AUTH] Login attempt for ${email}`)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      logger.warn(`[AUTH] Login failed for ${email}: ${error.message}`)
      return response.unauthorized({ error: error.message })
    }

    if (data.session) {
      const sessionData = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user_id: data.user.id,
      }

      response.plainCookie('supabase-session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: '24h',
        path: '/',
      })
    }

    logger.info(`[AUTH] Login successful for ${email}`)
    return { message: 'Logged in successfully' }
  }

  public async register({ request, response, logger }: HttpContext) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { email, password, display_name } = request.only(['email', 'password', 'display_name'])
    logger.info('[AUTH] Verifying registration data')

    if (!display_name) {
      return response.badRequest({ error: 'Display name is required' })
    }

    const displayNameRegex = /^(?=.*\s)[a-zA-ZÀ-ÿ\- ]{6,50}$/

    if (!displayNameRegex.test(display_name)) {
      return response.badRequest({
        error:
          'Display name must be 6-50 characters, contain at least one space, and only use letters with or without accents, hyphens, and spaces',
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return response.badRequest({ error: 'Email is required' })
    }
    if (email.length > 80) {
      return response.badRequest({ error: 'Email must be at most 80 characters long' })
    }
    if (!emailRegex.test(email)) {
      return response.badRequest({ error: 'Email format is invalid' })
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
    if (!password) {
      return response.badRequest({ error: 'Password is required' })
    }
    if (!passwordRegex.test(password)) {
      return response.badRequest({
        error:
          'Password must be at least 8 characters long, include one capital letter and one special character',
      })
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
    response.clearCookie('supabase-session')

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
