import { test, expect } from '@playwright/test'

test('bookmark button toggles and removes the current round item', async ({ page }) => {
  await page.goto('/test/cardiac')
  await page.getByRole('button', { name: 'Bookmark current item', exact: true }).click()
  const remove = page.getByRole('button', { name: 'Remove bookmark', exact: true })
  await expect(remove).toHaveAttribute('aria-pressed', 'true')
  await remove.click()
  await expect(page.getByRole('button', { name: 'Bookmark current item', exact: true })).toHaveAttribute('aria-pressed', 'false')
})

test('keyboard bookmark shortcut changes actual bookmark state', async ({ page }) => {
  await page.goto('/test/cardiac')
  await page.getByRole('region', { name: 'Scenario content' }).focus()
  await page.keyboard.press('Control+b')
  await expect(page.getByRole('button', { name: 'Remove bookmark', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('round bookmark scope is visible and resets on reload', async ({ page }) => {
  await page.goto('/test/cardiac')
  await expect(page.getByText('Bookmarks apply to this round only and reset when the page is reloaded.')).toBeVisible()
  await page.getByRole('button', { name: 'Bookmark current item', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Remove bookmark', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Bookmark current item', exact: true })).toHaveAttribute('aria-pressed', 'false')
})

test.fixme('cloud Profile bookmarks persist and remain isolated between learners', () => {
  // Cloud bookmarks are not implemented; a local round toggle does not prove them.
})
