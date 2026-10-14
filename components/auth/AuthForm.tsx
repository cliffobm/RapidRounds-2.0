'use client'

import { useState, type FormEvent } from 'react'
import { supabaseClient } from '@/lib/supabase-client'
import { useAuth } from '@/store/useAuth'
import { authCallbackUrl } from '@/lib/auth/redirects'
import { authErrorMessage } from '@/lib/auth/errors'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2 } from 'lucide-react'

type Mode = 'signin' | 'signup' | 'email-link' | 'reset'
interface AuthFormProps {
  mode: 'signin' | 'signup'
  redirectTo?: string
  callbackFailed?: boolean
  googleEnabled?: boolean
  onSuccess?: () => void
  onModeChange?: (mode: 'signin' | 'signup') => void
}

const titles: Record<Mode, string> = {
  signin: 'Sign In', signup: 'Create Account', 'email-link': 'Sign in with an email link', reset: 'Reset your password',
}
const actions: Record<Mode, string> = {
  signin: 'Sign in with email', signup: 'Create account', 'email-link': 'Send sign-in link', reset: 'Send reset link',
}

export function AuthForm({ mode: initialMode, redirectTo = '/', callbackFailed = false, googleEnabled = false, onSuccess, onModeChange }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(callbackFailed ? 'That sign-in link is invalid, expired, or was already used. Try signing in again or request a new link.' : '')
  const [notice, setNotice] = useState('')

  function changeMode(next: Mode) {
    setMode(next)
    setPassword('')
    setConfirmation('')
    setError('')
    setNotice('')
    if (next === 'signin' || next === 'signup') onModeChange?.(next)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (mode === 'signup' && password !== confirmation) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const address = email.trim()
      if (mode === 'signin') {
        const { error } = await useAuth.getState().signIn(address, password)
        if (error) throw error
        onSuccess?.()
      } else if (mode === 'signup') {
        const { error, session } = await useAuth.getState().signUp(address, password, { full_name: fullName.trim() }, authCallbackUrl(window.location.origin, redirectTo))
        if (error) throw error
        if (session) onSuccess?.()
        else setNotice('Check your email to confirm your account. If you already have an account, sign in or reset your password. Check your spam folder too.')
      } else if (mode === 'email-link') {
        const { error } = await supabaseClient.auth.signInWithOtp({
          email: address,
          options: { emailRedirectTo: authCallbackUrl(window.location.origin, redirectTo), shouldCreateUser: false },
        })
        // Do not reveal whether an email has a registered account.
        if (error && error.code !== 'otp_disabled' && error.code !== 'user_not_found' && error.code !== 'signup_disabled') throw error
        setNotice('If an account exists for this email, a sign-in link is on its way. Open it on this device. New here? Choose Create account first.')
      } else {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(address, {
          redirectTo: authCallbackUrl(window.location.origin, '/auth/reset-password'),
        })
        if (error) throw error
        setNotice('If an account exists for this email, a password reset link is on its way. Open it on this device and check your spam folder.')
      }
    } catch (error) {
      setError(authErrorMessage(error, mode === 'signin' ? 'Unable to sign in. Check your email and password, then try again.' : 'Unable to complete this request. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: authCallbackUrl(window.location.origin, redirectTo) },
      })
      if (error) throw error
    } catch {
      setError('Google sign-in is unavailable right now. Please use email or try again later.')
    } finally {
      setLoading(false)
    }
  }

  const passwordMode = mode === 'signin' || mode === 'signup'
  const inputClass = 'w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 disabled:opacity-60'
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold gradient-text">{titles[mode]}</CardTitle>
        <CardDescription>
          {mode === 'signup' ? 'Create your learner account to start practicing.' : mode === 'email-link' ? 'Get a one-time sign-in link. No password needed.' : mode === 'reset' ? 'We’ll email you a link to choose a new password.' : 'Sign in to continue your learning journey.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
          {mode === 'signup' && <div>
            <label htmlFor="full-name" className="block text-sm font-medium mb-1">Full name</label>
            <input id="full-name" name="name" autoComplete="name" required maxLength={100} value={fullName} onChange={event => setFullName(event.target.value)} disabled={loading} className={inputClass} />
          </div>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} disabled={loading} className={inputClass} />
          </div>
          {passwordMode && <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input id="password" name="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? 8 : undefined} value={password} onChange={event => setPassword(event.target.value)} disabled={loading} className={inputClass} />
            {mode === 'signup' && <p className="text-sm text-gray-500 mt-1">Use at least 8 characters.</p>}
          </div>}
          {mode === 'signup' && <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">Confirm password</label>
            <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={loading} className={inputClass} />
          </div>}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="text-sm text-brand-blue-dark">{notice}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
            {actions[mode]}
          </Button>
        </form>
        {mode === 'signin' && <>
          <button type="button" disabled={loading} onClick={() => changeMode('reset')} className="text-sm text-brand-blue hover:underline disabled:opacity-60">Forgot password?</button>
          <Button type="button" variant="outline" disabled={loading} onClick={() => changeMode('email-link')} className="w-full">Email me a sign-in link</Button>
        </>}
        {googleEnabled && (mode === 'signin' || mode === 'signup') && <>
          <p className="text-center text-sm text-gray-500">Or continue with</p>
          <Button type="button" variant="outline" disabled={loading} onClick={handleGoogle} className="w-full">Continue with Google</Button>
        </>}
        <div className="text-center text-sm">
          {mode === 'signin' || mode === 'email-link' ? <button type="button" disabled={loading} onClick={() => changeMode('signup')} className="text-brand-blue hover:underline disabled:opacity-60">Create account</button> : null}
          {mode !== 'signin' && <button type="button" disabled={loading} onClick={() => changeMode('signin')} className="block mx-auto mt-3 text-brand-blue hover:underline disabled:opacity-60">Back to sign in</button>}
        </div>
      </CardContent>
    </Card>
  )
}
