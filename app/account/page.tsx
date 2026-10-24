import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DATABASE_CONFIGURED } from '@/lib/env'
import ReviewAccount from '@/components/auth/ReviewAccount'
import '../auth-review.css'
export default async function AccountPage() {
  const requireSignIn = process.env.RR_REQUIRE_TESTER_LOGIN === 'true'
  const signInPage = requireSignIn ? '/tester-login' : '/auth/sign-in'
  if (!DATABASE_CONFIGURED) redirect(signInPage)
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user?.email)
    redirect(`${signInPage}?status=session-required&redirectTo=%2Faccount`)
  return <ReviewAccount email={data.user.email} requireSignIn={requireSignIn} />
}
