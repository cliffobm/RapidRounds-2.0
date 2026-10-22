import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { DATABASE_CONFIGURED, SUPABASE_CONFIG, supabaseFetch } from '@/lib/env'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  if (!DATABASE_CONFIGURED) {
    if (
      request.nextUrl.pathname === '/account' ||
      request.nextUrl.pathname.startsWith('/account/')
    ) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }
    return NextResponse.json(
      { error: 'Development authentication is not configured' },
      { status: 503 }
    )
  }
  let response = NextResponse.next({ request })
  try {
    const supabase = createServerClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey,
      {
        global: { fetch: supabaseFetch },
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (entries) => {
            entries.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({ request })
            entries.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (!user || error) {
      const redirect = new URL('/auth/sign-in', request.url)
      redirect.searchParams.set('status', 'session-required')
      redirect.searchParams.set('redirectTo', request.nextUrl.pathname)
      const denied = NextResponse.redirect(redirect)
      response.cookies.getAll().forEach((cookie) => denied.cookies.set(cookie))
      return denied
    }
    return response
  } catch {
    return NextResponse.json(
      { error: 'Authentication is unavailable' },
      { status: 503 }
    )
  }
}

// Device preferences contain no account operations and are available without sign-in.
export const config = {
  matcher: ['/account/:path*', '/profile/:path*', '/admin/:path*'],
}
