import type { Metadata } from 'next'
import TesterSignIn from '@/components/auth/TesterSignIn'
import { DATABASE_CONFIGURED } from '@/lib/env'
import { safeTesterDestination } from '@/lib/tester-access'
import '../auth-review.css'

export const metadata: Metadata = {
  title: 'Tester sign in | Rapid Rounds',
  description: 'Sign in to the private Rapid Rounds colleague review.',
  robots: { index: false, follow: false },
}

export default async function TesterLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; redirectTo?: string }>
}) {
  const { status, redirectTo } = await searchParams
  const notice =
    status === 'signed-out'
      ? 'You are signed out.'
      : status === 'session-required'
        ? 'Please sign in to continue your review.'
        : status === 'tester-not-invited'
          ? 'This account does not have tester access. Contact your review organizer, or sign in with your invited tester account.'
          : status === 'callback-error'
            ? 'We could not complete that sign-in. Use your tester email and password below.'
            : ''
  return (
    <TesterSignIn
      configured={DATABASE_CONFIGURED}
      initialNotice={notice}
      requireSignIn
      redirectTo={safeTesterDestination(redirectTo)}
    />
  )
}
