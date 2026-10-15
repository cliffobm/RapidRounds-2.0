import { describe, it, expect, vi } from 'vitest'
vi.mock('@/lib/env', () => ({ SUPABASE_CONFIG: { url: 'https://session-test.supabase.co', anonKey: 'test-publishable-key' }, validateEnvironment: () => true }))

describe('browser session storage', () => {
  it('shares one client and writes sign-in sessions to cookies for middleware', async () => {
    const user = { id: '1d899213-adca-483d-9f75-708f7a397528', email: 'learner.a@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() }
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ user, access_token: 'header.payload.signature', refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600 }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const { createClient, supabase } = await import('./client')
    const { supabaseClient } = await import('../supabase-client')
    expect(createClient()).toBe(supabase)
    expect(supabaseClient).toBe(supabase)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: 'test-password' })
      expect(error).toBeNull()
      expect(document.cookie).toContain('sb-session-test-auth-token=')
      await supabase.auth.signOut({ scope: 'local' })
      expect(document.cookie).not.toContain('sb-session-test-auth-token=')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
