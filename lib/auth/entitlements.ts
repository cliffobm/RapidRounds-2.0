import { Entitlement } from '../scenario/schema'

/**
 * Get user entitlements (stub implementation)
 * In a real app, this would fetch from Supabase or your auth system
 */
export async function getUserEntitlements(userId: string): Promise<Entitlement> {
  // This is a stub implementation
  // In production, this would:
  // 1. Fetch user data from Supabase
  // 2. Check subscription status
  // 3. Calculate trial period
  // 4. Return actual entitlements
  
  return {
    userId,
    tier: 'trial',
    trialStartDate: new Date().toISOString(),
    trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    completedScenarios: [],
    totalScenariosCompleted: 0
  }
}

/**
 * Update user entitlements after scenario completion
 */
export async function updateUserEntitlements(
  userId: string, 
  scenarioId: string
): Promise<Entitlement> {
  const currentEntitlements = await getUserEntitlements(userId)
  
  return {
    ...currentEntitlements,
    completedScenarios: [...currentEntitlements.completedScenarios, scenarioId],
    totalScenariosCompleted: currentEntitlements.totalScenariosCompleted + 1
  }
}

/**
 * Check if user can access a scenario
 */
export async function canAccessScenario(
  userId: string, 
  scenarioId: string
): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId)
  
  // Free scenarios are always accessible
  const freeScenarios = ['sepsis-mr-j', 'basic-assessment', 'vital-signs-101']
  if (freeScenarios.includes(scenarioId)) {
    return true
  }
  
  // Trial users can access first 5 scenarios
  if (entitlements.tier === 'trial' && entitlements.totalScenariosCompleted < 5) {
    return true
  }
  
  // Paid users have unlimited access
  if (entitlements.tier !== 'trial') {
    return true
  }
  
  return false
}

/**
 * Get user's remaining trial scenarios
 */
export async function getRemainingTrialScenarios(userId: string): Promise<number> {
  const entitlements = await getUserEntitlements(userId)
  
  if (entitlements.tier !== 'trial') {
    return 0
  }
  
  return Math.max(0, 5 - entitlements.totalScenariosCompleted)
}

/**
 * Check if user is in trial period
 */
export async function isInTrialPeriod(userId: string): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId)
  
  if (!entitlements.trialStartDate || !entitlements.trialEndDate) {
    return false
  }
  
  const now = new Date()
  const trialStart = new Date(entitlements.trialStartDate)
  const trialEnd = new Date(entitlements.trialEndDate)
  
  return now >= trialStart && now <= trialEnd
}
