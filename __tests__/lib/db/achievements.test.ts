import { getAllAchievements, getUserAchievements, getAchievementsWithStatus } from '@/lib/db/achievements'

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [
              {
                id: 'badge1',
                name: 'First Steps',
                description: 'Complete your first scenario',
                icon: '🎯',
                criteria: { type: 'scenarios_completed', value: 1 },
                points: 10,
                category: 'scenario'
              },
              {
                id: 'badge2',
                name: 'Week Warrior',
                description: 'Complete scenarios for 7 days in a row',
                icon: '🔥',
                criteria: { type: 'streak_days', value: 7 },
                points: 75,
                category: 'streak'
              }
            ],
            error: null
          }))
        }))
      }))
    }))
  })
}))

describe('Achievements Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllAchievements', () => {
    it('should return all achievements', async () => {
      const result = await getAllAchievements()

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        id: 'badge1',
        name: 'First Steps',
        description: 'Complete your first scenario',
        icon: '🎯',
        criteria: { type: 'scenarios_completed', value: 1 },
        points: 10,
        category: 'scenario'
      })
    })

    it('should handle empty results', async () => {
      // Mock empty response
      const mockClient = require('@/lib/supabase/client').createClient()
      mockClient.from().select().order().mockReturnValue({
        data: [],
        error: null
      })

      const result = await getAllAchievements()
      expect(result).toEqual([])
    })
  })

  describe('getUserAchievements', () => {
    it('should return user achievements', async () => {
      // Mock user achievements response
      const mockClient = require('@/lib/supabase/client').createClient()
      mockClient.from().select().eq().order().mockReturnValue({
        data: [
          {
            id: 'user-badge1',
            student_id: 'user1',
            badge_id: 'badge1',
            earned_at: '2024-01-15T10:00:00Z',
            badges: {
              id: 'badge1',
              name: 'First Steps',
              description: 'Complete your first scenario',
              icon: '🎯',
              criteria: { type: 'scenarios_completed', value: 1 },
              points: 10,
              category: 'scenario'
            }
          }
        ],
        error: null
      })

      const result = await getUserAchievements('user1')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'user-badge1',
        student_id: 'user1',
        badge_id: 'badge1',
        earned_at: '2024-01-15T10:00:00Z'
      })
    })
  })

  describe('getAchievementsWithStatus', () => {
    it('should return achievements with status information', async () => {
      // Mock the responses for all three functions
      const mockClient = require('@/lib/supabase/client').createClient()
      
      // Mock getAllAchievements
      mockClient.from().select().order().mockReturnValueOnce({
        data: [
          {
            id: 'badge1',
            name: 'First Steps',
            description: 'Complete your first scenario',
            icon: '🎯',
            criteria: { type: 'scenarios_completed', value: 1 },
            points: 10,
            category: 'scenario'
          }
        ],
        error: null
      })

      // Mock getUserAchievements
      mockClient.from().select().eq().order().mockReturnValueOnce({
        data: [
          {
            id: 'user-badge1',
            student_id: 'user1',
            badge_id: 'badge1',
            earned_at: '2024-01-15T10:00:00Z'
          }
        ],
        error: null
      })

      // Mock getUserProgressForAchievements
      mockClient.from().select().eq().not().mockReturnValue({
        data: [
          {
            score: 85,
            completed_at: '2024-01-15T10:00:00Z',
            scenarios: { category: 'Cardiac' }
          }
        ],
        error: null
      })

      const result = await getAchievementsWithStatus('user1')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'badge1',
        name: 'First Steps',
        is_earned: true,
        earned_at: '2024-01-15T10:00:00Z'
      })
    })
  })
})





