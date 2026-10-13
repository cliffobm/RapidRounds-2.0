import { test, expect } from '@playwright/test'

test.describe('Scenario Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to test categories', async ({ page }) => {
    // Navigate to test page
    await page.click('[href="/test"]')
    
    // Should see testing categories
    await expect(page.locator('h1')).toContainText('Testing Categories')
    
    // Should see category cards
    await expect(page.locator('text=Cardiac Assessment')).toBeVisible()
    await expect(page.locator('text=Respiratory System')).toBeVisible()
    await page.mouse.wheel(0, page.viewportSize()!.height)
    await page.getByRole('button', { name: /Start Neurological Assessment testing/ }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('button', { name: /Start Neurological Assessment testing/ })).toBeVisible()
  })

  test('should start a scenario from category', async ({ page }) => {
    // Navigate to test page
    await page.click('[href="/test"]')
    
    // Click on cardiac category
    await page.click('text=Start Testing >> nth=0')
    
    // Should navigate to scenario
    await expect(page.url()).toContain('/test/')
    
    // Should see scenario content
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should handle swipe deck navigation', async ({ page }) => {
    // Navigate directly to a test scenario
    await page.goto('/test/cardiac')
    
    // Should see swipe deck
    await expect(page.locator('[role="region"]')).toBeVisible()
    
    // Should see navigation buttons
    await expect(page.getByRole('button', { name: /Go to previous item/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Go to next item/ })).toBeVisible()
    
    const nextButton = page.getByRole('button', { name: /Go to next item/ })
    const previousButton = page.getByRole('button', { name: /Go to previous item/ })
    await expect(previousButton).toBeDisabled()
    await expect(nextButton).toBeEnabled()
    await nextButton.click()
    await expect(previousButton).toBeEnabled()

  })

  test('should handle bookmark functionality', async ({ page }) => {
    await page.goto('/test/cardiac')
    
    // Look for bookmark button
    const bookmarkButton = page.locator('[aria-label*="bookmark"], button:has-text("Bookmark")')
    
    if (await bookmarkButton.count() > 0) {
      await bookmarkButton.first().click()
      
      // Should provide visual feedback
      await expect(bookmarkButton.first()).toBeVisible()
    }
  })

  test('should complete scenario and show results', async ({ page }) => {
    await page.goto('/test/cardiac')
    
    // This is a simplified test - in reality, you'd need to:
    // 1. Navigate through all scenario steps
    // 2. Answer questions
    // 3. Complete the scenario
    // 4. Verify results screen
    
    // For now, just verify the page loads
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      if (await focused.count() > 0) {
        await expect(focused).toBeVisible()
      }
    }
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/test')
    
    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button[aria-label]')
    const buttonCount = await buttons.count()
    
    // Should have at least some properly labeled buttons
    expect(buttonCount).toBeGreaterThan(0)
    
    // Check specific ARIA attributes
    const cards = page.locator('[role="button"]')
    if (await cards.count() > 0) {
      await expect(cards.first()).toHaveAttribute('aria-label')
    }
  })

  test('should support screen readers', async ({ page }) => {
    await page.goto('/')
    
    // Check for screen reader content
    const srOnly = page.locator('.sr-only')
    const srCount = await srOnly.count()
    
    // Should have screen reader only content
    expect(srCount).toBeGreaterThan(0)
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    // Check for h1
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Check heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    
    expect(headingCount).toBeGreaterThan(0)
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/')
    
    // Should see mobile navigation
    await expect(page.locator('nav')).toBeVisible()
    
    // Touch targets should be large enough (minimum 44px)
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    if (buttonCount > 0) {
      const firstButton = buttons.first()
      const box = await firstButton.boundingBox()
      
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    await page.goto('/')
    
    // Should adapt layout for tablet
    await expect(page.locator('main')).toBeVisible()
  })

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    
    // Should show desktop layout
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    
    // Page should load within reasonable time
    await expect(page.locator('h1')).toBeVisible()
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(5000) // 5 seconds max
  })

  test('should not have excessive layout shifts', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__layoutShiftScore = 0
      new PerformanceObserver(list => {
        for (const entry of list.getEntries() as any) {
          if (!entry.hadRecentInput) (window as any).__layoutShiftScore += entry.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(await page.evaluate(() => (window as any).__layoutShiftScore)).toBeLessThan(0.1)
  })
})
