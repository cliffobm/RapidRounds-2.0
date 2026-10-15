import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as callback } from '@/app/auth/callback/route'
import { GET as confirm } from '@/app/auth/confirm/route'

const mocks = vi.hoisted(() => ({ exchange: vi.fn(), verify: vi.fn(), from: vi.fn(), client: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.client }))
const request = (path: string) => new NextRequest(`http://localhost:3000${path}`)
const session = { session: { access_token: 'test-token' }, user: { id: 'test-user', user_metadata: { role: 'admin' } } }

describe('authentication callbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.client.mockResolvedValue({ auth: { exchangeCodeForSession: mocks.exchange, verifyOtp: mocks.verify }, from: mocks.from })
    mocks.exchange.mockResolvedValue({ data: session, error: null })
    mocks.verify.mockResolvedValue({ data: session, error: null })
  })
  it('exchanges the code and returns to the original protected path without changing profiles', async () => {
    const response = await callback(request('/auth/callback?code=valid&next=%2Fprofile%3Ftab%3Daccount'))
    expect(mocks.exchange).toHaveBeenCalledWith('valid')
    expect(response.headers.get('location')).toBe('http://localhost:3000/profile?tab=account')
    expect(mocks.from).not.toHaveBeenCalled()
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('referrer-policy')).toBe('no-referrer')
  })
  it.each(['', '?error=access_denied&error_description=untrusted', '?code=valid&error=denied'])(
    'returns missing/denied credentials to sign-in (%s)', async query => {
      const response = await callback(request(`/auth/callback${query}`))
      expect(new URL(response.headers.get('location')!).searchParams.get('error')).toBe('auth_callback_failed')
      expect(mocks.exchange).not.toHaveBeenCalled()
      expect(response.headers.get('location')).not.toContain('untrusted')
    },
  )
  it.each([{ data: { session: null }, error: null }, { data: {}, error: { message: 'expired' } }])(
    'rejects exchanges without a valid session', async result => {
      mocks.exchange.mockResolvedValue(result)
      const response = await callback(request('/auth/callback?code=expired&next=%2Fsettings'))
      expect(new URL(response.headers.get('location')!).pathname).toBe('/auth/sign-in')
      expect(new URL(response.headers.get('location')!).searchParams.get('redirectTo')).toBe('/settings')
    },
  )
  it('does not redirect outside the app', async () => {
    const response = await callback(request('/auth/callback?code=valid&next=%2F%2Fevil.example'))
    expect(response.headers.get('location')).toBe('http://localhost:3000/')
  })
  it('uses the configured application origin rather than an internal or forged request host', async () => {
    const response = await callback(new NextRequest('http://internal-proxy:3000/auth/callback?code=valid&next=%2Fprofile', { headers: { host: 'evil.example', 'x-forwarded-host': 'evil.example' } }))
    expect(response.headers.get('location')).toBe('http://localhost:3000/profile')
  })
  it('handles a network/configuration exception', async () => {
    mocks.client.mockRejectedValue(new Error('private server details'))
    const response = await callback(request('/auth/callback?code=valid'))
    expect(response.headers.get('location')).toContain('/auth/sign-in?error=auth_callback_failed')
    expect(response.headers.get('location')).not.toContain('private')
  })
  it.each(['email', 'signup', 'magiclink'])(
    'verifies a supported %s email token and uses the local destination', async type => {
      const response = await confirm(request(`/auth/confirm?type=${type}&token_hash=one-use&next=%2Fprofile`))
      expect(mocks.verify).toHaveBeenCalledWith({ type, token_hash: 'one-use' })
      expect(response.headers.get('location')).toBe('http://localhost:3000/profile')
      expect(mocks.from).not.toHaveBeenCalled()
    },
  )
  it('always sends recovery tokens to the password editor', async () => {
    const response = await confirm(request('/auth/confirm?type=recovery&token_hash=recovery&next=%2F'))
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/reset-password')
  })
  it.each(['?type=email', '?type=phone&token_hash=untrusted', '?token_hash=untrusted'])(
    'rejects unsupported or incomplete email verification (%s)', async query => {
      const response = await confirm(request(`/auth/confirm${query}`))
      expect(mocks.verify).not.toHaveBeenCalled()
      expect(new URL(response.headers.get('location')!).pathname).toBe('/auth/sign-in')
    },
  )
  it('rejects expired or consumed email links', async () => {
    mocks.verify.mockResolvedValue({ data: { session: null }, error: { code: 'otp_expired' } })
    const response = await confirm(request('/auth/confirm?type=email&token_hash=expired'))
    expect(new URL(response.headers.get('location')!).pathname).toBe('/auth/sign-in')
  })
})
