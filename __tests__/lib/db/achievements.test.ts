import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getAllAchievements,
  getUserAchievements,
  getAchievementsWithStatus,
} from '@/lib/db/achievements'
const { from } = vi.hoisted(() => ({ from: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ from }) }))
const badge = {
  id: 'badge1',
  name: 'First Steps',
  description: 'Complete a scenario',
  icon: 'badge',
  criteria: { type: 'scenarios_completed', value: 1 },
  points: 10,
  category: 'scenario',
}
let results: Record<string, { data: unknown; error: unknown }>
let queries: Record<string, any>
beforeEach(() => {
  results = {
    badges: { data: [badge], error: null },
    student_badges: { data: [], error: null },
    student_progress: { data: [], error: null },
  }
  queries = {}
  from.mockImplementation((table: string) => {
    const query: any = {
      then: (resolve: any) => Promise.resolve(results[table]).then(resolve),
    }
    for (const method of ['select', 'eq', 'order', 'not'])
      query[method] = vi.fn(() => query)
    queries[table] = query
    return query
  })
})
describe('achievement data queries', () => {
  it('returns source badges and applies both ordering clauses', async () => {
    expect(await getAllAchievements()).toEqual([badge])
    expect(queries.badges.order.mock.calls).toEqual([
      ['category', { ascending: true }],
      ['points', { ascending: true }],
    ])
  })
  it('returns empty results when there are no source badges', async () => {
    results.badges!.data = []
    expect(await getAllAchievements()).toEqual([])
  })
  it('scopes earned badges to the requested student', async () => {
    const earned = {
      id: 'earned1',
      student_id: 'user1',
      badge_id: badge.id,
      earned_at: '2026-10-17T08:00:00Z',
    }
    results.student_badges!.data = [earned]
    expect(await getUserAchievements('user1')).toEqual([earned])
    expect(queries.student_badges.eq).toHaveBeenCalledWith(
      'student_id',
      'user1'
    )
  })
  it('distinguishes earned badges from progress toward unearned badges', async () => {
    results.student_badges!.data = [
      { badge_id: badge.id, earned_at: '2026-10-17T08:00:00Z' },
    ]
    expect(await getAchievementsWithStatus('user1')).toEqual([
      expect.objectContaining({
        id: badge.id,
        is_earned: true,
        earned_at: '2026-10-17T08:00:00Z',
      }),
    ])
    results.student_badges!.data = []
    const result = await getAchievementsWithStatus('user1')
    expect(result[0]).toMatchObject({
      is_earned: false,
      progress: { current: 0, target: 1, percentage: 0 },
    })
    expect(queries.student_progress.eq).toHaveBeenCalledWith(
      'student_id',
      'user1'
    )
  })
})
