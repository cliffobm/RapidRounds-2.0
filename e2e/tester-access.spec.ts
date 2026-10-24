import { expect, test, type APIResponse } from '@playwright/test'

function expectPrivateHeaders(response: APIResponse) {
  expect(response.headers()['cache-control']).toMatch(/no-store/i)
  expect(response.headers()['x-robots-tag']).toMatch(/noindex/i)
}

function expectLoginRedirect(response: APIResponse) {
  expect([302, 303, 307, 308]).toContain(response.status())
  const destination = new URL(response.headers().location, response.url())
  expect(destination.origin).toBe(new URL(response.url()).origin)
  expect(destination.pathname).toBe('/tester-login')
  expect(destination.searchParams.get('status')).toBe('session-required')
  expectPrivateHeaders(response)
  return destination
}

test('the private tester entry is usable on a phone without a guest or Vercel link', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const cloudRequests: string[] = []
  page.on('request', (request) => {
    if (/supabase\.(co|in)|\/rest\/v1\/|\/auth\/v1\//i.test(request.url()))
      cloudRequests.push(request.url())
  })

  const response = await page.goto('/tester-login')
  expect(response?.status()).toBe(200)
  expect(response?.headers()['cache-control']).toMatch(/no-store/i)
  expect(response?.headers()['x-robots-tag']).toMatch(/noindex/i)
  await expect(
    page.getByRole('heading', { name: 'Tester sign in', exact: true })
  ).toBeVisible()
  await expect(page.getByLabel('Email', { exact: true })).toBeDisabled()
  await expect(page.getByLabel('Password', { exact: true })).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Sign in', exact: true })
  ).toBeDisabled()
  await expect(
    page.getByText('Tester login is not connected yet.')
  ).toBeVisible()
  await expect(page.getByRole('navigation')).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: /without signing in|guest|vercel/i })
  ).toHaveCount(0)
  await expect(
    page.locator(
      'a[href="/home"], a[href="/practice"], a[href="/rr"], a[href="/study"], a[href="/progress"], a[href*="vercel.com"]'
    )
  ).toHaveCount(0)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
  expect(cloudRequests).toEqual([])
})

test('unauthenticated learning pages redirect before returning SSR content and preserve a safe destination', async ({
  request,
}) => {
  const paths = [
    '/',
    '/home',
    '/practice?topic=cardiac&count=5',
    '/quiz?bank=pulm_template',
    '/rapid-response?case=irregular-pulse',
    '/ecg',
    '/evolving/fever-neuro',
    '/study',
    '/settings',
    '/review-guide',
    '/account',
  ]
  for (const path of paths) {
    const response = await request.get(path, { maxRedirects: 0 })
    const destination = expectLoginRedirect(response)
    expect(destination.searchParams.get('redirectTo')).toBe(path)
    expect(await response.text()).not.toMatch(
      /Current patient information|The Irregular Pulse|Six pillars|Start case/
    )
  }
})

test('RSC, prefetch, HEAD, Next data and forged session cookies cannot bypass the gate', async ({
  request,
}) => {
  for (const path of [
    '/home?_rsc=review-proof',
    '/rapid-response?case=wide-complex-collapse&_rsc=review-proof',
  ]) {
    const response = await request.get(path, {
      maxRedirects: 0,
      headers: {
        RSC: '1',
        'Next-Router-Prefetch': '1',
        'Next-Router-State-Tree': '["",{"children":["home",{}]}]',
      },
    })
    expectLoginRedirect(response)
    expect(await response.text()).not.toContain('Current patient information')
  }
  const data = await request.get('/_next/data/not-a-real-build/home.json', {
    maxRedirects: 0,
    headers: { 'x-nextjs-data': '1' },
  })
  expect(data.status()).toBe(401)
  expectPrivateHeaders(data)
  expect(await data.json()).toEqual({ error: 'Tester sign-in is required' })
  const head = await request.head('/home', { maxRedirects: 0 })
  expectLoginRedirect(head)
  expect(await head.text()).toBe('')
  const forged = await request.get('/home', {
    maxRedirects: 0,
    headers: {
      Cookie: 'sb-review-auth-token=fake; rapidrounds-tester=true',
    },
  })
  expectLoginRedirect(forged)
})

