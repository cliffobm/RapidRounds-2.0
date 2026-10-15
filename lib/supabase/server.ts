import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG, validateEnvironment } from '@/lib/env'

export async function createClient() {
  const cookieStore = await cookies()
  
  // Validate environment
  if (!validateEnvironment()) {
    throw new Error('Supabase environment variables missing on server')
  }
  return createServerClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    { 
      cookies: { 
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          // Route handlers can write the exchanged session; Server Components
          // are read-only and rely on middleware for session refresh.
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch { /* Read-only Server Component cookie store. */ }
        },
      } 
    }
  )
}

export async function createServerClientSSR() {
  return await createClient();
}
