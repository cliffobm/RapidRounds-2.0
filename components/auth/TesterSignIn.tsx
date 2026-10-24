'use client'

import { useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import { safeTesterDestination } from '@/lib/tester-access'

function navigateToApp(destination: string) {
  // A document request discards any anonymous Next router cache. The server
  // verifies the cookie session before returning the requested learning page.
  window.location.assign(destination)
}

function signInError(error: unknown) {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : ''
  if (code === 'invalid_credentials')
    return 'Email or password was not recognized. Check your details and try again.'
  if (code === 'email_not_confirmed')
    return 'Your email needs to be confirmed. Contact the review organizer to check your tester account.'
  if (
    code === 'over_request_rate_limit' ||
    code === 'over_email_send_rate_limit'
  )
    return 'Too many sign-in attempts. Wait a few minutes before trying again.'
  if (
    error instanceof TypeError ||
    (error instanceof Error && /fetch|network|offline/i.test(error.message))
  )
    return 'We could not connect to sign in. Check your connection and try again.'
  return 'We could not sign you in. Try again, or ask the review organizer to check your tester account.'
}

export default function TesterSignIn({
  configured,
  initialNotice = '',
  requireSignIn = false,
  redirectTo = '/home',
  navigate = navigateToApp,
}: {
  configured: boolean
  initialNotice?: string
  requireSignIn?: boolean
  redirectTo?: string
  navigate?: (destination: string) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!configured || submitting.current) return
    submitting.current = true
    setLoading(true)
    setError('')
    try {
      const { data, error: authError } =
        await supabaseClient.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
      if (authError) throw authError
      if (!data.session) throw new Error('No session was created')
      setPassword('')
      navigate(safeTesterDestination(redirectTo))
    } catch (authError) {
      setError(signInError(authError))
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <div className="rr-auth-review">
      <section className="rr-auth-panel" aria-labelledby="tester-sign-in-title">
        <div className="rr-auth-symbol" aria-hidden="true">
          <LockKeyhole size={25} />
        </div>
        <p className="eyebrow">PRIVATE COLLEAGUE REVIEW</p>
        <h1 id="tester-sign-in-title">Tester sign in</h1>
        <p id="tester-sign-in-description" className="rr-auth-description">
          Use the email and password for the tester account provided by your
          review organizer. No Vercel account is needed.
        </p>
        {!configured && (
          <div className="rr-auth-notice" role="status">
            <strong>Tester login is not connected yet.</strong>
            <p>
              The review organizer needs to connect the review authentication
              project.
              {!requireSignIn &&
                ' You can still review the app without signing in.'}
            </p>
          </div>
        )}
        {initialNotice && (
          <p className="rr-auth-notice" role="status">
            {initialNotice}
          </p>
        )}
        <form onSubmit={signIn} aria-describedby="tester-sign-in-description">
          <fieldset disabled={!configured || loading}>
            <legend className="sr-only">Tester account credentials</legend>
            <label htmlFor="tester-email">Email</label>
            <input
              id="tester-email"
              name="email"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label htmlFor="tester-password">Password</label>
            <div className="rr-auth-password">
              <input
                id="tester-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="rr-auth-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-controls="tester-password"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="submit"
              className="rr-button rr-button-mint rr-auth-submit"
              aria-busy={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </fieldset>
        </form>
        {error && (
          <p className="rr-auth-error" role="alert">
            {error}
          </p>
        )}
        <p className="rr-auth-help">
          Need an account or a password reset? Contact your review organizer.
        </p>
        {!requireSignIn && (
          <Link href="/home" className="rr-auth-text-link">
            Continue reviewing without signing in →
          </Link>
        )}
      </section>
    </div>
  )
}
