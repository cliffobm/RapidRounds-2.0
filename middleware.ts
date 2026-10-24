import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  DATABASE_CONFIGURED,
  REVIEW_AUTH_ONLY,
  SUPABASE_CONFIG,
  supabaseFetch,
} from '@/lib/env'
import {
  isPublicTesterResource,
  safeTesterDestination,
  testerPublicPages,
  TESTER_REVIEW_HOST,
} from '@/lib/tester-access'

export const runtime = 'nodejs'

function privateResponse(response: NextResponse, gated: boolean) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  if (gated)
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  return response
}

export async function middleware(request: NextRequest) {
  const gated =
    process.env.RR_REQUIRE_TESTER_LOGIN === 'true' ||
    request.nextUrl.hostname === TESTER_REVIEW_HOST
  const pathname = request.nextUrl.pathname
  const readable = request.method === 'GET' || request.method === 'HEAD'
  const api = pathname === '/api' || pathname.startsWith('/api/')
  if (gated) {
    // This App Router review app has no Pages Router JSON data endpoints.
    // Deny these machine requests rather than letting Next rewrite a login
    // redirect into an invalid /_next/data/... URL.
    if (
      pathname.startsWith('/_next/data/') ||
      request.headers.get('x-nextjs-data') === '1'
    )
      return privateResponse(
        NextResponse.json(
          { error: 'Tester sign-in is required' },
          { status: 401 }
        ),
        true
      )
    // Auth goes directly to the isolated Supabase Auth service. Review builds
    // must never execute the inherited payment, AI, metrics or database APIs.
    if (api && REVIEW_AUTH_ONLY)
      return privateResponse(
        NextResponse.json(
          {
            error:
              'Cloud endpoints are unavailable in the tester review edition',
          },
          { status: 503 }
        ),
        true
      )
    if (isPublicTesterResource(pathname, request.nextUrl.search)) {
      if (readable) return NextResponse.next()
      return privateResponse(
        NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405, headers: { Allow: 'GET, HEAD' } }
        ),
        true
      )
    }
    if (testerPublicPages.includes(pathname)) {
      if (readable) return privateResponse(NextResponse.next(), true)
      return privateResponse(
        NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405, headers: { Allow: 'GET, HEAD' } }
        ),
        true
      )
    }
  } else if (
    !['/account', '/profile', '/admin'].some(
      (root) => pathname === root || pathname.startsWith(root + '/')
    )
  ) {
    return NextResponse.next()
  }
  function deny(notInvited = false) {
    if (!readable || api)
      return privateResponse(
        NextResponse.json(
          {
            error: notInvited
              ? 'This account does not have tester access'
              : 'Tester sign-in is required',
          },
          { status: notInvited ? 403 : 401 }
        ),
        gated
      )
    const redirect = new URL(
      gated ? '/tester-login' : '/auth/sign-in',
      request.url
    )
    redirect.searchParams.set(
      'status',
      notInvited ? 'tester-not-invited' : 'session-required'
    )
    redirect.searchParams.set(
      'redirectTo',
      gated
        ? safeTesterDestination(pathname + request.nextUrl.search)
        : pathname
    )
    return privateResponse(NextResponse.redirect(redirect), gated)
  }
  if (!DATABASE_CONFIGURED) {
    if (gated) return deny()
    if (
      request.nextUrl.pathname === '/account' ||
      request.nextUrl.pathname.startsWith('/account/')
    ) {
      return privateResponse(
        NextResponse.redirect(new URL('/auth/sign-in', request.url)),
        false
      )
    }
    return privateResponse(
      NextResponse.json(
        { error: 'Development authentication is not configured' },
        { status: 503 }
      ),
      false
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
    if (!user || error || (gated && user.is_anonymous)) {
      const denied = deny()
      response.cookies.getAll().forEach((cookie) => denied.cookies.set(cookie))
      return denied
    }
    if (
      gated &&
      !(process.env.RR_TESTER_USER_IDS ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
        .includes(user.id)
    ) {
      const denied = deny(true)
      response.cookies.getAll().forEach((cookie) => denied.cookies.set(cookie))
      return denied
    }
    return privateResponse(response, gated)
  } catch {
    const unavailable = privateResponse(
      NextResponse.json(
        { error: 'Authentication is unavailable' },
        { status: 503 }
      ),
      gated
    )
    response.cookies
      .getAll()
      .forEach((cookie) => unavailable.cookies.set(cookie))
    return unavailable
  }
}

// Broad matching is intentional: future pages, RSC/prefetch and data requests
// cannot escape the gate through a filename suffix or a route added later.
export const config = {
  matcher: ['/:path*'],
}
