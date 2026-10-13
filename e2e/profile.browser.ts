import { test, expect } from '@playwright/test'

test('profile edits survive refresh and do not cross accounts (simulated APIs)', async ({ page }, testInfo) => {
  const displayName = `Learner B ${testInfo.project.name}`
  async function signIn(letter: string) {
    await page.goto('/auth/sign-in')
    await page.getByLabel('Email', { exact: true }).fill(`learner.${letter}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('test-password')
    await page.getByRole('button', { name: 'Sign in with email' }).click()
    await expect(page).toHaveURL('http://127.0.0.1:3000/')
  }
  await signIn('b')
  await page.goto('/profile')
  await expect(page.getByRole('main').getByText('learner.b@example.com', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width)
  await page.getByRole('button', { name: 'Edit Profile' }).click()
  await page.getByLabel('Display name', { exact: true }).fill(displayName)
  await page.getByRole('button', { name: 'Save Profile' }).click()
  await expect(page.getByText('Profile saved.', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: displayName, exact: true })).toBeVisible()
  await expect(page.getByText('student', { exact: true })).toBeVisible()
  // A fresh browser storage session mirrors a signed-out account switch.
  await page.context().clearCookies()
  await page.evaluate(() => { localStorage.clear() })
  await signIn('a')
  await page.goto('/profile')
  await expect(page.getByRole('main').getByText('learner.a@example.com', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: displayName, exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Edit Profile' }).click()
  await expect(page.getByLabel('Display name', { exact: true })).toHaveValue('')
})
