// lib/auth/server.ts
import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export interface AuthenticatedUser {
  id: string
  email?: string
  role?: string
}

/**
 * Get authenticated user from request (runtime-safe)
 * Only works in server environments (API routes, Server Components)
 */
export async function getUserFromRequest(req: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Check if we're in a server environment
    if (typeof window !== 'undefined') {
      console.warn('getUserFromRequest called in browser environment')
      return null
    }

    // Only run in production or development server
    if (process.env.NODE_ENV === 'test') {
      return null
    }

    // Get Supabase client for server-side auth
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'local-development-key',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Get user from session
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'student'
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

/**
 * Validate user access for protected routes
 */
export async function validateUserAccess(
  req: NextRequest, 
  requiredRole?: string
): Promise<{ user: AuthenticatedUser; error?: never } | { user?: never; error: Response }> {
  const user = await getUserFromRequest(req)
  
  if (!user) {
    return { error: new Response('Unauthorized', { status: 401 }) }
  }

  if (requiredRole && user.role !== requiredRole) {
    return { error: new Response('Forbidden', { status: 403 }) }
  }

  return { user }
}
