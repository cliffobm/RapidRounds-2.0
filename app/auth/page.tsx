'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new sign-in page
    router.replace('/auth/sign-in')
  }, [router])

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
        <p className="mt-4 text-brand-blue">Redirecting...</p>
      </div>
    </div>
  )
}
