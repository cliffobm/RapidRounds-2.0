import { test, expect } from '@playwright/test'

test('quiz renders adapted legacy questions, gives feedback and resets banks offline', async ({ page }) => {
  const externalRequests: string[] = []
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) {
      externalRequests.push(url.hostname)
      return route.abort()
    }
    return route.continue()
  })
  await page.goto('/quiz')
  await expect(page.getByRole('heading', { name: 'Clinical judgment practice' })).toBeVisible()
  await page.getByText('Clinical judgment competencies', { exact: true }).click()
  await expect(page.getByText('recognize cues', { exact: true })).toBeVisible()
  await page.getByLabel('Select bank').selectOption('acute_mi')
  await expect(page.getByText(/Question 1 of 1/)).toBeVisible()
  await page.getByRole('button', { name: /^B\./ }).click()
  await expect(page.getByRole('status')).toContainText('Correct. Practice feedback only.')
  await expect(page.getByText(/1 practice responses this session/)).toBeVisible()
  await page.getByRole('button', { name: 'Next question' }).click()
  await expect(page.getByRole('status')).toHaveCount(0)
  await page.getByLabel('Select bank').selectOption('vascular_disease_core')
  await expect(page.getByText(/Question 1 of 30/)).toBeVisible()
  await expect(page.getByText(/0 practice responses this session/)).toBeVisible()
  await page.getByRole('button', { name: 'Skip question' }).click()
  await expect(page.getByText(/Question 2 of 30/)).toBeVisible()
  await expect(page.getByText(/No competency score calculated/)).toBeVisible()
  expect(externalRequests).toEqual([])
  expect(pageErrors).toEqual([])
})
