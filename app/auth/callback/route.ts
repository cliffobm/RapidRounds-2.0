import { createClient } from '@/lib/supabase/server'
import { DATABASE_CONFIGURED } from '@/lib/env'
import { NextRequest, NextResponse } from 'next/server'
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const fail = () =>
    NextResponse.redirect(
      new URL('/auth/sign-in?status=callback-error', url.origin)
    )
  if (!DATABASE_CONFIGURED || url.searchParams.has('error')) return fail()
  const code = url.searchParams.get('code')
  if (!code) return fail()
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data.user) return fail()
    const response = NextResponse.redirect(new URL('/account', url.origin))
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch {
    return fail()
  }
}
