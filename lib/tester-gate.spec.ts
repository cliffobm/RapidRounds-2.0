import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { NextRequest, type NextResponse } from 'next/server'

const mock = vi.hoisted(() => ({
  configured: true,
  reviewOnly: true,
  createClient: vi.fn(),
  getUser: vi.fn(),
  fetch: vi.fn(),
}))

vi.mock('@/lib/env', () => ({
  get DATABASE_CONFIGURED() {
    return mock.configured
  },
  get REVIEW_AUTH_ONLY() {
    return mock.reviewOnly
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
let readCookies: () => { name: string; value: string }[]

beforeAll(() => {
  // Keep NextRequest and its internal Headers in the same Fetch API realm.
  vi.stubGlobal(
    'Headers',
    new NextRequest('https://review.example').headers.constructor
  )
})
afterAll(() => vi.unstubAllGlobals())
afterEach(() => vi.unstubAllEnvs())

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('RR_REQUIRE_TESTER_LOGIN', 'true')
  vi.stubEnv('RR_TESTER_USER_IDS', 'tester')
  mock.configured = true
  mock.reviewOnly = true
  mock.createClient.mockImplementation((_url, _key, options) => {
    writeCookies = options.cookies.setAll
    readCookies = options.cookies.getAll
    return { auth: { getUser: mock.getUser } }
  })
  mock.getUser.mockResolvedValue({
    data: {
      user: { id: 'tester', email: 'tester@example.com', is_anonymous: false },
    },
    error: null,
  })
})

function request(
  path: string,
  init?: ConstructorParameters<typeof NextRequest>[1]
) {
  return new NextRequest('https://review.example' + path, init)
}
function expectPrivate(response: NextResponse) {
  expect(response.headers.get('cache-control')).toBe(
    'private, no-store, max-age=0'
  )
  expect(response.headers.get('pragma')).toBe('no-cache')
  expect(response.headers.get('expires')).toBe('0')
  expect(response.headers.get('x-robots-tag')).toBe(
    'noindex, nofollow, noarchive'
  )
}
function expectLogin(response: NextResponse, destination = '/home') {
  expect(response.status).toBe(307)
  const url = new URL(response.headers.get('location')!)
  expect(url.origin).toBe('https://review.example')
  expect(url.pathname).toBe('/tester-login')
  expect(url.searchParams.get('status')).toBe('session-required')
  expect(url.searchParams.get('redirectTo')).toBe(destination)
  expectPrivate(response)
}

describe('tester gate route coverage', () => {
  it('matches every route so new pages and data requests inherit the gate', () => {
    expect(config.matcher).toEqual(['/:path*'])
  })

  it('requires authentication for learning, review, account and future pages', async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
    for (const path of [
      '/',
      '/home',
      '/practice',
      '/quiz',
      '/quick-check',
      '/rr',
      '/rr/fluid-loss',
      '/evolving/headache',
      '/rapid-response',
      '/study',
      '/study/topics/critical-care',
      '/ecg',
      '/glossary',
      '/test',
      '/review',
      '/review-guide',
      '/content-review',
      '/settings',
      '/progress',
      '/account',
      '/profile',
      '/admin',
      '/future-feature',
      '/does-not-exist',
    ]) {
      const response = await middleware(request(path))
      expectLogin(
        response,
        ['/admin', '/future-feature', '/does-not-exist'].includes(path)
          ? '/home'
          : path
      )
    }
    expect(mock.getUser).toHaveBeenCalledTimes(24)
  })

  it('preserves the requested case and saved-session query without an external redirect', async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
    const path =
      '/rapid-response?case=wide-complex-collapse&session=saved-attempt'
    expectLogin(await middleware(request(path)), path)
  })

  it('does not let filename suffixes, broad auth prefixes or data paths bypass authentication', async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
    for (const path of [
      '/home.json',
      '/future-feature.svg',
      '/auth/anything',
      '/tester-login/extra',
      '/brand-not-public/logo.png',
      '/brand/rapidrounds-intro.mp4',
      '/_next/data/build/home.json',
      '/_next/static-other/chunk.js',
      '/_next/image/extra',
    ]) {
      expectLogin(await middleware(request(path)))
    }
    const apiResponse = await middleware(request('/api/metrics/log.json'))
    expect(apiResponse.status).toBe(503)
  })

  it('still authenticates RSC, prefetch and middleware-subrequest header requests', async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
    for (const headers of [
      { RSC: '1' },
      { 'Next-Router-Prefetch': '1' },
      { Purpose: 'prefetch' },
      { 'x-middleware-prefetch': '1' },
      {
        'x-middleware-subrequest':
          'middleware:middleware:middleware:middleware:middleware',
      },
    ]) {
      expectLogin(
        await middleware(request('/practice', { headers })),
        '/practice'
      )
    }
    expect(mock.getUser).toHaveBeenCalledTimes(5)
  })

  it('does not expose protected content through HEAD', async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
    expectLogin(
      await middleware(request('/practice', { method: 'HEAD' })),
      '/practice'
    )
  })

  it('returns 401 instead of forwarding protected mutations to the login page', async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
      const response = await middleware(request('/practice', { method }))
      expect(response.status).toBe(401)
      expect(response.headers.get('location')).toBeNull()
      expect(await response.json()).toEqual({
        error: 'Tester sign-in is required',
      })
      expectPrivate(response)
    }
  })
})

