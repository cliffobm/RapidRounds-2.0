// Shared cookie/PKCE client: browser sign-in and server verification use the same session.
'use client'
import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_CONFIG, supabaseFetch } from '@/lib/env'
export const supabaseClient = createBrowserClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    global: { fetch: supabaseFetch },
  }
)
