import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Use Node.js runtime for better performance and compatibility
export const runtime = 'nodejs'

// Supabase configuration - directly using env vars in middleware since lib/env is client-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'local-development-key'

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets and API routes that don't need auth
  const { pathname } = request.nextUrl
  const isProtectedRoute = ['/profile', '/settings', '/admin', '/auth/reset-password'].some(route => pathname === route || pathname.startsWith(`${route}/`))
  
  // Skip for static assets, API routes, and auth callbacks
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/callback') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next()
  }

  // Validate Supabase configuration - silently skip if not configured
  if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const signInRedirect = () => {
    const url = request.nextUrl.clone()
    const target = `${pathname}${url.search}`
    url.pathname = '/auth/sign-in'
    url.search = ''
    url.searchParams.set('redirectTo', target)
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Only check auth for protected routes to improve performance
    if (isProtectedRoute) {
      // Refresh session if expired - required for Server Components
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()

      // If user is not signed in and the route is protected, redirect to sign-in
      if (!user || error) {
        return signInRedirect()
      }
    }

    return supabaseResponse
  } catch (error) {
    // Log errors only in development to avoid production log spam
    if (process.env.NODE_ENV === 'development') {
      console.error('Middleware error:', error)
    }
    return isProtectedRoute ? signInRedirect() : supabaseResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match specific paths that need authentication
     */
    '/',
    '/profile/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/auth/reset-password',
  ],
}
