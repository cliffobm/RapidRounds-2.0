import { supabaseClient } from '@/lib/supabase-client'

export interface AccountProfile {
  id: string
  full_name: string | null
  display_name: string | null
  credentials: string[] | null
  role: 'student' | 'educator' | 'admin'
  institution_id: string | null
  subscription_tier: 'free' | 'trial' | 'premium' | null
  updated_at: string
}

export type ProfileEdits = Pick<AccountProfile, 'full_name' | 'display_name' | 'credentials'>
const profileColumns = 'id,full_name,display_name,credentials,role,institution_id,subscription_tier,updated_at'

function ownProfile(data: AccountProfile | null, userId: string) {
  if (!data || data.id !== userId) throw new Error('Your profile record was not returned. Please check account provisioning.')
  return data
}

export async function loadAccountProfile(userId: string): Promise<AccountProfile> {
  const { data, error } = await supabaseClient.from('profiles').select(profileColumns).eq('id', userId).single()
  if (error) throw error
  return ownProfile(data as AccountProfile | null, userId)
}

export async function saveAccountProfile(userId: string, edits: ProfileEdits): Promise<AccountProfile> {
  // Explicit allowlist: never send role, tenant, billing, identity or server timestamps.
  // Database column grants and RLS remain the actual authorization boundary.
  const { data, error } = await supabaseClient.from('profiles').update({
    full_name: edits.full_name,
    display_name: edits.display_name,
    credentials: edits.credentials,
  }).eq('id', userId).select(profileColumns).single()
  if (error) throw error
  return ownProfile(data as AccountProfile | null, userId)
}
