import { vi, beforeEach, describe, it, expect } from 'vitest'
import { getLeaderboard, getUserRank, getLeaderboardWithUserRank } from '@/lib/db/leaderboard'
import { createClient } from '@/lib/supabase/client'
import { queryMock } from '@/src/test/queryMock'
vi.mock('@/lib/supabase/client', () => ({ createClient: vi.fn() }))
const rows = [
  { student_id: 'user1', profiles: { full_name: 'John Doe', institution_id: 'inst1' }, score: 85, completed_at: '2024-01-15T10:00:00Z' },
  { student_id: 'user2', profiles: { full_name: 'Jane Smith', institution_id: 'inst1' }, score: 90, completed_at: '2024-01-14T10:00:00Z' },
]
let builder: ReturnType<typeof queryMock>
beforeEach(() => {
  vi.resetAllMocks()
  builder = queryMock(rows)
  vi.mocked(createClient).mockReturnValue({ from: vi.fn(() => builder) } as any)
})
describe('leaderboard', () => {
  it('aggregates and ranks actual learner scores', async () => {
    expect(await getLeaderboard()).toEqual([
      { student_id: 'user2', student_name: 'Jane Smith', institution_id: 'inst1', total_points: 900, scenarios_completed: 1, average_score: 90, rank: 1 },
      { student_id: 'user1', student_name: 'John Doe', institution_id: 'inst1', total_points: 850, scenarios_completed: 1, average_score: 85, rank: 2 },
    ])
  })
  it('ranks by total points', async () => {
    const result = await getLeaderboard()
    expect(result[0]!.total_points).toBeGreaterThan(result[1]!.total_points)
  })
  it('applies a weekly date filter and completion filters', async () => {
    await getLeaderboard({ timeFilter: 'week' })
    expect(builder.gte).toHaveBeenCalledWith('completed_at', expect.any(String))
    const cutoff = Date.parse(builder.gte.mock.calls[0][1])
    expect(Math.abs(cutoff - (Date.now() - 7 * 86400000))).toBeLessThan(1000)
    expect(builder.eq).toHaveBeenCalledWith('status', 'completed')
    expect(builder.not).toHaveBeenCalledWith('score', 'is', null)
  })
  it('handles empty results', async () => {
    vi.mocked(createClient).mockReturnValue({ from: () => queryMock([]) } as any)
    expect(await getLeaderboard()).toEqual([])
  })
  it('returns an existing user rank', async () => expect(await getUserRank('user1')).toBe(2))
  it('returns null for an absent user', async () => expect(await getUserRank('missing')).toBeNull())
  it('returns the actual user entry', async () => expect(await getLeaderboardWithUserRank('user1')).toMatchObject({ userRank: 2, userEntry: { student_id: 'user1', student_name: 'John Doe' } }))
  it('does not manufacture progress for an absent user', async () => {
    const result = await getLeaderboardWithUserRank('missing')
    expect(result.userRank).toBeNull()
    expect(result.userEntry).toBeUndefined()
  })
})
