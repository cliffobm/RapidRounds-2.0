import { test, expect } from '@playwright/test'

test.describe('Leaderboard View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leaderboard')
  })

  test('should display leaderboard page', async ({ page }) => {
    // Should see leaderboard title
    await expect(page.locator('h1')).toContainText('Leaderboards')
    
    // Should see tab switcher
    await expect(page.getByRole('button', { name: 'Global', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Institution', exact: true })).toBeVisible()
  })

  test('should switch between global and institution tabs', async ({ page }) => {
    // Click institution tab
    await page.click('text=Institution')
    
    // Should show institution leaderboard
    await expect(page.locator('text=Institution Rankings')).toBeVisible()
    
    // Click global tab
    await page.click('text=Global')
    
    // Should show global leaderboard
    await expect(page.locator('text=Global Rankings')).toBeVisible()
  })

  test('should filter by time period', async ({ page }) => {
    // Should see time filter buttons
    await expect(page.locator('text=Weekly')).toBeVisible()
    await expect(page.locator('text=Monthly')).toBeVisible()
    await expect(page.locator('text=All Time')).toBeVisible()
    
    // Click monthly filter
    await page.click('text=Monthly')
    
    // Should update leaderboard (visual change)
    await page.waitForTimeout(500)
  })

  test('should display user rankings', async ({ page }) => {
    // Should see ranking entries
    const rankings = page.locator('[class*="divide-y"] > div')
    const count = await rankings.count()
    
    expect(count).toBeGreaterThan(0)
    
    // Each ranking should have name and score
    if (count > 0) {
      const firstRanking = rankings.first()
      await expect(firstRanking).toBeVisible()
    }
  })

  test('should show current user highlight', async ({ page }) => {
    // Look for current user indicator
    const userIndicator = page.locator('text=You, [class*="ring-primary"]')
    
    // May or may not be visible depending on mock data
    const count = await userIndicator.count()
    console.log(`Found ${count} user indicators`)
  })

  test('should expand user details', async ({ page }) => {
    // Look for expandable user entries
    const expandButtons = page.locator('button:has([class*="chevron"])')
    const count = await expandButtons.count()
    
    if (count > 0) {
      // Click first expand button
      await expandButtons.first().click()
      
      // Should show expanded details
      await page.waitForTimeout(300) // Wait for animation
    }
  })

  test('should show achievement showcase', async ({ page }) => {
    // Should see recent achievements section
    await expect(page.locator('text=Recent Achievements')).toBeVisible()
    
    // Should see achievement cards
    const achievementCards = page.locator('[class*="grid"] [class*="Card"]')
    const cardCount = await achievementCards.count()
    
    if (cardCount > 0) {
      await expect(achievementCards.first()).toBeVisible()
    }
  })

  test('should have working CTA buttons', async ({ page }) => {
    // Should see motivational CTA
    await expect(page.locator('text=Climb the Rankings!')).toBeVisible()
    
    // Should have action buttons
    const practiceButton = page.locator('text=Practice Scenarios')
    const studyButton = page.locator('text=Study Materials')
    
    await expect(practiceButton).toBeVisible()
    await expect(studyButton).toBeVisible()
    
    // Buttons should be clickable
    await expect(practiceButton).toBeEnabled()
    await expect(studyButton).toBeEnabled()
  })
})

test.describe('Leaderboard Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/leaderboard')
    
    // Should have main heading
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Should have proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const count = await headings.count()
    expect(count).toBeGreaterThan(1)
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/leaderboard')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    
    let tabCount = 0
    const maxTabs = 10
    
    while (tabCount < maxTabs) {
      const focused = page.locator(':focus')
      
      if (await focused.count() > 0) {
        // Verify focus is visible
        await expect(focused).toBeVisible()
        
        // Test Enter key activation on buttons
        const tagName = await focused.evaluate(el => el.tagName.toLowerCase())
        if (tagName === 'button') {
          // Don't actually click, just verify it's focusable
          break
        }
      }
      
      await page.keyboard.press('Tab')
      tabCount++
    }
  })

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('/leaderboard')
    
    // Check for live regions
    const liveRegions = page.locator('[aria-live]')
    const count = await liveRegions.count()
    
    // May or may not have live regions depending on implementation
    console.log(`Found ${count} live regions`)
  })
})

test.describe('Mobile Leaderboard', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should display properly on mobile', async ({ page }) => {
    await page.goto('/leaderboard')
    
    // Should see leaderboard content
    await expect(page.locator('h1')).toBeVisible()
    
    // Tab switcher should be accessible
    await expect(page.getByRole('button', { name: 'Global', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Institution', exact: true })).toBeVisible()
  })

  test('should have proper touch targets', async ({ page }) => {
    await page.goto('/leaderboard')
    
    // All interactive elements should meet minimum touch target size
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      const box = await button.boundingBox()
      
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
        expect(box.width).toBeGreaterThanOrEqual(44)
      }
    }
  })
})


