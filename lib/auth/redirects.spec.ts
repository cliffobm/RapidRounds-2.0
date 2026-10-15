import { describe, expect, it } from 'vitest'
import { authCallbackUrl, safeAuthRedirect } from './redirects'

describe('auth return paths', () => {
  it.each(['/profile', '/settings?tab=account', '/quiz/cardiac#question', '/auth/reset-password'])(
    'keeps local destination %s', path => expect(safeAuthRedirect(path)).toBe(path),
  )
  it.each([null, '', 'https://example.com', '//example.com', '/\\example.com', '/%2fexample.com', '/%252fexample.com', '/%5cexample.com', '/%0a/example.com', '/a/..//example.com', '/auth/callback?code=used', '/auth/confirm', '/auth/sign-in', '/auth', '/%61uth/callback', '/%zz'])(
    'rejects an unsafe or looping destination %s', path => expect(safeAuthRedirect(path)).toBe('/'),
  )
  it('encodes a safe destination in the callback and rejects external destinations', () => {
    expect(new URL(authCallbackUrl('https://app.example.com', '/profile?tab=account')).searchParams.get('next')).toBe('/profile?tab=account')
    expect(new URL(authCallbackUrl('http://localhost:3000', '//example.com')).searchParams.get('next')).toBe('/')
  })
})
