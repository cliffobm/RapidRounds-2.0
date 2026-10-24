import TesterSignIn from '@/components/auth/TesterSignIn'
import { DATABASE_CONFIGURED } from '@/lib/env'
import { safeTesterDestination } from '@/lib/tester-access'
import { redirect } from 'next/navigation'
import '../../auth-review.css'
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; redirectTo?: string }>
}) {
  const { status, redirectTo } = await searchParams
  if (process.env.RR_REQUIRE_TESTER_LOGIN === 'true') {
    const parameters = new URLSearchParams({
      redirectTo: safeTesterDestination(redirectTo),
    })
    if (
      status === 'signed-out' ||
      status === 'session-required' ||
      status === 'callback-error'
    )
      parameters.set('status', status)
    redirect(`/tester-login?${parameters}`)
  }
  const notice =
    status === 'signed-out'
      ? 'You are signed out.'
      : status === 'session-required'
        ? 'Please sign in to view your account.'
        : status === 'callback-error'
          ? 'We could not complete that sign-in. Use your tester email and password below.'
          : ''
  return (
    <TesterSignIn
      configured={DATABASE_CONFIGURED}
      initialNotice={notice}
      redirectTo={safeTesterDestination(redirectTo ?? '/account')}
    />
  )
}
