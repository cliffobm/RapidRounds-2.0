import { test, expect } from '@playwright/test'

test('unfinished billing controls are explicitly disabled', async ({ page }) => {
  await page.goto('/test/cardiac')
  await page.getByRole('button', { name: /Go to next item/ }).click()
  const region = page.getByRole('region', { name: 'Scenario content' })
  await expect(region.getByRole('heading', { name: 'Question 1', exact: true })).toBeVisible()
  await region.getByRole('button', { name: 'ST-elevation myocardial infarction (STEMI)', exact: true }).click()
  await region.getByRole('button', { name: 'Submit Answer' }).click()
  await expect(region.getByRole('button', { name: 'Upgrade to Premium', exact: true })).toBeDisabled()
})

test('untrusted local premium markers do not authenticate Profile', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('user-profile', JSON.stringify({ subscription_tier: 'premium', role: 'admin' })))
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/auth\/sign-in(?:\?.*)?$/)
  await expect(page.getByRole('button', { name: 'Sign in with email' })).toBeVisible()
})

test('rationale and checkout APIs reject signed-out requests', async ({ request }) => {
  expect((await request.get('/api/access/rationale?userId=another-user')).status()).toBe(401)
  expect((await request.post('/api/create-checkout', { data: { priceId: 'fake-price' } })).status()).toBe(401)
})

test.fixme('paid checkout, authoritative usage limits and trial activation', () => {
  // Requires an authenticated backend and billing sandbox, not local storage markers.
})
