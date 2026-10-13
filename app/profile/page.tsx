'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/store/useAuth'
import { loadAccountProfile, saveAccountProfile, type AccountProfile } from '@/lib/db/account-profile'

function errorMessage(error: unknown) {
  return error && typeof error === 'object' && 'message' in error
    ? String(error.message) : 'Please check your connection and try again.'
}

function LearnerProfile({ userId, email }: { userId: string; email: string }) {
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  const [retry, setRetry] = useState(0)
  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [credentials, setCredentials] = useState('')
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError('')
    loadAccountProfile(userId).then(record => {
      if (active) setProfile(record)
    }).catch(error => {
      if (active) setLoadError(`Unable to load your profile. ${errorMessage(error)}`)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [userId, retry])

  function startEditing() {
    if (!profile) return
    setFullName(profile.full_name ?? '')
    setDisplayName(profile.display_name ?? '')
    setCredentials((profile.credentials ?? []).join(', '))
    setSaveError('')
    setSaved(false)
    setEditing(true)
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setSaveError('')
    try {
      const record = await saveAccountProfile(userId, {
        full_name: fullName.trim() || null,
        display_name: displayName.trim() || null,
        credentials: [...new Set(credentials.split(',').map(value => value.trim()).filter(Boolean))],
      })
      if (!mounted.current || useAuth.getState().user?.id !== userId) return
      setProfile(record)
      const authProfile = useAuth.getState().profile
      if (authProfile?.id === userId) useAuth.setState({ profile: { ...authProfile, ...record, credentials: record.credentials ?? [], subscription_tier: record.subscription_tier ?? authProfile.subscription_tier } })
      setEditing(false)
      setSaved(true)
    } catch (error) {
      if (mounted.current) setSaveError(`Profile was not saved. ${errorMessage(error)}`)
    } finally {
      if (mounted.current) setSaving(false)
    }
  }

  if (loading) return <p role="status">Loading your profile…</p>
  if (loadError) return <Card><CardContent className="p-6 space-y-4">
    <p role="alert">{loadError}</p>
    <p>Your account needs an existing profile record. No sample profile is substituted.</p>
    <Button onClick={() => setRetry(value => value + 1)}>Retry</Button>
  </CardContent></Card>
  if (!profile) return null

  return <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="break-words">{profile.display_name || profile.full_name || email || 'Learner'}</CardTitle>
        <CardDescription className="break-all">{email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-4 sm:grid-cols-2 break-words">
          <div><dt className="text-sm text-slate-500">Full name</dt><dd>{profile.full_name || 'Not set'}</dd></div>
          <div><dt className="text-sm text-slate-500">Display name</dt><dd>{profile.display_name || 'Not set'}</dd></div>
          <div><dt className="text-sm text-slate-500">Role</dt><dd><Badge variant="outline">{profile.role}</Badge></dd></div>
          <div><dt className="text-sm text-slate-500">Subscription</dt><dd>{profile.subscription_tier ?? 'Not set'}</dd></div>
          <div><dt className="text-sm text-slate-500">Institution ID</dt><dd className="break-all">{profile.institution_id || 'Not assigned'}</dd></div>
          <div><dt className="text-sm text-slate-500">Credentials (self-reported)</dt><dd>{profile.credentials?.length ? profile.credentials.join(', ') : 'Not set'}</dd></div>
        </dl>
        <p className="text-sm text-slate-500">Email, role, institution, and subscription are read-only here.</p>
        {!editing && <Button onClick={startEditing}>Edit Profile</Button>}
        {saved && <p role="status" className="text-green-700">Profile saved.</p>}
      </CardContent>
    </Card>

    {editing && <Card>
      <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={save} className="space-y-4" aria-label="Edit profile">
          <div><label htmlFor="full-name" className="block mb-2">Full name</label>
            <Input id="full-name" autoComplete="name" maxLength={200} value={fullName} disabled={saving} onChange={event => setFullName(event.target.value)} /></div>
          <div><label htmlFor="display-name" className="block mb-2">Display name</label>
            <Input id="display-name" maxLength={100} value={displayName} disabled={saving} onChange={event => setDisplayName(event.target.value)} /></div>
          <div><label htmlFor="credentials" className="block mb-2">Credentials</label>
            <Input id="credentials" maxLength={500} value={credentials} disabled={saving} onChange={event => setCredentials(event.target.value)} aria-describedby="credentials-help" />
            <p id="credentials-help" className="text-sm text-slate-500 mt-1">Separate self-reported credentials with commas, for example RN, CCRN. These do not grant educator or admin access.</p></div>
          {saveError && <p role="alert" className="text-red-700">{saveError}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</Button>
            <Button type="button" variant="outline" disabled={saving} onClick={() => { setEditing(false); setSaveError('') }}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>}

    <Card>
      <CardHeader><CardTitle>Learning activity</CardTitle></CardHeader>
      <CardContent><p className="text-slate-500">Profile achievements, streaks, XP, and rank are not connected yet. Sample statistics have been removed.</p></CardContent>
    </Card>
    <Link href="/settings" className="inline-block text-primary underline">Account settings</Link>
  </div>
}

export default function ProfilePage() {
  const user = useAuth(state => state.user)
  return <div className="container mx-auto px-4 py-8 max-w-3xl">
    <h1 className="text-3xl font-bold mb-2">Profile</h1>
    <p className="text-slate-500 mb-8">Your account and learner profile</p>
    {user ? <LearnerProfile key={user.id} userId={user.id} email={user.email ?? ''} />
      : <p role="status">Checking your sign-in session… <Link href="/auth/sign-in" className="underline">Sign in</Link></p>}
  </div>
}
