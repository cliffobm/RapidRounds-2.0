// lib/access.ts
import { supabase } from './supabase'
// If you truly need elevated server writes, import { supabaseAdmin } from './supabase-admin'

export interface AccessCheck {
  hasAccess: boolean
  reason: 'premium' | 'trial' | 'free_limit' | 'exceeded_limit' | 'unauthorized'
  message: string
  upgradeRequired: boolean
  remainingFree?: number
}
export interface UsageCounters {
  rationalesUsed: number
  scenariosCompleted: number
  lessonsCompleted: number
}

export class AccessControl {
  private static readonly FREE_SCENARIO_LIMIT = 5 // per month
  private static readonly FREE_RATIONALE_LIMIT = 5 // total
  
  /**
   * Check if user can access full rationale explanations
   */
  static async canSeeFullRationale(
    userId: string, 
    counters: UsageCounters
  ): Promise<AccessCheck> {
    try {
      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier, trial_active, trial_expires_at')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        return {
          hasAccess: false,
          reason: 'unauthorized',
          message: 'Unable to verify account status',
          upgradeRequired: false
        }
      }

      // Premium users always have access
      if (profile.subscription_tier === 'premium') {
        return {
          hasAccess: true,
          reason: 'premium',
          message: 'Premium access',
          upgradeRequired: false
        }
      }

      // Check trial status
      const isTrialActive = profile.trial_active && 
                           profile.trial_expires_at && 
                           new Date(profile.trial_expires_at) > new Date()
      
      if (isTrialActive) {
        return {
          hasAccess: true,
          reason: 'trial',
          message: 'Trial access active',
          upgradeRequired: false
        }
      }

      // Check free limit
      const remainingFree = Math.max(0, this.FREE_RATIONALE_LIMIT - counters.rationalesUsed)
      
      if (remainingFree > 0) {
        return {
          hasAccess: true,
          reason: 'free_limit',
          message: `${remainingFree} free explanations remaining`,
          upgradeRequired: false,
          remainingFree
        }
      }

