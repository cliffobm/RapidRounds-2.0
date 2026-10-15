import { test, expect } from '@playwright/test'

const routes = [
  '/', '/auth/sign-in', '/test', '/test/cardiac', '/test/respiratory',
  '/test/neurological', '/test/renal', '/test/musculoskeletal', '/test/mixed-practice', '/test/adaptive',
  '/study', '/study/cardiac-fundamentals', '/study/wound-care',
  '/reference/drug-reference', '/reference/emergency-protocols', '/reference/lab-values', '/reference/calculators',
  '/quiz', '/review', '/rr', '/rr/cvd_001', '/leaderboard', '/achievements', '/scenario-library',
  '/scenario/00000000-0000-4000-8000-000000000001', '/scenarios/00000000-0000-4000-8000-000000000001',
  '/microlearning-generator', '/flipped', '/debug', '/minimal', '/simple', '/simple-test', '/test-oauth',
]

for (const route of routes) {
  test(`route audit: ${route}`, async ({ page }, testInfo) => {
    test.setTimeout(45000)
    const errors: string[] = [], consoleErrors: string[] = []
    const failedResponses: { url: string; status: number }[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()) })
    page.on('response', response => { if (response.status() >= 400) failedResponses.push({ url: response.url(), status: response.status() }) })
    const response = await page.goto(route)
    await expect(page.locator('#app-main-content')).toBeVisible()
    await expect(page.locator('#app-main-content')).not.toBeEmpty()
    const buttons = await page.getByRole('button').evaluateAll(elements => elements.map(element => ({
      label: element.getAttribute('aria-label') || element.textContent?.trim(), disabled: element.hasAttribute('disabled'),
    })))
    const links = await page.getByRole('link').evaluateAll(elements => elements.map(element => element.getAttribute('href')))
    await testInfo.attach('route-control-inventory', { body: JSON.stringify({ route, status: response?.status(), errors, consoleErrors, failedResponses, buttons, links }, null, 2), contentType: 'application/json' })
    expect(response?.status()).toBe(200)
    expect(failedResponses.filter(response => new URL(response.url).pathname.startsWith('/brand/'))).toEqual([])
    expect(errors).toEqual([])
  })
}
