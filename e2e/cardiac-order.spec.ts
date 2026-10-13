import { test, expect } from '@playwright/test'

test('cardiac ordering question can submit its displayed order and reach results', async ({ page }) => {
  await page.goto('/test/cardiac')
  for (let index = 0; index < 3; index++) await page.getByRole('button', { name: 'Go to next item' }).click()
  await expect(page.getByText('Arrange these interventions in order of priority (first to last):', { exact: true })).toBeVisible()
  const submit = page.getByRole('button', { name: 'Submit Answer' })
  await expect(submit).toBeEnabled()
  await submit.click()
  // The unchanged order is wrong and the two preceding questions are unanswered.
  await expect(page.getByText('0%', { exact: true })).toBeVisible()
})

test('keyboard reordering is submitted and graded by sequence', async ({ page }) => {
  await page.goto('/test/cardiac')
  for (let index = 0; index < 3; index++) await page.getByRole('button', { name: 'Go to next item' }).click()
  const handle = page.getByRole('button', { name: 'Reorder Call cardiology for emergency consultation', exact: true })
  await handle.focus()
  await page.keyboard.press('Space')
  for (let index = 0; index < 3; index++) await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Space')
  const ecgHandle = page.getByRole('button', { name: 'Reorder Obtain 12-lead ECG and laboratory studies', exact: true })
  await ecgHandle.focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Space')
  await expect.poll(() => page.getByRole('button', { name: /^Reorder / }).evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')))).toEqual([
    'Reorder Perform initial assessment and obtain vital signs',
    'Reorder Obtain 12-lead ECG and laboratory studies',
    'Reorder Administer aspirin and prepare for catheterization',
    'Reorder Call cardiology for emergency consultation',
  ])
  const submit = page.getByRole('button', { name: 'Submit Answer' })
  await expect(submit).toBeEnabled()
  await submit.click()
  await expect(page.getByText('44%', { exact: true })).toBeVisible()
})
