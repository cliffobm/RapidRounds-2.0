import { createClient } from '@/lib/supabase/server'
import { safeAuthRedirect } from '@/lib/auth/redirects'
import { authRedirect } from '@/lib/auth/responses'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const next = safeAuthRedirect(params.get('next'))
  const failure = `/auth/sign-in?error=auth_callback_failed&redirectTo=${encodeURIComponent(next)}`
  const code = params.get('code')
  if (!code || params.has('error')) return authRedirect(request, failure)
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data.session) return authRedirect(request, failure)
    // Profiles are provisioned by the database when auth.users is inserted.
    // Repeated OAuth logins must never overwrite roles or profile details.
    return authRedirect(request, next)
  } catch {
    return authRedirect(request, failure)
  }
}
