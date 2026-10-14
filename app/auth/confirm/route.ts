import { createClient } from '@/lib/supabase/server'
import { safeAuthRedirect } from '@/lib/auth/redirects'
import { authRedirect } from '@/lib/auth/responses'
import type { EmailOtpType } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

const supportedTypes = new Set(['email', 'signup', 'magiclink', 'recovery'])

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const type = params.get('type')
  const tokenHash = params.get('token_hash')
  const next = type === 'recovery' ? '/auth/reset-password' : safeAuthRedirect(params.get('next'))
  const failure = `/auth/sign-in?error=auth_callback_failed&redirectTo=${encodeURIComponent(next)}`
  if (!tokenHash || !type || !supportedTypes.has(type)) return authRedirect(request, failure)
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType })
    if (error || !data.session) return authRedirect(request, failure)
    return authRedirect(request, next)
  } catch {
    return authRedirect(request, failure)
  }
}
