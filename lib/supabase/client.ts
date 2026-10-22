'use client'
import { supabaseClient } from '@/lib/supabase-client'
export const supabase = supabaseClient
export function createClient() {
  return supabaseClient
}
