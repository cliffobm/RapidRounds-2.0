import { test, expect } from '@playwright/test'
import bank from '../qbank/banks/acute_mi.testbank.json'

test('legacy bank selection and shuffled answer submission work in the production build', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('pageerror', error => { runtimeErrors.push(error.message); console.error('Browser runtime:', error.message) })
  page.on('console', message => { if (message.type() === 'error') console.error('Browser console:', message.text()) })
  await page.goto('/quiz')
  await expect(page.getByText('Select a bank to start drilling.')).toBeVisible()
  await page.getByRole('combobox', { name: 'Select bank' }).selectOption('acute_mi')
  const item = bank.items[0]!
  await expect(page.getByText(item.question, { exact: true })).toBeVisible()
  const correctText = item.options[item.correct_answer.charCodeAt(0) - 65]!
  await page.getByRole('main', { name: 'Quiz card' }).getByRole('button', { name: correctText, exact: false }).click()
  await expect(page.getByText(/No due cards/)).toBeVisible()
  expect(runtimeErrors).toEqual([])
})

test('CJIS staging endpoint is blocked in production mode', async ({ request }) => {
  expect((await request.get('/api/cjis/banks')).status()).toBe(404)
})
