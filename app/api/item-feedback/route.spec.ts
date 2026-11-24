import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST, PATCH } from './route'
const { identity } = vi.hoisted(() => ({ identity: vi.fn() }))
vi.mock('@/lib/feedback/server', () => ({ feedbackIdentity: identity }))
const input = {
  id: 'b8c495e6-959a-4cd7-8572-f3952f376a4c',
  itemId: 'breathing-1',
  revision: '2026-11-24.1',
  activity: 'rapid-round',
  prompt: 'Which findings matter?',
  kind: 'flag',
  reason: 'wording',
  comment: 'Clarify the baseline.',
}
const request = (value: unknown = input, origin = 'https://review.example') =>
  new NextRequest('https://review.example/api/item-feedback', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(value),
  })
function client(
  {
    existing = null,
    count = 0,
    error = false,
  }: { existing: unknown; count: number; error: boolean } = {
    existing: null,
    count: 0,
    error: false,
  }
) {
  const insert = vi.fn(),
    update = vi.fn()
  const query: any = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    maybeSingle: vi.fn(async () => ({ data: existing, error: null })),
    gte: vi.fn(async () => ({ count, error: null })),
    limit: vi.fn(async () => ({ data: [], error: null })),
    insert: vi.fn((v: unknown) => {
      insert(v)
      return query
    }),
    update: vi.fn((v: unknown) => {
      update(v)
      return query
    }),
    single: vi.fn(async () => ({
      data: error ? null : { id: input.id, status: 'received' },
      error: error ? { message: 'db unavailable' } : null,
    })),
  }
  return { from: vi.fn(() => query), insert, update, query }
}
beforeEach(() => identity.mockReset())
describe('shared item feedback endpoint', () => {
  it('rejects cross-origin mutations before authenticating', async () => {
    expect((await POST(request(input, 'https://other.example'))).status).toBe(
      403
    )
    expect(identity).not.toHaveBeenCalled()
  })
  it('requires a verified invited identity and never falls back to public or device-only receipt', async () => {
    for (const status of [401, 403, 503]) {
      identity.mockResolvedValue({
        client: null,
        user: null,
        reviewer: false,
        status,
      })
      const response = await POST(request())
      expect(response.status).toBe(status)
      expect(await response.json()).not.toHaveProperty('report')
    }
  })
  it('uses the authenticated owner and immutable item revision when storing a report', async () => {
    const db = client()
    identity.mockResolvedValue({
      client: db,
      user: { id: 'verified-user' },
      reviewer: false,
      status: 200,
    })
    const response = await POST(request())
    expect(response.status).toBe(201)
    expect(db.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'verified-user',
        item_id: 'breathing-1',
        item_revision: input.revision,
      })
    )
    expect(response.headers.get('cache-control')).toContain('no-store')
  })
  it('makes retries idempotent and rate-limits new submissions', async () => {
    const retry = client({
      existing: { id: input.id, status: 'received' },
      count: 0,
      error: false,
    })
    identity.mockResolvedValue({
      client: retry,
      user: { id: 'verified-user' },
      reviewer: false,
      status: 200,
    })
    expect((await POST(request())).status).toBe(200)
    expect(retry.insert).not.toHaveBeenCalled()
    const limited = client({ existing: null, count: 20, error: false })
    identity.mockResolvedValue({
      client: limited,
      user: { id: 'verified-user' },
      reviewer: false,
      status: 200,
    })
    expect((await POST(request())).status).toBe(429)
    expect(limited.insert).not.toHaveBeenCalled()
  })
  it('rejects client-supplied ownership and malformed reports before writing', async () => {
    const db = client()
    identity.mockResolvedValue({
      client: db,
      user: { id: 'verified-user' },
      reviewer: false,
      status: 200,
    })
    expect((await POST(request({ ...input, user_id: 'forged' }))).status).toBe(
      400
    )
    expect(
      (await POST(request({ ...input, comment: 'x'.repeat(4001) }))).status
    ).toBe(400)
    expect(db.insert).not.toHaveBeenCalled()
  })
  it('keeps ordinary testers out of reviewer mutations and lets RLS scope report reads', async () => {
    const db = client()
    identity.mockResolvedValue({
      client: db,
      user: { id: 'verified-user' },
      reviewer: false,
      status: 200,
    })
    const patch = new NextRequest('https://review.example/api/item-feedback', {
      method: 'PATCH',
      headers: {
        origin: 'https://review.example',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id: input.id,
        status: 'updated',
        reviewerNote: 'Clarified.',
      }),
    })
    expect((await PATCH(patch)).status).toBe(403)
    expect(db.update).not.toHaveBeenCalled()
    const r = await GET()
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ reports: [], reviewer: false })
  })
  it('requires reviewer explanations and never accepts an update to the original tester comment', async () => {
    const db = client()
    identity.mockResolvedValue({
      client: db,
      user: { id: 'verified-user' },
      reviewer: true,
      status: 200,
    })
    const mutation = (extra: object) =>
      new NextRequest('https://review.example/api/item-feedback', {
        method: 'PATCH',
        headers: {
          origin: 'https://review.example',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id: input.id,
          status: 'updated',
          reviewerNote: 'Baseline clarified.',
          ...extra,
        }),
      })
    expect((await PATCH(mutation({ comment: 'overwrite' }))).status).toBe(400)
    expect((await PATCH(mutation({}))).status).toBe(200)
    expect(db.update).toHaveBeenCalledWith({
      status: 'updated',
      reviewer_note: 'Baseline clarified.',
    })
  })
})
