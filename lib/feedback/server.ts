import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { DATABASE_CONFIGURED, SUPABASE_CONFIG } from '@/lib/env'

// Feedback has a separate, narrow data path. The inherited application data,
// payment and AI endpoints remain disabled in the review edition.
export async function feedbackClient() {
  if (
    !DATABASE_CONFIGURED ||
    new URL(SUPABASE_CONFIG.url).hostname !== 'ztjudfbsvwqnmqqgkknn.supabase.co'
  )
    return null
  const jar = await cookies()
  const restrictedFetch: typeof fetch = async (input, init) => {
    const url = new URL(
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url
    )
    if (
      url.origin !== new URL(SUPABASE_CONFIG.url).origin ||
      !(
        url.pathname.startsWith('/auth/v1/') ||
        ['/rest/v1/rr_item_feedback', '/rest/v1/rr_feedback_members'].includes(
          url.pathname
        )
      )
    )
      throw new Error('This request is outside the tester feedback service')
    return fetch(input, init)
  }
  return createServerClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    global: { fetch: restrictedFetch },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) =>
            jar.set(name, value, options)
          )
        } catch {
          /* Read-only server rendering. */
        }
      },
    },
  })
}

export async function feedbackIdentity() {
  const client = await feedbackClient()
  if (!client)
    return { client: null, user: null, reviewer: false, status: 503 } as const
  const {
    data: { user },
    error,
  } = await client.auth.getUser()
  if (error || !user || user.is_anonymous)
    return { client: null, user: null, reviewer: false, status: 401 } as const
  const invited = (process.env.RR_TESTER_USER_IDS ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
  if (!invited.includes(user.id))
    return { client: null, user: null, reviewer: false, status: 403 } as const
  const membership = await client
    .from('rr_feedback_members')
    .select('can_review')
    .eq('user_id', user.id)
    .maybeSingle()
  if (membership.error)
    return { client: null, user: null, reviewer: false, status: 503 } as const
  if (!membership.data)
    return { client: null, user: null, reviewer: false, status: 403 } as const
  return {
    client,
    user,
    reviewer: membership.data.can_review === true,
    status: 200,
  } as const
}
