import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { NextRequest } from 'next/server'

const mock = vi.hoisted(() => ({
  configured: true,
  createClient: vi.fn(),
  getUser: vi.fn(),
  fetch: vi.fn(),
}))

vi.mock('@/lib/env', () => ({
  get DATABASE_CONFIGURED() {
    return mock.configured
  },
  SUPABASE_CONFIG: {
    url: 'https://review-auth.example',
    anonKey: 'sb_publishable_review_test',
  },
  supabaseFetch: mock.fetch,
}))
vi.mock('@supabase/ssr', () => ({ createServerClient: mock.createClient }))

import { config, middleware } from '../middleware'

type CookieWrite = {
  name: string
  value: string
  options: { path: string; sameSite: 'lax'; maxAge: number }
}
let writeCookies: (entries: CookieWrite[]) => void

// NextRequest uses Node's Headers; jsdom supplies a different constructor.
// Keep the server middleware test in one Fetch API realm.
beforeAll(() => {
  vi.stubGlobal(
    'Headers',
    new NextRequest('https://review.example').headers.constructor
  )
})
afterAll(() => vi.unstubAllGlobals())

beforeEach(() => {
  vi.clearAllMocks()
  mock.configured = true
  mock.createClient.mockImplementation((_url, _key, options) => {
    writeCookies = options.cookies.setAll
    return { auth: { getUser: mock.getUser } }
  })
  mock.getUser.mockResolvedValue({
    data: { user: { id: 'tester' } },
    error: null,
  })
})

describe('review account session middleware', () => {
  it('covers Account alongside the existing protected routes', () => {
    expect(config.matcher).toContain('/:path*')
  })

  it('accepts the shared publishable key and passes refreshed cookies to the page and browser', async () => {
    const request = new NextRequest('https://review.example/account', {
      headers: { cookie: 'sb-session=expired' },
    })
    mock.getUser.mockImplementation(async () => {
      writeCookies([
        {
          name: 'sb-session',
          value: 'refreshed',
          options: { path: '/', sameSite: 'lax', maxAge: 3600 },
        },
      ])
      return { data: { user: { id: 'tester' } }, error: null }
    })

    const response = await middleware(request)

    expect(mock.createClient).toHaveBeenCalledWith(
      'https://review-auth.example',
      'sb_publishable_review_test',
      expect.objectContaining({ global: { fetch: mock.fetch } })
    )
    expect(mock.getUser).toHaveBeenCalledOnce()
    expect(request.cookies.get('sb-session')?.value).toBe('refreshed')
    expect(response.headers.get('x-middleware-request-cookie')).toContain(
      'sb-session=refreshed'
    )
    expect(response.cookies.get('sb-session')).toMatchObject({
      value: 'refreshed',
      path: '/',
      sameSite: 'lax',
      maxAge: 3600,
    })
    expect(response.headers.get('location')).toBeNull()
  })

  it('preserves cookie clearing when a rejected session redirects to sign in', async () => {
    mock.getUser.mockImplementation(async () => {
      writeCookies([
        {
          name: 'sb-session',
          value: '',
          options: { path: '/', sameSite: 'lax', maxAge: 0 },
        },
      ])
      return { data: { user: null }, error: new Error('rejected session') }
    })

    const response = await middleware(
      new NextRequest('https://review.example/account')
    )
    const destination = new URL(response.headers.get('location')!)
    expect(destination.pathname).toBe('/auth/sign-in')
    expect(destination.searchParams.get('status')).toBe('session-required')
    expect(destination.searchParams.get('redirectTo')).toBe('/account')
    expect(response.cookies.get('sb-session')).toMatchObject({
      value: '',
      path: '/',
      sameSite: 'lax',
      maxAge: 0,
    })
  })

  it('redirects an unconfigured Account without attempting an Auth request', async () => {
    mock.configured = false
    for (const path of ['/account', '/account/details']) {
      const response = await middleware(
        new NextRequest('https://review.example' + path)
      )
      expect(response.headers.get('location')).toBe(
        'https://review.example/auth/sign-in'
      )
    }
    expect(mock.createClient).not.toHaveBeenCalled()
    expect(mock.getUser).not.toHaveBeenCalled()
    expect(
      (await middleware(new NextRequest('https://review.example/profile')))
        .status
    ).toBe(503)
  })

  it('fails closed when the Auth service cannot be reached', async () => {
    mock.getUser.mockRejectedValue(new TypeError('Failed to fetch'))
    const response = await middleware(
      new NextRequest('https://review.example/account')
    )
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      error: 'Authentication is unavailable',
    })
    expect(response.headers.get('location')).toBeNull()
  })
})
