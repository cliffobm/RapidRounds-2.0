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
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          cookieStore.set({ name, value, ...options })
        },
        remove: (name, options) => {
          cookieStore.set({ name, value: '', ...options })
        }
      } 
    }
  )
}

export async function createServerClientSSR() {
  return await createClient();
}