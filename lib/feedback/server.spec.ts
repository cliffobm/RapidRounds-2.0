import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mock = vi.hoisted(() => ({
  configured: true,
  url: 'https://ztjudfbsvwqnmqqgkknn.supabase.co',
  create: vi.fn(),
  getUser: vi.fn(),
  membership: vi.fn(),
  fetch: vi.fn(),
}))
vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => [], set: vi.fn() }),
}))
vi.mock('@supabase/ssr', () => ({ createServerClient: mock.create }))
vi.mock('@/lib/env', () => ({
  get DATABASE_CONFIGURED() {
    return mock.configured
  },
  SUPABASE_CONFIG: {
    get url() {
      return mock.url
    },
    anonKey: 'sb_publishable_test',
  },
}))
import { feedbackClient, feedbackIdentity } from './server'

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('RR_TESTER_USER_IDS', 'tester-a')
  vi.stubGlobal('fetch', mock.fetch)
  mock.configured = true
  mock.url = 'https://ztjudfbsvwqnmqqgkknn.supabase.co'
  mock.getUser.mockResolvedValue({
    data: { user: { id: 'tester-a', is_anonymous: false } },
    error: null,
  })
  mock.membership.mockResolvedValue({
    data: { can_review: false },
    error: null,
  })
  mock.create.mockImplementation(() => ({
    auth: { getUser: mock.getUser },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: mock.membership }) }),
    }),
  }))
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('feedback identity and isolated service', () => {
  it('fails closed without configuration or for a different Supabase project', async () => {
    mock.configured = false
    expect((await feedbackIdentity()).status).toBe(503)
    mock.configured = true
    mock.url = 'https://another-project.supabase.co'
    expect(await feedbackClient()).toBeNull()
    expect(mock.create).not.toHaveBeenCalled()
  })
  it('requires a verified nonanonymous user and the server invitation list', async () => {
    for (const user of [null, { id: 'tester-a', is_anonymous: true }]) {
      mock.getUser.mockResolvedValue({ data: { user }, error: null })
      expect((await feedbackIdentity()).status).toBe(401)
    }
    mock.getUser.mockResolvedValue({
      data: { user: { id: 'uninvited' } },
      error: null,
    })
    expect((await feedbackIdentity()).status).toBe(403)
    expect(mock.membership).not.toHaveBeenCalled()
  })
  it('gets reviewer authority only from protected membership, ignoring editable metadata', async () => {
    mock.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'tester-a',
          user_metadata: { role: 'admin', can_review: true },
        },
      },
      error: null,
    })
    expect(await feedbackIdentity()).toMatchObject({
      status: 200,
      reviewer: false,
    })
    mock.membership.mockResolvedValue({ data: null, error: null })
    expect((await feedbackIdentity()).status).toBe(403)
    mock.membership.mockResolvedValue({
      data: { can_review: true },
      error: null,
    })
    expect(await feedbackIdentity()).toMatchObject({
      status: 200,
      reviewer: true,
    })
  })
  it('restricts transport to Auth and the exact two feedback tables', async () => {
    await feedbackClient()
    const restrictedFetch = mock.create.mock.calls[0]![2].global
      .fetch as typeof fetch
    mock.fetch.mockResolvedValue(new Response('{}'))
    await restrictedFetch(
      'https://ztjudfbsvwqnmqqgkknn.supabase.co/rest/v1/rr_item_feedback?select=id'
    )
    for (const url of [
      'https://ztjudfbsvwqnmqqgkknn.supabase.co/rest/v1/profiles',
      'https://ztjudfbsvwqnmqqgkknn.supabase.co/storage/v1/object',
      'https://another-project.supabase.co/rest/v1/rr_item_feedback',
    ])
      await expect(restrictedFetch(url)).rejects.toThrow(
        'outside the tester feedback service'
      )
    expect(mock.fetch).toHaveBeenCalledOnce()
  })
})
