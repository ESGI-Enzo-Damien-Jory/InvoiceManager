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

export function getAllCookies(request: any): Array<{ name: string; value: string }> {
  const cookieHeader = request.header('cookie') || request.request?.headers?.cookie
  return parseCookies(cookieHeader || '')
}