describe('public tester entry points and resources', () => {
  it('serves only the exact public auth pages without an Auth dependency', async () => {
    mock.configured = false
    for (const path of [
      '/tester-login',
      '/auth',
      '/auth/sign-in',
      '/auth/callback?code=pkce',
    ]) {
      for (const method of ['GET', 'HEAD']) {
        const response = await middleware(request(path, { method }))
        expect(response.headers.get('x-middleware-next')).toBe('1')
        expect(response.headers.get('location')).toBeNull()
        expectPrivate(response)
      }
    }
    expect(mock.createClient).not.toHaveBeenCalled()
  })

  it('rejects mutations and server action submissions to public auth pages', async () => {
    for (const path of [
      '/tester-login',
      '/auth',
      '/auth/sign-in',
      '/auth/callback',
    ]) {
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
        const response = await middleware(
          request(path, {
            method,
            headers: { 'Next-Action': 'forged-action-id' },
          })
        )
        expect(response.status).toBe(405)
        expect(response.headers.get('allow')).toBe('GET, HEAD')
        expect(response.headers.get('location')).toBeNull()
        expectPrivate(response)
      }
    }
    expect(mock.createClient).not.toHaveBeenCalled()
  })

  it('serves actual static resources and the approved optimized logo without a login', async () => {
    for (const path of [
      '/_next/static/chunks/app/page.js',
      '/_next/static/css/app.css',
      '/brand/rapidrounds-metallic.png',
      '/brand/rapidrounds-logo.svg',
      '/favicon.ico',
      '/_next/image?url=%2Fbrand%2Frapidrounds-metallic.png&w=256&q=75',
    ]) {
      for (const method of ['GET', 'HEAD']) {
        const response = await middleware(request(path, { method }))
        expect(response.headers.get('x-middleware-next')).toBe('1')
        expect(response.headers.get('location')).toBeNull()
      }
    }
    expect(mock.createClient).not.toHaveBeenCalled()
  })

  it('rejects unsafe methods even on approved public resources', async () => {
    for (const path of [
      '/brand/rapidrounds-logo.svg',
      '/_next/static/chunks/app/page.js',
    ]) {
      const response = await middleware(request(path, { method: 'POST' }))
      expect(response.status).toBe(405)
      expect(response.headers.get('allow')).toBe('GET, HEAD')
      expectPrivate(response)
    }
    expect(mock.createClient).not.toHaveBeenCalled()
  })

  it('requires a session before image optimization for arbitrary or duplicated sources', async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
    for (const path of [
      '/_next/image?url=https%3A%2F%2Fattacker.example%2Fimage.png&w=256&q=75',
      '/_next/image?url=%2Fbrand%2Frapidrounds-metallic.png&url=https%3A%2F%2Fattacker.example',
      '/_next/image?w=256&q=75',
    ]) {
      expectLogin(await middleware(request(path)))
    }
  })
})

