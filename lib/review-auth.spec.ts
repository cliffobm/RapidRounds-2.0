import { afterEach, describe, expect, it, vi } from 'vitest'
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})
async function configured() {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://review-auth.example')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test_only')
  vi.stubEnv('NEXT_PUBLIC_REVIEW_AUTH_ONLY', 'true')
  vi.resetModules()
  return import('./env')
}
describe('Auth-only review configuration', () => {
  it('allows only this project Auth endpoints and blocks legacy data writes before network access', async () => {
    const network = vi.fn().mockResolvedValue(new Response('{}'))
    vi.stubGlobal('fetch', network)
    const env = await configured()
    expect(env.DATABASE_CONFIGURED).toBe(true)
    expect(env.LEGACY_DATABASE_ENABLED).toBe(false)
    await env.supabaseFetch(
      'https://review-auth.example/auth/v1/token?grant_type=password',
      { method: 'POST' }
    )
    expect(network).toHaveBeenCalledTimes(1)
    for (const path of [
      '/rest/v1/profiles',
      '/rest/v1/progress',
      '/rest/v1/bookmarks',
      '/rest/v1/rpc/calculate_leaderboard',
    ])
      await expect(
        env.supabaseFetch('https://review-auth.example' + path)
      ).rejects.toThrow('Cloud data requests')
    await expect(
      env.supabaseFetch('https://other.example/auth/v1/user')
    ).rejects.toThrow('Cloud data requests')
    expect(network).toHaveBeenCalledTimes(1)
  })
  it('keeps an unconfigured build offline', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    vi.resetModules()
    const network = vi.fn()
    vi.stubGlobal('fetch', network)
    const env = await import('./env')
    expect(env.DATABASE_CONFIGURED).toBe(false)
    await expect(
      env.supabaseFetch('http://127.0.0.1:54321/auth/v1/user')
    ).rejects.toThrow('explicitly configured')
    expect(network).not.toHaveBeenCalled()
  })
})
