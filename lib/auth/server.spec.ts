import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), single: vi.fn() }))
vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: vi.fn() }) }))
vi.mock('@supabase/ssr', () => ({ createServerClient: () => ({ auth: { getUser: mocks.getUser }, from: () => ({ select: () => ({ eq: () => ({ single: mocks.single }) }) }) }) }))
import { validateUserAccess } from './server'
const request = new NextRequest('http://localhost/test')

describe('protected profile authorization', () => {
  beforeEach(() => {
    vi.stubGlobal('window', undefined)
    vi.stubEnv('NODE_ENV', 'development')
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'a', email: 'a@example.com', user_metadata: { role: 'admin' } } }, error: null })
  })
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })
  it('rejects an admin role claimed through editable user metadata', async () => {
    mocks.single.mockResolvedValue({ data: { role: 'student' }, error: null })
    expect((await validateUserAccess(request, 'admin')).error?.status).toBe(403)
  })
  it('accepts an admin role read from the protected profile', async () => {
    mocks.single.mockResolvedValue({ data: { role: 'admin' }, error: null })
    expect((await validateUserAccess(request, 'admin')).user?.role).toBe('admin')
  })
  it('denies elevated access on profile errors and unauthenticated requests', async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: 'unavailable' } })
    expect((await validateUserAccess(request, 'admin')).error?.status).toBe(403)
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })
    expect((await validateUserAccess(request, 'admin')).error?.status).toBe(401)
  })
})
