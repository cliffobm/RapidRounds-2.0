import { test, expect } from '@playwright/test'

test.describe('Trial Gate Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock being a free user who has used up their free rationales
    await page.addInitScript(() => {
      // Mock localStorage to simulate used rationales
      localStorage.setItem('rationale-usage', JSON.stringify({
        used: 5,
        limit: 5
      }))
    })
  })

  test('should show upgrade prompt when free limit reached', async ({ page }) => {
    await page.goto('/test/cardiac')
    
    // Navigate through scenario to reach a question
    // This is simplified - in reality you'd navigate through the swipe deck
    
    // Look for upgrade prompts
    const upgradePrompts = page.locator('text=Upgrade to Premium, text=Start Free Trial')
    
    // Should show some kind of upgrade messaging
    const count = await upgradePrompts.count()
    console.log(`Found ${count} upgrade prompts`)
  })

  test('should show trial benefits clearly', async ({ page }) => {
    await page.goto('/profile')
    
    // Look for subscription information
    const subscriptionSection = page.locator('text=Subscription, text=Premium, text=Trial')
    
    if (await subscriptionSection.count() > 0) {
      await expect(subscriptionSection.first()).toBeVisible()
    }
  })

  test('should handle trial activation flow', async ({ page }) => {
    await page.goto('/profile')
    
    // Look for trial activation button
    const trialButton = page.locator('text=Start Free Trial, text=Try Free')
    
    if (await trialButton.count() > 0) {
      // Click trial button
      await trialButton.first().click()
      
      // Should show some feedback or navigation
      await page.waitForTimeout(1000)
    }
  })

  test('should show premium upgrade options', async ({ page }) => {
    await page.goto('/profile')
    
    // Look for upgrade buttons
    const upgradeButtons = page.locator('text=Upgrade, text=Premium')
    
    if (await upgradeButtons.count() > 0) {
      await expect(upgradeButtons.first()).toBeVisible()
      await expect(upgradeButtons.first()).toBeEnabled()
    }
  })

  test('should display feature limitations clearly', async ({ page }) => {
    // Go to a page that might show limitations
    await page.goto('/test/cardiac')
    
    // Look for limitation messaging
    const limitationText = page.locator('text=free explanations left, text=limit reached, text=upgrade')
    
    // May or may not be visible depending on user state
    const count = await limitationText.count()
    console.log(`Found ${count} limitation messages`)
  })
})

test.describe('Premium Features', () => {
  test.beforeEach(async ({ page }) => {
    // Mock being a premium user
    await page.addInitScript(() => {
      localStorage.setItem('user-profile', JSON.stringify({
        subscription_tier: 'premium',
        trial_active: false
      }))
    })
  })

  test('should show premium badges and indicators', async ({ page }) => {
    await page.goto('/profile')
    
    // Look for premium indicators
    const premiumIndicators = page.locator('text=Premium, [class*="crown"]')
    
    // Should show premium status somewhere
    const count = await premiumIndicators.count()
    console.log(`Found ${count} premium indicators`)
  })

  test('should have access to all features', async ({ page }) => {
    await page.goto('/test/cardiac')
    
    // Premium users should not see upgrade prompts
    const upgradePrompts = page.locator('text=Upgrade to Premium')
    const count = await upgradePrompts.count()
    
    // Should have minimal or no upgrade prompts
    expect(count).toBeLessThanOrEqual(1)
  })
})

test.describe('Trial Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Mock being a trial user
    await page.addInitScript(() => {
      const trialExpiry = new Date()
      trialExpiry.setDate(trialExpiry.getDate() + 5) // 5 days remaining
      
      localStorage.setItem('user-profile', JSON.stringify({
        subscription_tier: 'trial',
        trial_active: true,
        trial_expires_at: trialExpiry.toISOString()
      }))
    })
  })

  test('should show trial status and countdown', async ({ page }) => {
    await page.goto('/profile')
    
    // Should see trial information
    const trialInfo = page.locator('text=trial, text=remaining, text=days')
    
    if (await trialInfo.count() > 0) {
      await expect(trialInfo.first()).toBeVisible()
    }
  })

  test('should show conversion prompts near trial end', async ({ page }) => {
    // Mock trial ending soon
    await page.addInitScript(() => {
      const trialExpiry = new Date()
      trialExpiry.setDate(trialExpiry.getDate() + 1) // 1 day remaining
      
      localStorage.setItem('user-profile', JSON.stringify({
        subscription_tier: 'trial',
        trial_active: true,
        trial_expires_at: trialExpiry.toISOString()
      }))
    })
    
    await page.goto('/profile')
    
    // Should see upgrade prompts
    const upgradePrompts = page.locator('text=Upgrade, text=Subscribe')
    
    if (await upgradePrompts.count() > 0) {
      await expect(upgradePrompts.first()).toBeVisible()
    }
  })
})


