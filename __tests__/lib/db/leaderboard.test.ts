import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getLeaderboard,
  getUserRank,
  getLeaderboardWithUserRank,
} from '@/lib/db/leaderboard'
const { from } = vi.hoisted(() => ({ from: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ from }) }))
let rows: unknown[], error: unknown, query: any
beforeEach(() => {
  rows = [
    {
      student_id: 'user1',
      profiles: { full_name: 'Nurse One', institution_id: 'inst1' },
      score: 85,
    },
    {
      student_id: 'user2',
      profiles: { full_name: 'Nurse Two', institution_id: 'inst1' },
      score: 90,
    },
    {
      student_id: 'user1',
      profiles: { full_name: 'Nurse One', institution_id: 'inst1' },
      score: 80,
    },
  ]
  error = null
  query = {
    then: (resolve: any) =>
      Promise.resolve({ data: rows, error }).then(resolve),
  }
  for (const method of ['select', 'eq', 'not', 'gte'])
    query[method] = vi.fn(() => query)
  from.mockReturnValue(query)
})
describe('leaderboard data integrity', () => {
  it('aggregates source results and ranks the combined points', async () => {
    expect(await getLeaderboard()).toEqual([
      {
        student_id: 'user1',
        student_name: 'Nurse One',
        total_points: 1650,
        scenarios_completed: 2,
        average_score: 83,
        rank: 1,
        institution_id: 'inst1',
      },
      {
        student_id: 'user2',
        student_name: 'Nurse Two',
        total_points: 900,
        scenarios_completed: 1,
        average_score: 90,
        rank: 2,
        institution_id: 'inst1',
      },
    ])
  })
  it('applies a time and institution filter to the query', async () => {
    await getLeaderboard({ timeFilter: 'week', institutionId: 'inst1' })
    expect(query.gte).toHaveBeenCalledWith('completed_at', expect.any(String))
    expect(query.eq).toHaveBeenCalledWith('profiles.institution_id', 'inst1')
  })
  it('honors the requested result limit', async () => {
    expect(await getLeaderboard({ limit: 1 })).toHaveLength(1)
  })
  it('does not invent results for an empty collection', async () => {
    rows = []
    expect(await getLeaderboard()).toEqual([])
  })
  it('does not substitute fabricated people when the data source fails', async () => {
    error = { message: 'Unavailable' }
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(await getLeaderboard()).toEqual([])
    warning.mockRestore()
  })
  it('returns the actual user rank', async () => {
    expect(await getUserRank('user1')).toBe(1)
  })
  it('returns no rank for an absent user', async () => {
    expect(await getUserRank('absent')).toBeNull()
  })
  it('does not fabricate progress for a user missing from a real leaderboard', async () => {
    const result = await getLeaderboardWithUserRank('absent')
    expect(result.userRank).toBeNull()
    expect(result.userEntry).toBeUndefined()
    expect(
      (await getLeaderboardWithUserRank('user1')).userEntry?.student_id
    ).toBe('user1')
  })
})