test('unknown, extension and auth-prefix paths stay private', async ({
  request,
}) => {
  for (const path of [
    '/future-feature',
    '/home.json',
    '/practice.svg',
    '/study/private-notes.css',
    '/auth/not-a-public-route',
    '/auth/sign-in/extra',
    '/auth/callback/extra',
    '/tester-login/extra',
    '/tester-login.json',
    '/brand/rapidrounds-intro.mp4',
    '/robots.txt',
    '/apiary',
  ]) {
    expectLoginRedirect(await request.get(path, { maxRedirects: 0 }))
  }
})

test('only the exact public authentication entries and logo resources are public', async ({
  request,
}) => {
  for (const path of ['/tester-login', '/auth/sign-in', '/auth']) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status()).toBe(200)
    expectPrivateHeaders(response)
  }
  const callback = await request.get('/auth/callback', { maxRedirects: 0 })
  expect([302, 303, 307, 308]).toContain(callback.status())
  expectPrivateHeaders(callback)
  const callbackDestination = new URL(
    callback.headers().location,
    callback.url()
  )
  expect(['/auth/sign-in', '/tester-login']).toContain(
    callbackDestination.pathname
  )

  for (const path of [
    '/brand/rapidrounds-metallic.png',
    '/brand/rapidrounds-logo.svg',
  ]) {
    expect((await request.get(path, { maxRedirects: 0 })).status()).toBe(200)
  }
  const image = await request.get(
    '/_next/image?url=%2Fbrand%2Frapidrounds-metallic.png&w=256&q=75',
    { maxRedirects: 0 }
  )
  expect(image.status()).toBe(200)
  expect(image.headers()['content-type']).toMatch(/^image\//)

  for (const url of [
    '/brand/rapidrounds-intro.mp4',
    '/home',
    'https://example.com/private.png',
  ]) {
    const query = new URLSearchParams({ url, w: '256', q: '75' })
    expectLoginRedirect(
      await request.get(`/_next/image?${query}`, { maxRedirects: 0 })
    )
  }
})

test('the review API surface is disabled for every method, including unknown routes', async ({
  request,
}) => {
  for (const path of [
    '/api/profile',
    '/api/questions',
    '/api/new-private-endpoint',
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
      const response = await request.fetch(path, {
        method,
        maxRedirects: 0,
        headers: { 'Content-Type': 'application/json' },
      })
      expect(response.status(), `${method} ${path}`).toBe(503)
      expectPrivateHeaders(response)
      if (method !== 'HEAD') {
        expect(response.headers()['content-type']).toContain('application/json')
        expect(await response.json()).toHaveProperty('error')
      }
    }
  }
})

test('protected page mutations return JSON 401 instead of an executable redirect', async ({
  request,
}) => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    const response = await request.fetch('/home', {
      method,
      maxRedirects: 0,
    })
    expect(response.status()).toBe(401)
    expectPrivateHeaders(response)
    expect(response.headers().location).toBeUndefined()
    expect(response.headers()['content-type']).toContain('application/json')
    expect(await response.json()).toHaveProperty('error')
  }
})

test('the public sign-in and callback routes reject unsafe methods', async ({
  request,
}) => {
  for (const path of [
    '/tester-login',
    '/auth/sign-in',
    '/auth/callback',
    '/auth',
  ]) {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
      const response = await request.fetch(path, {
        method,
        maxRedirects: 0,
      })
      expect(response.status(), `${method} ${path}`).toBe(405)
      expectPrivateHeaders(response)
      expect(response.headers().allow).toContain('GET')
      expect(response.headers().allow).toContain('HEAD')
      expect(response.headers().location).toBeUndefined()
    }
  }
})
