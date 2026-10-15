'use client'

import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_CONFIG, validateEnvironment } from '@/lib/env'

// Validate environment on import
validateEnvironment()

// The browser client shares a cookie-backed session with server middleware.
export function createClient() {
  return createBrowserClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: { 
      persistSession: true, 
      autoRefreshToken: true,
      detectSessionInUrl: true 
    },
  })
}

// Export a default instance for backwards compatibility
export const supabase = createClient()
