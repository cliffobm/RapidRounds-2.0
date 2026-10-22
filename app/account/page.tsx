import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DATABASE_CONFIGURED } from '@/lib/env'
import ReviewAccount from '@/components/auth/ReviewAccount'
import '../auth-review.css'
export default async function AccountPage() {
  if (!DATABASE_CONFIGURED) redirect('/auth/sign-in')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user?.email)
    redirect('/auth/sign-in?status=session-required')
  return <ReviewAccount email={data.user.email} />
}
