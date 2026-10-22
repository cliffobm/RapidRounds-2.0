import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG, DATABASE_CONFIGURED, supabaseFetch } from '@/lib/env'
export async function createClient() {
  if (!DATABASE_CONFIGURED)
    throw new Error('Review authentication is not configured')
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    global: { fetch: supabaseFetch },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          /* Server Components cannot set cookies; protected routes refresh them in middleware. */
        }
      },
    },
  })
}
export const createServerClientSSR = createClient
