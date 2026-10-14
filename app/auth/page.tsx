import { redirect } from 'next/navigation'
import { safeAuthRedirect } from '@/lib/auth/redirects'

export default async function AuthPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const next = safeAuthRedirect(typeof params.redirectTo === 'string' ? params.redirectTo : undefined)
  redirect(`/auth/sign-in?redirectTo=${encodeURIComponent(next)}`)
}
