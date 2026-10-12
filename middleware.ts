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
    const protectedRoutes = ['/profile', '/settings', '/admin']
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isProtectedRoute) {
      // Refresh session if expired - required for Server Components
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()

      // If user is not signed in and the route is protected, redirect to sign-in
      if (!user || error) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/sign-in'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch (error) {
    // Log errors only in development to avoid production log spam
    if (process.env.NODE_ENV === 'development') {
      console.error('Middleware error:', error)
    }
    // If there's an error, just continue without authentication checks
    return NextResponse.next()
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
  ],
}
