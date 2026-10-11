import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RationaleService, canSeeFullRationale, getRationaleForDisplay } from './rationales'
import { PaymentService } from './payments/stripe'

// Mock dependencies
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      upsert: vi.fn(),
    })),
  },
}))

vi.mock('./payments/stripe', () => ({
  PaymentService: {
    isTrialActive: vi.fn(),
  },
}))

describe('RationaleService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('canSeeFullRationale', () => {
    it('should return true for premium users', async () => {
      const mockProfile = { subscription_tier: 'premium' }
      
      const result = await RationaleService.canSeeFullRationale('user-123', mockProfile)
      
      expect(result.canAccess).toBe(true)
      expect(result.reason).toBe('premium')
    })

    it('should return true for active trial users', async () => {
      const mockProfile = { 
        subscription_tier: 'free',
        trial_active: true,
        trial_expires_at: new Date(Date.now() + 86400000).toISOString()
      }

      vi.mocked(PaymentService.isTrialActive).mockReturnValue(true)
      
      const result = await RationaleService.canSeeFullRationale('user-123', mockProfile)
      
      expect(result.canAccess).toBe(true)
      expect(result.reason).toBe('trial')
    })

    it('should enforce free limits correctly', async () => {
      const mockProfile = { subscription_tier: 'free' }
      
      vi.mocked(PaymentService.isTrialActive).mockReturnValue(false)
      
      // Mock getFreeRationaleCount to return 3
      const { supabase } = await import('./supabase')
      const mockFrom = supabase.from as any
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { count: 3 },
              error: null,
            })),
          })),
        })),
      })

      const result = await RationaleService.canSeeFullRationale('user-123', mockProfile)
      
      expect(result.canAccess).toBe(true)
      expect(result.reason).toBe('free_limit')
      expect(result.remainingFree).toBe(2)
    })

    it('should deny access when free limit exceeded', async () => {
      const mockProfile = { subscription_tier: 'free' }
      
      vi.mocked(PaymentService.isTrialActive).mockReturnValue(false)
      
      // Mock getFreeRationaleCount to return 5 (limit reached)
      const { supabase } = await import('./supabase')
      const mockFrom = supabase.from as any
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { count: 5 },
              error: null,
            })),
          })),
        })),
      })

      const result = await RationaleService.canSeeFullRationale('user-123', mockProfile)
      
      expect(result.canAccess).toBe(false)
      expect(result.reason).toBe('exceeded_limit')
      expect(result.upgradeRequired).toBe(true)
    })
  })

  describe('getRationaleContent', () => {
    it('should return full content for users with access', async () => {
      const mockProfile = { subscription_tier: 'premium' }
      const mockRationale = {
        hint: 'Consider the patient symptoms',
        full: 'The patient presents with classic signs of...'
      }

      const { supabase } = await import('./supabase')
      const mockFrom = supabase.from as any
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockRationale,
              error: null,
            })),
          })),
        })),
      })

      const result = await RationaleService.getRationaleContent(
        'item-123',
        'user-123',
        mockProfile
      )

      expect(result.hint).toBe(mockRationale.hint)
      expect(result.full).toBe(mockRationale.full)
    })

    it('should return upgrade message for users without access', async () => {
      const mockProfile = { subscription_tier: 'free' }
      const mockRationale = {
        hint: 'Consider the patient symptoms',
        full: 'The patient presents with classic signs of...'
      }

      vi.mocked(PaymentService.isTrialActive).mockReturnValue(false)

      const { supabase } = await import('./supabase')
      const mockFrom = supabase.from as any
      
      // Mock rationale query
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockRationale,
              error: null,
            })),
          })),
        })),
      })

      // Mock usage count query (over limit)
      mockFrom.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { count: 5 },
              error: null,
            })),
          })),
        })),
      })

      const result = await RationaleService.getRationaleContent(
        'item-123',
        'user-123',
        mockProfile
      )

      expect(result.hint).toBe(mockRationale.hint)
      expect(result.full).toContain('Upgrade to Premium')
    })
  })
})

describe('Helper Functions', () => {
  describe('canSeeFullRationale', () => {
    it('should return true for premium users', () => {
      const userProfile = { subscription_tier: 'premium' }
      const result = canSeeFullRationale(userProfile, 10)
      expect(result).toBe(true)
    })

    it('should return true for trial users', () => {
      const userProfile = { 
        subscription_tier: 'free',
        trial_active: true,
        trial_expires_at: new Date(Date.now() + 86400000).toISOString()
      }
      
      vi.mocked(PaymentService.isTrialActive).mockReturnValue(true)
      
      const result = canSeeFullRationale(userProfile, 10)
      expect(result).toBe(true)
    })

    it('should return false when free limit exceeded', () => {
      const userProfile = { subscription_tier: 'free' }
      
      vi.mocked(PaymentService.isTrialActive).mockReturnValue(false)
      
      const result = canSeeFullRationale(userProfile, 5) // At limit
      expect(result).toBe(false)
    })

    it('should return true when under free limit', () => {
      const userProfile = { subscription_tier: 'free' }
      
      vi.mocked(PaymentService.isTrialActive).mockReturnValue(false)
      
      const result = canSeeFullRationale(userProfile, 3) // Under limit
      expect(result).toBe(true)
    })
  })

  describe('getRationaleForDisplay', () => {
    const mockRationale = {
      hint: 'Think about the symptoms',
      full: 'The complete clinical explanation...'
    }

    it('should return full content when user has access', () => {
      const result = getRationaleForDisplay(mockRationale, true)
      expect(result).toBe(mockRationale.full)
    })

    it('should return hint when user lacks access', () => {
      const result = getRationaleForDisplay(mockRationale, false)
      expect(result).toBe(mockRationale.hint)
    })
  })
})


