import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PasswordResetForm } from '@/components/auth/PasswordResetForm'

export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/auth/sign-in?error=auth_callback_failed&redirectTo=%2Fauth%2Freset-password')
  return <div className="min-h-screen gradient-bg flex items-center justify-center p-4"><PasswordResetForm /></div>
}
