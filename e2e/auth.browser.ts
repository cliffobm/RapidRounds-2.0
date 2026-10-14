import { test, expect, type Page, type APIRequestContext } from '@playwright/test'

test.setTimeout(90000)
const pageErrors = new WeakMap<Page, string[]>()
test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  pageErrors.set(page, errors)
  page.on('pageerror', error => errors.push(error.message))
  // Prevent an accidentally hosted build from sending fixture Auth requests.
  await page.route('**/auth/v1/**', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== 'http://127.0.0.1:54321') {
      errors.push('Auth browser tests require a build against the local API simulator.')
      await route.abort()
    } else await route.continue()
  })
})
test.afterEach(async ({ page }) => { expect(pageErrors.get(page)).toEqual([]) })
async function signOut(page: Page) {
  await page.context().clearCookies()
  await page.goto('/auth/sign-in')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
}
async function login(page: Page, email: string, password: string) {
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in with email', exact: true }).click()
}
async function mail(request: APIRequestContext, email: string) {
  const response = await request.get(`http://127.0.0.1:54321/__test/mail?email=${encodeURIComponent(email)}`)
  return (await response.json()).link as string
}

test('signup confirms through PKCE, preserves cookies on refresh, and rejects a reused link (simulated APIs)', async ({ page, request }, info) => {
  const email = `new.${info.project.name.replaceAll(' ', '.').toLowerCase()}@example.com`
  await page.goto('/auth/sign-in?redirectTo=%2Fprofile')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await page.getByLabel('Full name', { exact: true }).fill('New Learner')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill('test-password')
  await page.getByLabel('Confirm password', { exact: true }).fill('test-password')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Check your email to confirm')
  const link = await mail(request, email)
  await page.goto(link)
  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByRole('main').getByText(email, { exact: true })).toBeVisible()
  await expect(page.getByText('student', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('main').getByText(email, { exact: true })).toBeVisible()
  expect((await page.context().cookies()).some(cookie => cookie.name.includes('auth-token'))).toBe(true)
  await page.goto(link)
  await expect(page).toHaveURL(/\/auth\/sign-in\?error=auth_callback_failed/)
  await expect(page.getByRole('main').getByRole('alert')).toContainText('invalid, expired, or was already used')
})

test('email links sign in an existing account and preserve the return path (simulated APIs)', async ({ page, request }) => {
  await page.goto('/auth/sign-in?redirectTo=%2Fprofile')
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click()
  await page.getByLabel('Email', { exact: true }).fill('learner.a@example.com')
  await page.getByRole('button', { name: 'Send sign-in link' }).click()
  await expect(page.getByRole('status')).toContainText('If an account exists')
  await page.goto(await mail(request, 'learner.a@example.com'))
  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByRole('main').getByText('learner.a@example.com', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('main').getByText('learner.a@example.com', { exact: true })).toBeVisible()
})

test('recovery changes the password, rejects the old password, and accepts the new password (simulated APIs)', async ({ page, request }, info) => {
  const email = `reset.${info.project.name.replaceAll(' ', '.').toLowerCase()}@example.com`
  await page.goto('/auth/sign-in?mode=signup')
  await page.getByLabel('Full name', { exact: true }).fill('Reset Learner')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill('old-password')
  await page.getByLabel('Confirm password', { exact: true }).fill('old-password')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Check your email')
  await page.goto(await mail(request, email))
  await expect(page).toHaveURL('http://127.0.0.1:3000/')
  await signOut(page)
  await page.getByRole('button', { name: 'Forgot password?' }).click()
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(page.getByRole('status')).toContainText('If an account exists')
  await page.goto(await mail(request, email))
  await expect(page).toHaveURL(/\/auth\/reset-password$/)
  await page.getByLabel('New password', { exact: true }).fill('new-password')
  await page.getByLabel('Confirm password', { exact: true }).fill('new-password')
  await page.getByRole('button', { name: 'Update password', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Your password has been updated')
  await signOut(page)
  await login(page, email, 'old-password')
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Invalid login credentials')
  await login(page, email, 'new-password')
  await expect(page).toHaveURL('http://127.0.0.1:3000/')
})

test('Google redirect, PKCE exchange, and repeat login preserve edited profiles (simulated provider)', async ({ page }) => {
  await page.goto('/auth/sign-in?redirectTo=%2Fprofile')
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByRole('main').getByText('google.learner@example.com', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Edit Profile' }).click()
  await page.getByLabel('Display name', { exact: true }).fill('Edited Google Learner')
  await page.getByRole('button', { name: 'Save Profile' }).click()
  await expect(page.getByText('Profile saved.', { exact: true })).toBeVisible()
  await signOut(page)
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  await expect(page).toHaveURL('http://127.0.0.1:3000/')
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: 'Edited Google Learner', exact: true })).toBeVisible()
})

test('anonymous recovery and forged return paths are contained within RapidRounds', async ({ page }) => {
  await page.goto('/auth/reset-password')
  await expect(page).toHaveURL(/\/auth\/sign-in/)
  await page.goto('/auth/sign-in?redirectTo=https%3A%2F%2Fevil.example')
  await login(page, 'learner.b@example.com', 'test-password')
  await expect(page).toHaveURL('http://127.0.0.1:3000/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width)
})
