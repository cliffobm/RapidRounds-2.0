/** Only send users back to a local application path after authentication. */
export function safeAuthRedirect(value: string | null | undefined, fallback = '/'): string {
  if (!value) return fallback
  let decoded = value
  try {
    for (let attempt = 0; attempt < 4; attempt++) {
      if (!decoded.startsWith('/') || decoded.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(decoded)) return fallback
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
      if (attempt === 3) return fallback
    }
    const url = new URL(decoded, 'https://rapidrounds.invalid')
    if (url.origin !== 'https://rapidrounds.invalid' || url.pathname.startsWith('//')) return fallback
    // Avoid returning to a consumed callback or a sign-in loop.
    if (/^\/auth(?:\/(?:callback|confirm|sign-in))?\/?$/.test(url.pathname)) return fallback
    return value
  } catch {
    return fallback
  }
}

export function authCallbackUrl(origin: string, redirectTo = '/') {
  const url = new URL('/auth/callback', origin)
  url.searchParams.set('next', safeAuthRedirect(redirectTo))
  return url.toString()
}
