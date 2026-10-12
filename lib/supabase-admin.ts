// lib/supabase-admin.ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceKey && process.env.NODE_ENV === 'development') {
  console.warn('Supabase service role key not found, using placeholder for build')
}

export const supabaseAdmin = createClient(
  supabaseUrl, 
  serviceKey || 'placeholder-service-key', 
  {
    auth: { persistSession: false },
  }
)
