import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AccessControl } from './access'
import { PaymentService } from './payments/stripe'

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        gte: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      upsert: vi.fn(),
    })),
  },
}))

// Mock PaymentService
vi.mock('./payments/stripe', () => ({
  PaymentService: {
    isTrialActive: vi.fn(),
  },
}))

describe('AccessControl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('canSeeFullRationale', () => {
    it('should allow access for premium users', async () => {
      const mockProfile = {
        subscription_tier: 'premium',
        trial_active: false,
        trial_expires_at: null,
      }

      // Mock Supabase response
      const { supabase } = await import('./supabase')
      const mockFrom = supabase.from as any
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      })

      const result = await AccessControl.canSeeFullRationale('user-123', {
        rationalesUsed: 10,
        scenariosCompleted: 5,
        lessonsCompleted: 3,
      })

      expect(result.hasAccess).toBe(true)
      expect(result.reason).toBe('premium')
      expect(result.upgradeRequired).toBe(false)
    })

    it('should allow access for trial users', async () => {
      const mockProfile = {
        subscription_tier: 'free',
        trial_active: true,
        trial_expires_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      }

      const { supabase } = await import('./supabase')
      const mockFrom = supabase.from as any
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      })

      // Mock PaymentService
      vi.mocked(PaymentService.isTrialActive).mockReturnValue(true)

      const result = await AccessControl.canSeeFullRationale('user-123', {
        rationalesUsed: 3,
        scenariosCompleted: 2,
        lessonsCompleted: 1,
      })

      expect(result.hasAccess).toBe(true)
      expect(result.reason).toBe('trial')
    })

    it('should allow access within free limit', async () => {
      const mockProfile = {
        subscription_tier: 'free',
        trial_active: false,
        trial_expires_at: null,
      }

      const { supabase } = await import('./supabase')
      const mockFrom = supabase.from as any
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      })

      vi.mocked(PaymentService.isTrialActive).mockReturnValue(false)

      const result = await AccessControl.canSeeFullRationale('user-123', {
        rationalesUsed: 3, // Under limit of 5
        scenariosCompleted: 2,
        lessonsCompleted: 1,
      })

      expect(result.hasAccess).toBe(true)
      expect(result.reason).toBe('free_limit')
      expect(result.remainingFree).toBe(2)
    })

    it('should deny access when free limit exceeded', async () => {
      const mockProfile = {
        subscription_tier: 'free',
        trial_active: false,
        trial_expires_at: null,
      }

      const { supabase } = await import('./supabase')
      const mockFrom = supabase.from as any
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      })

      vi.mocked(PaymentService.isTrialActive).mockReturnValue(false)

      const result = await AccessControl.canSeeFullRationale('user-123', {
        rationalesUsed: 5, // At limit
        scenariosCompleted: 2,
        lessonsCompleted: 1,
      })

      expect(result.hasAccess).toBe(false)
      expect(result.reason).toBe('exceeded_limit')
      expect(result.upgradeRequired).toBe(true)
    })

    it('should handle database errors gracefully', async () => {
      const { supabase } = await import('./supabase')
      const mockFrom = supabase.from as any
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' },
            })),
          })),
        })),
      })

      const result = await AccessControl.canSeeFullRationale('user-123', {
        rationalesUsed: 0,
        scenariosCompleted: 0,
        lessonsCompleted: 0,
      })

      expect(result.hasAccess).toBe(false)
      expect(result.reason).toBe('unauthorized')
    })
  })

  describe('canAccessScenario', () => {
    it('should allow unlimited access for premium users', async () => {
      const mockProfile = {
        subscription_tier: 'premium',
        trial_active: false,
        trial_expires_at: null,
      }

      const { supabase } = await import('./supabase')
      const mockFrom = supabase.from as any
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      })

      const result = await AccessControl.canAccessScenario('user-123', 'scenario-1', {
        rationalesUsed: 0,
        scenariosCompleted: 10, // Over free limit
        lessonsCompleted: 0,
      })

      expect(result.hasAccess).toBe(true)
      expect(result.reason).toBe('premium')
    })

    it('should enforce monthly limits for free users', async () => {
      const mockProfile = {
        subscription_tier: 'free',
        trial_active: false,
        trial_expires_at: null,
      }

      const { supabase } = await import('./supabase')
      const mockFrom = supabase.from as any
      
      // Mock profile query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockProfile,
              error: null,
            })),
          })),
        })),
      })

      // Mock monthly scenario count query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              count: 5, // At monthly limit
              error: null,
            })),
          })),
        })),
      })

      vi.mocked(PaymentService.isTrialActive).mockReturnValue(false)

      const result = await AccessControl.canAccessScenario('user-123', 'scenario-1', {
        rationalesUsed: 0,
        scenariosCompleted: 5,
        lessonsCompleted: 0,
      })

      expect(result.hasAccess).toBe(false)
      expect(result.reason).toBe('exceeded_limit')
      expect(result.upgradeRequired).toBe(true)
    })
  })
})


