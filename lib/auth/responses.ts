import { NextResponse, type NextRequest } from 'next/server'
import { APP_CONFIG } from '@/lib/env'

export function authRedirect(request: NextRequest, path: string) {
  // Next's internal request URL can use a different hostname behind a proxy.
  // A configured origin preserves cookie scope and avoids trusting Host headers.
  const response = NextResponse.redirect(new URL(path, APP_CONFIG.url))
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
