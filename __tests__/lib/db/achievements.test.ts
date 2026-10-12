import { vi, beforeEach, describe, it, expect } from 'vitest'
import { getAllAchievements, getUserAchievements, getAchievementsWithStatus } from '@/lib/db/achievements'
import { createClient } from '@/lib/supabase/client'
import { queryMock } from '@/src/test/queryMock'
vi.mock('@/lib/supabase/client', () => ({ createClient: vi.fn() }))
const badge = { id: 'badge1', name: 'First Steps', description: 'Complete your first scenario', icon: '🎯', criteria: { type: 'scenarios_completed', value: 1 }, points: 10, category: 'scenario' }
const userBadge = { id: 'user-badge1', student_id: 'user1', badge_id: 'badge1', earned_at: '2024-01-15T10:00:00Z' }
const from = vi.fn()
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(createClient).mockReturnValue({ from } as any)
  from.mockImplementation(table => queryMock(table === 'badges' ? [badge] : table === 'student_badges' ? [userBadge] : [{ score: 85, completed_at: '2024-01-15T10:00:00Z', scenarios: { category: 'Cardiac' } }]))
})
describe('achievements', () => {
  it('returns all achievements in query order', async () => {
    const builder = queryMock([badge])
    from.mockReturnValue(builder)
    expect(await getAllAchievements()).toEqual([badge])
    expect(builder.order).toHaveBeenCalledWith('category', { ascending: true })
    expect(builder.order).toHaveBeenCalledWith('points', { ascending: true })
  })
  it('handles empty results', async () => {
    from.mockReturnValue(queryMock([]))
    expect(await getAllAchievements()).toEqual([])
  })
  it('returns achievements for the selected learner', async () => {
    const builder = queryMock([userBadge])
    from.mockReturnValue(builder)
    expect(await getUserAchievements('user1')).toEqual([userBadge])
    expect(builder.eq).toHaveBeenCalledWith('student_id', 'user1')
  })
  it('combines earned status with the achievement registry', async () => {
    expect(await getAchievementsWithStatus('user1')).toMatchObject([{ ...badge, is_earned: true, earned_at: userBadge.earned_at }])
    expect(from).toHaveBeenCalledWith('student_progress')
  })
})
