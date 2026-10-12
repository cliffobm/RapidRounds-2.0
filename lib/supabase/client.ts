'use client'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, validateEnvironment } from '@/lib/env'

// Validate environment on import
validateEnvironment()

// Export a function that creates a new client instance
export function createClient() {
  return createSupabaseClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: { 
      persistSession: true, 
      autoRefreshToken: true,
      detectSessionInUrl: true 
    },
  })
}

// Export a default instance for backwards compatibility
export const supabase = createClient()