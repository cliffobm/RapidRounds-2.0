'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'
import { Logo } from '@/components/ui/Logo'
import { safeAuthRedirect } from '@/lib/auth/redirects'

function SignInContent() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = safeAuthRedirect(params.get('redirectTo') ?? params.get('next'))
  return (
    <AuthForm
      mode={params.get('mode') === 'signup' ? 'signup' : 'signin'}
      redirectTo={redirectTo}
      callbackFailed={params.get('error') === 'auth_callback_failed'}
      googleEnabled={process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true'}
      onSuccess={() => { router.replace(redirectTo); router.refresh() }}
    />
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold gradient-text">Welcome to RapidRounds</h1>
          <p className="text-brand-blue-dark mt-2">Your nursing education platform</p>
        </div>
        <Suspense fallback={<p role="status">Loading sign-in options…</p>}>
          <SignInContent />
        </Suspense>
      </div>
    </div>
  )
}
