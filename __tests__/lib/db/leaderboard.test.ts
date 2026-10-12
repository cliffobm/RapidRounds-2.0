import { getLeaderboard, getUserRank, getLeaderboardWithUserRank } from '@/lib/db/leaderboard'

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          not: jest.fn(() => ({
            gte: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => ({
                  data: [
                    {
                      student_id: 'user1',
                      profiles: { full_name: 'John Doe', institution_id: 'inst1' },
                      score: 85,
                      completed_at: '2024-01-15T10:00:00Z',
                      scenarios: { title: 'Test Scenario', category: 'Cardiac' }
                    },
                    {
                      student_id: 'user2',
                      profiles: { full_name: 'Jane Smith', institution_id: 'inst1' },
                      score: 90,
                      completed_at: '2024-01-14T10:00:00Z',
                      scenarios: { title: 'Test Scenario 2', category: 'Respiratory' }
                    }
                  ],
                  error: null
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  })
}))

describe('Leaderboard Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getLeaderboard', () => {
    it('should return leaderboard entries with correct structure', async () => {
      const result = await getLeaderboard()

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        student_id: 'user1',
        student_name: 'John Doe',
        total_points: expect.any(Number),
        scenarios_completed: expect.any(Number),
        average_score: expect.any(Number),
        rank: 1,
        institution_id: 'inst1'
      })
    })

    it('should rank entries by total points', async () => {
      const result = await getLeaderboard()

      expect(result[0]?.rank).toBe(1)
      expect(result[1]?.rank).toBe(2)
      expect(result[0]?.total_points).toBeGreaterThanOrEqual(result[1]?.total_points || 0)
    })

    it('should apply time filter correctly', async () => {
      const result = await getLeaderboard({ timeFilter: 'week' })

      expect(result).toBeDefined()
      // In a real test, we would verify the query was called with correct date filter
    })

    it('should handle empty results', async () => {
      // Mock empty response
      const mockClient = require('@/lib/supabase/client').createClient()
      mockClient.from().select().eq().not().gte().order().limit.mockReturnValue({
        data: [],
        error: null
      })

      const result = await getLeaderboard()
      expect(result).toEqual([])
    })
  })

  describe('getUserRank', () => {
    it('should return user rank when user exists in leaderboard', async () => {
      const result = await getUserRank('user1')
      expect(result).toBe(1)
    })

    it('should return null when user not found', async () => {
      const result = await getUserRank('nonexistent-user')
      expect(result).toBeNull()
    })
  })

  describe('getLeaderboardWithUserRank', () => {
    it('should return leaderboard with user rank and entry', async () => {
      const result = await getLeaderboardWithUserRank('user1')

      expect(result).toMatchObject({
        leaderboard: expect.any(Array),
        userRank: 1,
        userEntry: expect.objectContaining({
          student_id: 'user1',
          student_name: 'John Doe'
        })
      })
    })

    it('should return null userRank when user not found', async () => {
      const result = await getLeaderboardWithUserRank('nonexistent-user')

      expect(result.userRank).toBeNull()
      expect(result.userEntry).toBeUndefined()
    })
  })
})
