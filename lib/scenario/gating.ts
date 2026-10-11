import { Entitlement, RationaleAccess } from './schema'

/**
 * Check if a user has access to full rationales for a scenario
 */
export function checkRationaleAccess(
  scenarioId: string, 
  nodeId: string, 
  entitlement: Entitlement,
  completedScenarios: string[] = []
): RationaleAccess {
  const hasTrialAccess = isWithinTrialPeriod(entitlement)
  const hasPaidAccess = entitlement.tier !== 'trial'
  const isFirstFiveScenarios = completedScenarios.length < 5
  const isFreeScenario = isScenarioFree(scenarioId)
  
  const hasFullAccess = hasTrialAccess || hasPaidAccess || isFirstFiveScenarios || isFreeScenario
  
  return {
    hasFullAccess,
    hasTrialAccess,
    hasPaidAccess,
    remainingTrialScenarios: hasTrialAccess ? Math.max(0, 5 - completedScenarios.length) : 0,
    canAccessRationale: (scenarioId: string, nodeId: string) => {
      return hasFullAccess || isBasicHintAvailable(scenarioId, nodeId)
    }
  }
}

/**
 * Get the appropriate rationale content based on access level
 */
export function getRationaleContent(
  fullRationale: string,
  basicHint: string,
  access: RationaleAccess
): string {
  if (access.hasFullAccess) {
    return fullRationale
  }
  
  if (access.hasTrialAccess) {
    return `${basicHint}\n\n🔓 Trial Access: ${fullRationale}`
  }
  
  if (access.remainingTrialScenarios > 0) {
    return `${basicHint}\n\n🎯 Complete ${access.remainingTrialScenarios} more scenarios for full access!`
  }
  
  return `${basicHint}\n\n💎 Upgrade to Premium for detailed rationales and expert insights!`
}

/**
 * Check if user is within trial period
 */
function isWithinTrialPeriod(entitlement: Entitlement): boolean {
  if (!entitlement.trialStartDate || !entitlement.trialEndDate) {
    return false
  }
  
  const now = new Date()
  const trialStart = new Date(entitlement.trialStartDate)
  const trialEnd = new Date(entitlement.trialEndDate)
  
  return now >= trialStart && now <= trialEnd
}

/**
 * Check if a scenario is free (always available)
 */
function isScenarioFree(scenarioId: string): boolean {
  const freeScenarios = [
    'sepsis-mr-j', // First scenario is always free
    'basic-assessment',
    'vital-signs-101'
  ]
  
  return freeScenarios.includes(scenarioId)
}

/**
 * Check if basic hint is available (always free)
 */
function isBasicHintAvailable(scenarioId: string, nodeId: string): boolean {
  // Basic hints are always available
  return true
}

/**
 * Get upgrade prompt based on access level
 */
export function getUpgradePrompt(access: RationaleAccess): string {
  if (access.hasTrialAccess) {
    const daysLeft = getTrialDaysLeft(access)
    return `🔓 Trial Access - ${daysLeft} days remaining. Upgrade to Premium for unlimited access!`
  }
  
  if (access.remainingTrialScenarios > 0) {
    return `🎯 ${access.remainingTrialScenarios} free scenarios remaining. Complete them to unlock Premium features!`
  }
  
  return `💎 Upgrade to Premium for detailed rationales, expert insights, and unlimited scenarios!`
}

/**
 * Calculate days left in trial
 */
function getTrialDaysLeft(access: RationaleAccess): number {
  // This would calculate based on trial end date
  // For now, return a placeholder
  return 3
}

/**
 * Get pricing tiers for upgrade
 */
export function getPricingTiers() {
  return {
    basic: {
      name: 'Basic',
      price: '$9.99/month',
      features: [
        '5 scenarios per month',
        'Basic rationales',
        'Progress tracking',
        'Mobile access'
      ]
    },
    premium: {
      name: 'Premium',
      price: '$19.99/month',
      features: [
        'Unlimited scenarios',
        'Detailed rationales',
        'Expert insights',
        'Advanced analytics',
        'Priority support',
        'Offline access'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Contact us',
      features: [
        'Everything in Premium',
        'Custom scenarios',
        'Team management',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ]
    }
  }
}
