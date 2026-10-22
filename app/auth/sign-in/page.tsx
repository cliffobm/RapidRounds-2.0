import TesterSignIn from '@/components/auth/TesterSignIn'
import { DATABASE_CONFIGURED } from '@/lib/env'
import '../../auth-review.css'
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const notice =
    status === 'signed-out'
      ? 'You are signed out.'
      : status === 'session-required'
        ? 'Please sign in to view your account.'
        : status === 'callback-error'
          ? 'We could not complete that sign-in. Use your tester email and password below.'
          : ''
  return (
    <TesterSignIn configured={DATABASE_CONFIGURED} initialNotice={notice} />
  )
}
