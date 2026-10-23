'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, LogOut } from 'lucide-react'
import { useAuth } from '@/store/useAuth'

export default function ReviewAccount({ email }: { email: string }) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)

  async function signOut() {
    if (submitting.current) return
    submitting.current = true
    setSigningOut(true)
    setError('')
    try {
      await useAuth.getState().signOut()
      router.replace('/auth/sign-in?status=signed-out')
      router.refresh()
    } catch {
      setError(
        'We could not sign you out. Check your connection and try again. Your session may still be active.'
      )
    } finally {
      submitting.current = false
      setSigningOut(false)
    }
  }

  return (
    <div className="rr-auth-review">
      <section className="rr-auth-panel" aria-labelledby="review-account-title">
        <div className="rr-auth-symbol" aria-hidden="true">
          <Check size={25} />
        </div>
        <p className="eyebrow">COLLEAGUE REVIEW</p>
        <h1 id="review-account-title">Your review account</h1>
        <p className="rr-auth-description">You are signed in as</p>
        <p className="rr-auth-email">{email}</p>
        <div className="rr-auth-notice">
          <strong>Progress stays on this device.</strong>
          <p>
            Sign-in confirms your tester account. Scores, unfinished activities,
            and settings are saved in this browser and do not sync between
            devices or accounts. Use separate browser profiles on a shared
            device. Signing out does not erase saved practice.
          </p>
        </div>
        <nav className="rr-auth-actions" aria-label="Continue your review">
          <Link href="/review-guide" className="rr-auth-text-link">
            Colleague review guide →
          </Link>
          <Link href="/home" className="rr-button rr-button-mint">
            Review Home
          </Link>
          <Link href="/practice" className="rr-auth-text-link">
            Practice questions →
          </Link>
          <Link href="/progress" className="rr-auth-text-link">
            View Progress →
          </Link>
        </nav>
        <div className="rr-auth-signout">
          <button
            type="button"
            className="rr-auth-signout-button"
            onClick={signOut}
            disabled={signingOut}
            aria-busy={signingOut}
          >
            <LogOut size={18} aria-hidden="true" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
          {error && (
            <p className="rr-auth-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
