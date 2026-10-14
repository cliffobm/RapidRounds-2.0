import { NextResponse, type NextRequest } from 'next/server'

export function authRedirect(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url))
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
