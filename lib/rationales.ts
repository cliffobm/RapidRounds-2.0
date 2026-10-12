import { supabase } from './supabase'

export interface RationaleAccess {
  canAccess: boolean
  reason: 'premium' | 'trial' | 'free_limit' | 'exceeded_limit'
  remainingFree: number
  upgradeRequired: boolean
}

export interface RationaleContent {
  hint: string
  full: string
}

export class RationaleService {
  private static readonly FREE_RATIONALE_LIMIT = 5

  /**
   * Check if user can access full rationale
   */
  static async canSeeFullRationale(
    userId: string,
    userProfile: any
  ): Promise<RationaleAccess> {
    // Premium users always have access
    if (userProfile.subscription_tier === 'premium') {
      return {
        canAccess: true,
        reason: 'premium',
        remainingFree: 0,
        upgradeRequired: false
      }
    }

    // Check trial status
    const isTrialActive = userProfile.trial_active && 
                         userProfile.trial_expires_at && 
                         new Date(userProfile.trial_expires_at) > new Date()
    
    if (isTrialActive) {
      return {
        canAccess: true,
        reason: 'trial',
        remainingFree: 0,
        upgradeRequired: false
      }
    }

    // Check free limit usage
    const rationaleCount = await this.getFreeRationaleCount(userId)
    const remainingFree = Math.max(0, this.FREE_RATIONALE_LIMIT - rationaleCount)

    if (remainingFree > 0) {
      return {
        canAccess: true,
        reason: 'free_limit',
        remainingFree,
        upgradeRequired: false
      }
    }

    // Exceeded free limit
    return {
      canAccess: false,
      reason: 'exceeded_limit',
      remainingFree: 0,
      upgradeRequired: true
    }
  }

  /**
   * Get rationale content based on access level
   */
  static async getRationaleContent(
    scenarioItemId: string,
    userId: string,
    userProfile: any
  ): Promise<RationaleContent> {
    const access = await this.canSeeFullRationale(userId, userProfile)
    
    // Get rationale from database
    const { data: rationale, error } = await supabase
      .from('rationales')
      .select('hint, full')
      .eq('scenario_item_id', scenarioItemId)
      .single()

    if (error || !rationale) {
      return {
        hint: 'No rationale available for this question.',
        full: 'No rationale available for this question.'
      }
    }

    // Return appropriate content based on access
    if (access.canAccess) {
      // Track usage for free users
      if (access.reason === 'free_limit') {
        await this.incrementFreeRationaleCount(userId)
      }
      
      return {
        hint: rationale.hint,
        full: rationale.full
      }
    } else {
      // Return only hint for users without access
      return {
        hint: rationale.hint,
        full: 'Upgrade to Premium to unlock detailed explanations with clinical reasoning and evidence-based rationales.'
      }
    }
  }

  /**
   * Get count of free rationales used
   */
  private static async getFreeRationaleCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('rationale_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('usage_type', 'free')
        .single()

      if (error || !data) {
        return 0
      }

      return data.count || 0
    } catch (error) {
      console.error('Error fetching rationale count:', error)
      return 0
    }
  }

  /**
   * Increment free rationale usage count
   */
  private static async incrementFreeRationaleCount(userId: string): Promise<void> {
    try {
      const currentCount = await this.getFreeRationaleCount(userId)
      
      await supabase
        .from('rationale_usage')
        .upsert({
          user_id: userId,
          usage_type: 'free',
          count: currentCount + 1,
          updated_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error incrementing rationale count:', error)
    }
  }

  /**
   * Reset trial rationale count (for new trials)
   */
  static async resetTrialRationaleCount(userId: string): Promise<void> {
    try {
      await supabase
        .from('rationale_usage')
        .upsert({
          user_id: userId,
          usage_type: 'free',
          count: 0,
          updated_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error resetting rationale count:', error)
    }
  }

  /**
   * Get rationale usage statistics
   */
  static async getRationaleStats(userId: string): Promise<{
    totalUsed: number
    freeUsed: number
    premiumUsed: number
    remainingFree: number
  }> {
    try {
      const { data, error } = await supabase
        .from('rationale_usage')
        .select('*')
        .eq('user_id', userId)

      if (error || !data) {
        return {
          totalUsed: 0,
          freeUsed: 0,
          premiumUsed: 0,
          remainingFree: this.FREE_RATIONALE_LIMIT
        }
      }

      const freeUsed = data.find(d => d.usage_type === 'free')?.count || 0
      const premiumUsed = data.find(d => d.usage_type === 'premium')?.count || 0

      return {
        totalUsed: freeUsed + premiumUsed,
        freeUsed,
        premiumUsed,
        remainingFree: Math.max(0, this.FREE_RATIONALE_LIMIT - freeUsed)
      }
    } catch (error) {
      console.error('Error fetching rationale stats:', error)
      return {
        totalUsed: 0,
        freeUsed: 0,
        premiumUsed: 0,
        remainingFree: this.FREE_RATIONALE_LIMIT
      }
    }
  }
}

// Helper function for components
export function canSeeFullRationale(
  userProfile: any,
  rationaleCount: number
): boolean {
  if (!userProfile) return false

  // Premium users always have access
  if (userProfile?.subscription_tier === 'premium') {
    return true
  }

  // Trial users have access
  const isTrialActive = userProfile?.trial_active && 
                       userProfile?.trial_expires_at && 
                       new Date(userProfile.trial_expires_at) > new Date()
  
  if (isTrialActive) {
    return true
  }

  // Free users have limited access
  return rationaleCount < 5 // FREE_RATIONALE_LIMIT
}

// Client-side rationale content helper
export function getRationaleForDisplay(
  rationale: RationaleContent,
  hasAccess: boolean
): string {
  if (hasAccess) {
    return rationale.full
  }
  
  return rationale.hint
}


