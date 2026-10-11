// lib/supabase-client.ts - Client-side Supabase client (Legacy - use lib/supabase/client.ts instead)
'use client'

import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, validateEnvironment, DATABASE_CONFIGURED, offlineFetch } from '@/lib/env'

// Validate environment on import
validateEnvironment()

export const supabaseClient = createClient(
  SUPABASE_CONFIG.url, 
  SUPABASE_CONFIG.anonKey, 
  {
    ...(!DATABASE_CONFIGURED ? { global: { fetch: offlineFetch } } : {}),
    auth: { 
      persistSession: true, 
      autoRefreshToken: true, 
      detectSessionInUrl: true 
    },
  }
)
