// lib/supabase-client.ts - Client-side Supabase client (Legacy - use lib/supabase/client.ts instead)
'use client'

import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, validateEnvironment } from '@/lib/env'

// Validate environment on import
validateEnvironment()

export const supabaseClient = createClient(
  SUPABASE_CONFIG.url, 
  SUPABASE_CONFIG.anonKey, 
  {
    auth: { 
      persistSession: true, 
      autoRefreshToken: true, 
      detectSessionInUrl: true 
    },
  }
)
