import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mock = vi.hoisted(() => ({
  configured: true,
  getUser: vi.fn(),
  exchange: vi.fn(),
  from: vi.fn(),
}))
vi.mock('@/lib/env', () => ({
  get DATABASE_CONFIGURED() {
    return mock.configured
  },
}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mock.getUser, exchangeCodeForSession: mock.exchange },
    from: mock.from,
  }),
}))
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error('REDIRECT:' + url)
  },
}))
vi.mock('@/components/auth/ReviewAccount', () => ({
  default: (props: { email: string }) => <p>{props.email}</p>,
}))
import AccountPage from '../account/page'
import { GET } from './callback/route'
beforeEach(() => {
  vi.clearAllMocks()
  mock.configured = true
})
describe('server-verified tester account', () => {
  it('rejects an unauthenticated account request', async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
    await expect(AccountPage()).rejects.toThrow(
      'REDIRECT:/auth/sign-in?status=session-required'
    )
  })
  it('shows only the authenticated user returned by Auth and never reads a profile table', async () => {
    mock.getUser.mockResolvedValue({
      data: { user: { email: 'tester@example.com' } },
      error: null,
    })
    const result = await AccountPage()
    expect(result.props.email).toBe('tester@example.com')
    expect(mock.getUser).toHaveBeenCalledTimes(1)
    expect(mock.from).not.toHaveBeenCalled()
  })
  it('rejects a stale or rejected token even if a user-shaped object is returned', async () => {
    mock.getUser.mockResolvedValue({
      data: { user: { email: 'tester@example.com' } },
      error: new Error('expired'),
    })
    await expect(AccountPage()).rejects.toThrow(
      'REDIRECT:/auth/sign-in?status=session-required'
    )
  })
})
describe('callback does not write learner profiles', () => {
  it('exchanges a valid PKCE code, returns to Account and cannot upsert roles/profiles', async () => {
    mock.exchange.mockResolvedValue({
      data: { user: { id: 'tester' } },
      error: null,
    })
    const response = await GET(
      new NextRequest('https://review.example/auth/callback?code=test-code')
    )
    expect(response.headers.get('location')).toBe(
      'https://review.example/account'
    )
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(mock.exchange).toHaveBeenCalledWith('test-code')
    expect(mock.from).not.toHaveBeenCalled()
  })
  it('returns missing, provider-denied and failed callbacks to sign in without pretending success', async () => {
    mock.exchange.mockResolvedValue({
      data: { user: null },
      error: new Error('rejected'),
    })
    for (const query of ['', '?error=access_denied', '?code=invalid']) {
      const response = await GET(
        new NextRequest('https://review.example/auth/callback' + query)
      )
      expect(response.headers.get('location')).toBe(
        'https://review.example/auth/sign-in?status=callback-error'
      )
    }
    expect(mock.from).not.toHaveBeenCalled()
  })
})