      return {
        hasAccess: false,
        reason: 'exceeded_limit',
        message: 'Free explanation limit reached',
        upgradeRequired: true,
        remainingFree: 0
      }
    } catch (e) {
      console.error('Error checking rationale access:', e)
      return {
        hasAccess: false,
        reason: 'unauthorized',
        message: 'Error checking access',
        upgradeRequired: false
      }
    }
  }

  /**
   * Check if user can access scenarios
   */
  static async canAccessScenario(
    userId: string,
    scenarioId: string,
    counters: UsageCounters
  ): Promise<AccessCheck> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier, trial_active, trial_expires_at')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        return {
          hasAccess: false,
          reason: 'unauthorized',
          message: 'Unable to verify account status',
          upgradeRequired: false
        }
      }

      // Premium users have unlimited access
      if (profile.subscription_tier === 'premium') {
        return {
          hasAccess: true,
          reason: 'premium',
          message: 'Unlimited scenario access',
          upgradeRequired: false
        }
      }

      // Trial users have unlimited access
      const isTrialActive = profile.trial_active && 
                           profile.trial_expires_at && 
                           new Date(profile.trial_expires_at) > new Date()
      
      if (isTrialActive) {
        return {
          hasAccess: true,
          reason: 'trial',
          message: 'Trial access active',
          upgradeRequired: false
        }
      }

      // Check monthly scenario limit for free users
      const monthlyScenarios = await this.getMonthlyScenarioCount(userId)
      const remainingScenarios = Math.max(0, this.FREE_SCENARIO_LIMIT - monthlyScenarios)

      if (remainingScenarios > 0) {
        return {
          hasAccess: true,
          reason: 'free_limit',
          message: `${remainingScenarios} scenarios remaining this month`,
          upgradeRequired: false,
          remainingFree: remainingScenarios
        }
      }

      return {
        hasAccess: false,
        reason: 'exceeded_limit',
        message: 'Monthly scenario limit reached',
        upgradeRequired: true,
        remainingFree: 0
      }
    } catch (e) {
      console.error('Error checking scenario access:', e)
      return {
        hasAccess: false,
        reason: 'unauthorized',
        message: 'Error checking access',
        upgradeRequired: false
      }
    }
  }

  /**
   * Check if user can access premium features
   */
  static async canAccessPremiumFeature(
    userId: string,
    feature: string
  ): Promise<AccessCheck> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier, trial_active, trial_expires_at')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        return {
          hasAccess: false,
          reason: 'unauthorized',
          message: 'Unable to verify account status',
          upgradeRequired: false
        }
      }

      // Premium features
      const premiumFeatures = [
        'advanced_analytics',
        'custom_study_plans',
        'offline_download',
        'priority_support',
        'institution_leaderboards',
        'detailed_rationales'
      ]

      if (!premiumFeatures.includes(feature)) {
        return {
          hasAccess: true,
          reason: 'free_limit',
          message: 'Feature available to all users',
          upgradeRequired: false
        }
      }

      // Check premium access
      if (profile.subscription_tier === 'premium') {
        return {
          hasAccess: true,
          reason: 'premium',
          message: 'Premium feature access',
          upgradeRequired: false
        }
      }

      // Check trial access
      const isTrialActive = profile.trial_active && 
                           profile.trial_expires_at && 
                           new Date(profile.trial_expires_at) > new Date()
      
      if (isTrialActive) {
        return {
          hasAccess: true,
          reason: 'trial',
          message: 'Trial feature access',
          upgradeRequired: false
        }
      }

      return {
        hasAccess: false,
        reason: 'exceeded_limit',
        message: `${feature.replace('_', ' ')} requires Premium`,
        upgradeRequired: true
      }
    } catch (e) {
      console.error('Error checking premium feature access:', e)
      return {
        hasAccess: false,
        reason: 'unauthorized',
        message: 'Error checking access',
        upgradeRequired: false
      }
    }
  }

  /**
   * Get monthly scenario completion count
   */
  private static async getMonthlyScenarioCount(userId: string): Promise<number> {
    try {
      const start = new Date()
      start.setDate(1); start.setHours(0,0,0,0)
      const { count, error } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', start.toISOString())

      if (error) {
        console.error('Error fetching monthly scenario count:', error)
        return 0
      }
      return count ?? 0
    } catch (e) {
      console.error('Error fetching monthly scenario count:', e)
      return 0
    }
  }

  /**
   * Get user's usage counters
   */
  static async getUserCounters(userId: string): Promise<UsageCounters> {
    try {
      const [rationaleUsage, scenarioProgress, lessonCompletions] = await Promise.all([
        supabase
          .from('rationale_usage')
          .select('count')
          .eq('user_id', userId)
          .eq('usage_type', 'free')
          .single(),
        
        supabase
          .from('progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        
        supabase
          .from('lesson_completions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
      ])

      return {
        rationalesUsed: rationaleUsage.data?.count || 0,
        scenariosCompleted: scenarioProgress.count || 0,
        lessonsCompleted: lessonCompletions.count || 0
      }
    } catch (e) {
      console.error('Error fetching user counters:', e)
      return {
        rationalesUsed: 0,
        scenariosCompleted: 0,
        lessonsCompleted: 0
      }
    }
  }

  /**
   * Increment rationale usage counter (server-side to prevent tampering)
   */
  static async incrementRationaleUsage(userId: string): Promise<void> {
    try {
      const { data: current } = await supabase
        .from('rationale_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('usage_type', 'free')
        .single()

      const newCount = (current?.count || 0) + 1

      await supabase
        .from('rationale_usage')
        .upsert({
          user_id: userId,
          usage_type: 'free',
          count: newCount,
          updated_at: new Date().toISOString()
        })
    } catch (e) {
      console.error('Error incrementing rationale usage:', e)
    }
  }
}

// Helper functions for components
export async function checkRationaleAccess(userId: string): Promise<AccessCheck> {
  const counters = await AccessControl.getUserCounters(userId)
  return AccessControl.canSeeFullRationale(userId, counters)
}

export async function checkScenarioAccess(userId: string, scenarioId: string): Promise<AccessCheck> {
  const counters = await AccessControl.getUserCounters(userId)
  return AccessControl.canAccessScenario(userId, scenarioId, counters)
}

export async function checkFeatureAccess(userId: string, feature: string): Promise<AccessCheck> {
  return AccessControl.canAccessPremiumFeature(userId, feature)
}


