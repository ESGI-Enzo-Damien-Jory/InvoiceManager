import { createServerClient } from '@supabase/ssr'
import type { Request, Response } from '@adonisjs/core/http'

export function createCookieClient(request: Request, response: Response) {
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
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
}

export function parseCookies(cookieHeader: string): Array<{ name: string; value: string }> {
  if (!cookieHeader) {
    return []
  }

  return cookieHeader
    .split(';')
    .map((cookie) => {
      const [name, ...rest] = cookie.trim().split('=')
      if (!name) return null

      const value = rest.join('=')
      return {
        name: name.trim(),
        value: decodeURIComponent(value || ''),
      }
    })
    .filter(
      (cookie): cookie is { name: string; value: string } => cookie !== null && cookie.name !== ''
    )
}

export function getAllCookies(request: Request): Array<{ name: string; value: string }> {
  const cookieHeader = request.header('cookie') || request.request?.headers?.cookie
  return parseCookies(cookieHeader || '')
}
