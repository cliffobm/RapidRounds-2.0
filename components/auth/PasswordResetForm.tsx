'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { supabaseClient } from '@/lib/supabase-client'
import { authErrorMessage } from '@/lib/auth/errors'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export function PasswordResetForm() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password !== confirmation) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const { error } = await supabaseClient.auth.updateUser({ password })
      if (error) throw error
      setPassword('')
      setConfirmation('')
      setSaved(true)
    } catch (error) {
      setError(authErrorMessage(error, 'Unable to update your password. Request a new reset link and try again.'))
    } finally { setLoading(false) }
  }
  return <Card className="w-full max-w-md">
    <CardHeader><CardTitle>Choose a new password</CardTitle></CardHeader>
    <CardContent>
      {saved ? <div className="space-y-4"><p role="status">Your password has been updated.</p><Link href="/profile" className="text-brand-blue hover:underline">Continue to profile</Link></div> : <form onSubmit={submit} className="space-y-4" aria-busy={loading}>
        <div><label htmlFor="new-password" className="block text-sm font-medium mb-1">New password</label><input id="new-password" type="password" autoComplete="new-password" required minLength={8} disabled={loading} value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900" /><p className="text-sm text-gray-500 mt-1">Use at least 8 characters.</p></div>
        <div><label htmlFor="confirm-password" className="block text-sm font-medium mb-1">Confirm password</label><input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} disabled={loading} value={confirmation} onChange={event => setConfirmation(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900" /></div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Updating password…' : 'Update password'}</Button>
      </form>}
    </CardContent>
  </Card>
}
