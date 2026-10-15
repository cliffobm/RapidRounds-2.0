import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('migration database isolation', () => {
  it('blocks both client and server queries without explicit credentials', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    const network = vi.fn(() => Promise.reject(new Error('Unexpected network request')))
    vi.stubGlobal('fetch', network)
    const { supabaseClient } = await import('@/lib/supabase-client')
    const { supabase } = await import('@/lib/supabase')
    for (const client of [supabaseClient, supabase]) {
      const result = await client.from('profiles').select('*')
      expect(result.error?.message).toContain('explicitly configured development project')
    }
    expect(network).not.toHaveBeenCalled()
  })
  it('does not report offline placeholders as valid configuration', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    const { DATABASE_CONFIGURED, validateEnvironment } = await import('@/lib/env')
    expect(DATABASE_CONFIGURED).toBe(false)
    expect(validateEnvironment()).toBe(false)
  })
  it('blocks privileged writes when no service credentials are configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '')
    const network = vi.fn(() => Promise.reject(new Error('Unexpected network request')))
    vi.stubGlobal('fetch', network)
    const { supabaseAdmin } = await import('@/lib/supabase-admin')
    const result = await supabaseAdmin.from('event_logs').insert({ event: 'synthetic' })
    expect(result.error?.message).toContain('Admin database is not configured')
    expect(network).not.toHaveBeenCalled()
  })
})