describe('tester identity and session safety', () => {
  it('verifies the cookie with Auth and passes refreshed cookies to the page and browser', async () => {
    const nextRequest = request('/practice', {
      headers: { cookie: 'sb-session=expired' },
    })
    mock.getUser.mockImplementation(async () => {
      expect(readCookies()).toContainEqual({
        name: 'sb-session',
        value: 'expired',
      })
      writeCookies([
        {
          name: 'sb-session',
          value: 'refreshed',
          options: { path: '/', sameSite: 'lax', maxAge: 3600 },
        },
      ])
      return {
        data: { user: { id: 'tester', is_anonymous: false } },
        error: null,
      }
    })
    const response = await middleware(nextRequest)
    expect(mock.createClient).toHaveBeenCalledWith(
      'https://review-auth.example',
      'sb_publishable_review_test',
      expect.objectContaining({ global: { fetch: mock.fetch } })
    )
    expect(mock.getUser).toHaveBeenCalledOnce()
    expect(nextRequest.cookies.get('sb-session')?.value).toBe('refreshed')
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
    expectPrivate(response)
  })

  it('rejects a forged cookie when Auth returns no user', async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
    expectLogin(
      await middleware(
        request('/home', {
          headers: { cookie: 'sb-session=forged-user-and-role' },
        })
      )
    )
    expect(mock.getUser).toHaveBeenCalledOnce()
  })

  it('rejects a user-shaped result with an authentication error', async () => {
    mock.getUser.mockResolvedValue({
      data: { user: { id: 'tester' } },
      error: new Error('expired'),
    })
    expectLogin(await middleware(request('/home')))
  })

  it('rejects anonymous Supabase users even though they have a user ID', async () => {
    mock.getUser.mockResolvedValue({
      data: { user: { id: 'anonymous-user', is_anonymous: true } },
      error: null,
    })
    expectLogin(await middleware(request('/home')))
  })

  it('preserves cookie clearing on an authentication denial', async () => {
    mock.getUser.mockImplementation(async () => {
      writeCookies([
        {
          name: 'sb-session',
          value: '',
          options: { path: '/', sameSite: 'lax', maxAge: 0 },
        },
      ])
      return { data: { user: null }, error: new Error('rejected') }
    })
    const response = await middleware(request('/account'))
    expectLogin(response, '/account')
    expect(response.cookies.get('sb-session')).toMatchObject({
      value: '',
      path: '/',
      sameSite: 'lax',
      maxAge: 0,
    })
  })

  it('fails closed without sending an Auth request when configuration is missing', async () => {
    mock.configured = false
    expectLogin(await middleware(request('/home')))
    const response = await middleware(request('/practice', { method: 'POST' }))
    expect(response.status).toBe(401)
    expectPrivate(response)
    expect(mock.createClient).not.toHaveBeenCalled()
  })

  it('fails closed with a private service error when Auth cannot be reached', async () => {
    mock.getUser.mockRejectedValue(new TypeError('private network detail'))
    const response = await middleware(request('/home'))
    expect(response.status).toBe(503)
    expect(response.headers.get('location')).toBeNull()
    expect(await response.json()).toEqual({
      error: 'Authentication is unavailable',
    })
    expectPrivate(response)
  })

  it('retains cookie clearing if a token-refresh attempt throws after updating cookies', async () => {
    mock.getUser.mockImplementation(async () => {
      writeCookies([
        {
          name: 'sb-session',
          value: '',
          options: { path: '/', sameSite: 'lax', maxAge: 0 },
        },
      ])
      throw new TypeError('network unavailable')
    })
    const response = await middleware(request('/home'))
    expect(response.status).toBe(503)
    expect(response.cookies.get('sb-session')).toMatchObject({
      value: '',
      path: '/',
      sameSite: 'lax',
      maxAge: 0,
    })
    expectPrivate(response)
  })
})

describe('review cloud API isolation', () => {
  it('keeps the public tester host gated even if its environment flag is removed', async () => {
    vi.stubEnv('RR_REQUIRE_TESTER_LOGIN', 'false')
    vi.stubEnv('RR_TESTER_USER_IDS', '')
    const response = await middleware(
      new NextRequest(
        'https://rapidrounds-cjis-review-git-aee10c-benjamin-cliffords-projects.vercel.app/home'
      )
    )
    expect(new URL(response.headers.get('location')!).pathname).toBe(
      '/tester-login'
    )
    expectPrivate(response)
  })
  it('denies authenticated accounts absent from the organizer tester list, including an empty list', async () => {
    for (const allowed of ['', 'another-tester']) {
      vi.stubEnv('RR_TESTER_USER_IDS', allowed)
      const response = await middleware(request('/home'))
      expect(
        new URL(response.headers.get('location')!).searchParams.get('status')
      ).toBe('tester-not-invited')
      expectPrivate(response)
    }
  })
  it('disables all existing and future APIs before client creation for every method', async () => {
    for (const path of [
      '/api',
      '/api/access/rationale',
      '/api/create-checkout',
      '/api/metrics/log',
      '/api/webhooks/stripe',
      '/api/future-endpoint',
    ]) {
      for (const method of [
        'GET',
        'HEAD',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ]) {
        const response = await middleware(
          request(path, {
            method,
            headers: { cookie: 'sb-session=apparently-authenticated' },
          })
        )
        expect(response.status).toBe(503)
        expect(response.headers.get('location')).toBeNull()
        expect(await response.json()).toEqual({
          error: 'Cloud endpoints are unavailable in the tester review edition',
        })
        expectPrivate(response)
      }
    }
    expect(mock.createClient).not.toHaveBeenCalled()
    expect(mock.fetch).not.toHaveBeenCalled()
  })

  it('returns JSON 401 for unauthenticated APIs if the legacy API isolation flag is off', async () => {
    mock.reviewOnly = false
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
    const response = await middleware(request('/api/future-endpoint'))
    expect(response.status).toBe(401)
    expect(response.headers.get('location')).toBeNull()
    expect(await response.json()).toEqual({
      error: 'Tester sign-in is required',
    })
    expectPrivate(response)
  })

  it('retains the explicitly ungated offline learning mode without weakening Account protection', async () => {
    vi.stubEnv('RR_REQUIRE_TESTER_LOGIN', 'false')
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null })
    const learning = await middleware(request('/practice'))
    expect(learning.headers.get('x-middleware-next')).toBe('1')
    expect(mock.createClient).not.toHaveBeenCalled()
    const account = await middleware(request('/account'))
    expect(new URL(account.headers.get('location')!).pathname).toBe(
      '/auth/sign-in'
    )
    expect(mock.getUser).toHaveBeenCalledOnce()
  })
})
