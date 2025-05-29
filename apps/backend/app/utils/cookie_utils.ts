import { createServerClient } from '@supabase/ssr'
import type { Request, Response } from '@adonisjs/core/http'

export function createCookieClient(request: Request, response: Response) {
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        const cookieHeader = request.header('cookie') || ''
        const cookies = parseCookies(cookieHeader)

        // Convert to the format Supabase expects
        return Object.entries(cookies).map(([name, value]) => ({
          name,
          value,
        }))
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Use AdonisJS plainCookie to avoid signing - this is key!
          response.plainCookie(name, value, {
            path: options?.path || '/',
            domain: options?.domain,
            maxAge: options?.maxAge ? `${options.maxAge}s` : undefined,
            httpOnly: options?.httpOnly ?? false, // Important: let Supabase control this
            secure: options?.secure ?? process.env.NODE_ENV === 'production',
            sameSite: (options?.sameSite as 'strict' | 'lax' | 'none' | undefined) || 'lax',
          })
        })
      },
    },
  })
}

export function parseCookies(cookieHeader: string): Record<string, string> {
  if (!cookieHeader) {
    return {}
  }

  const cookies: Record<string, string> = {}

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) {
      const value = rest.join('=')
      cookies[name.trim()] = decodeURIComponent(value || '')
    }
  })

  return cookies
}
