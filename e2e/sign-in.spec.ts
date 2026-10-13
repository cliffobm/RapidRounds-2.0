import { test, expect } from '@playwright/test'

test('email sign-in displays invalid credentials without leaving the form', async ({ page }) => {
  await page.route('**/auth/v1/token?grant_type=password', route => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ code: 'invalid_credentials', msg: 'Invalid login credentials' }) }))
  await page.goto('/auth/sign-in')
  await page.getByLabel('Email', { exact: true }).fill('learner.a@example.com')
  await page.getByLabel('Password', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Sign in with email' }).click()
  await expect(page.locator('form').getByRole('alert')).toContainText('Invalid login credentials')
  await expect(page).toHaveURL(/\/auth\/sign-in$/)
  await expect(page.getByRole('button', { name: 'Sign in with email' })).toBeEnabled()
})
