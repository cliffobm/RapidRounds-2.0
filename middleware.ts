import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Development authentication is not configured' }, { status: 503 })
  }
  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: entries => {
        entries.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        entries.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!user || error) {
      const redirect = request.nextUrl.clone()
      redirect.pathname = '/auth/sign-in'
      redirect.searchParams.set('redirectTo', request.nextUrl.pathname)
      const denied = NextResponse.redirect(redirect)
      response.cookies.getAll().forEach(cookie => denied.cookies.set(cookie))
      return denied
    }
    return response
  } catch {
    return NextResponse.json({ error: 'Authentication is unavailable' }, { status: 503 })
  }
}

export const config = { matcher: ['/profile/:path*', '/settings/:path*', '/admin/:path*'] }
