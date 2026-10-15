import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import rounds from './fixtures/category-rounds.json'
import adaptive from './fixtures/adaptive-round.json'
import { BANKS } from '../qbank/banks'

test.setTimeout(90000)

async function next(page: Page, title: string) {
  await page.getByRole('button', { name: /Go to next item/ }).click()
  await expect(page.getByRole('region', { name: 'Scenario content' }).getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Scenario content' })).toHaveAttribute('aria-busy', 'false')
}

for (const [slug, questions] of Object.entries(rounds)) {
  test(`complete ${slug} category round and reach accurate results`, async ({ page }) => {
    await page.goto(`/test/${slug}`)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width)
    for (const [index, question] of questions.entries()) {
      await next(page, `Question ${index + 1}`)
      const region = page.getByRole('region', { name: 'Scenario content' })
      if (question.type === 'drag_to_order') {
        const order = question.options.map(option => option.id)
        for (const [targetIndex, id] of question.correctAnswers.entries()) {
          const oldIndex = order.indexOf(id)
          if (oldIndex === targetIndex) continue
          const option = question.options.find(value => value.id === id)!
          const handle = region.getByRole('button', { name: `Reorder ${option.text}`, exact: true })
          await handle.focus()
          await page.keyboard.press('Space')
          await expect(handle).toHaveAttribute('aria-pressed', 'true')
          for (let position = oldIndex; position > targetIndex; position--) {
            await page.keyboard.press('ArrowUp')
            await expect(region.getByRole('status')).toContainText(`droppable area ${order[position - 1]}`)
          }
          await page.keyboard.press('Space')
          order.splice(oldIndex, 1)
          order.splice(targetIndex, 0, id)
          await expect.poll(() => region.getByRole('button', { name: /^Reorder / }).evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')))).toEqual(order.map(itemId => `Reorder ${question.options.find(option => option.id === itemId)!.text}`))
        }
      } else {
        for (const id of question.correctAnswers) {
          const option = question.options.find(value => value.id === id)!
          await region.getByRole('button', { name: option.text, exact: true }).click()
        }
      }
      await region.getByRole('button', { name: 'Submit Answer' }).click()
    }
    await expect(page.getByText('100%', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry This Scenario', exact: true })).toBeVisible()
  })
}

test('answered questions remain locked when returning to an earlier card', async ({ page }) => {
  await page.goto('/test/cardiac')
  await next(page, 'Question 1')
  const region = page.getByRole('region', { name: 'Scenario content' })
  await region.getByRole('button', { name: 'ST-elevation myocardial infarction (STEMI)', exact: true }).click()
  await region.getByRole('button', { name: 'Submit Answer' }).click()
  await next(page, 'Question 2')
  await page.getByRole('button', { name: /Go to previous item/ }).click()
  await expect(region.getByRole('heading', { name: 'Question 1', exact: true })).toBeVisible()
  await expect(region.getByRole('button', { name: 'Submit Answer' })).toHaveCount(0)
})

test('study and reference controls navigate without dead buttons', async ({ page }) => {
  await page.goto('/study')
  await expect(page.getByRole('button', { name: 'Coming soon', exact: true })).toHaveCount(2)
  for (const control of await page.getByRole('button', { name: 'Coming soon', exact: true }).all()) await expect(control).toBeDisabled()
  await page.getByRole('button', { name: 'Open Drug Reference', exact: true }).click()
  await expect(page).toHaveURL(/\/reference\/drug-reference$/)
  await page.getByRole('button', { name: 'View Details', exact: true }).first().click()
  await expect(page.getByRole('button', { name: /Back to Drug/ })).toBeVisible()
  await page.goto('/reference/emergency-protocols')
  await page.getByRole('button', { name: 'View Protocol', exact: true }).first().click()
  await expect(page.getByRole('button', { name: /Back to Protocol/ })).toBeVisible()
})

test('calculators reject invalid input, compute numeric examples, and clear stale results', async ({ page }) => {
  await page.goto('/reference/calculators')
  await page.getByRole('button', { name: 'Open IV Drip Rate Calculator', exact: true }).click()
  const calculate = page.getByRole('button', { name: 'Calculate Drip Rate' })
  await expect(calculate).toBeDisabled()
  await page.getByLabel('Total Volume (mL)').fill('1000')
  await page.getByLabel('Time (hours)').fill('8')
  await calculate.click()
  await expect(page.getByText('125 mL/hr', { exact: true })).toBeVisible()
  await page.getByLabel('Time (hours)').fill('0')
  await expect(calculate).toBeDisabled()
  await expect(page.getByText('125 mL/hr', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Back to Calculators' }).click()
  await page.getByRole('button', { name: 'Open Dosage Calculator', exact: true }).click()
  await page.getByLabel('Patient Weight (kg)').fill('70')
  await page.getByLabel('Dose (mg/kg)').fill('5')
  await page.getByLabel('Concentration (mg/mL)').fill('10')
  await page.getByRole('button', { name: 'Calculate Dosage' }).click()
  await expect(page.getByText('350 mg', { exact: true })).toBeVisible()
  await expect(page.getByText('35 mL', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Back to Calculators' }).click()
  await page.getByRole('button', { name: 'Open BMI Calculator', exact: true }).click()
  await page.getByLabel('Height (cm)').fill('175')
  await page.getByLabel('Weight (kg)').fill('70')
  await page.getByRole('button', { name: 'Calculate BMI' }).click()
  await expect(page.getByText('22.9', { exact: true })).toBeVisible()
})

test('adaptive practice adds harder questions before ending', async ({ page }) => {
  await page.goto('/test/adaptive')
  const region = page.getByRole('region', { name: 'Scenario content' })
  for (const [index, question] of adaptive.entries()) {
    if (index > 0) await next(page, `Question ${index + 1}`)
    await expect(region.getByRole('heading', { name: `Question ${index + 1}`, exact: true })).toBeVisible()
    for (const id of question.correctAnswers) await region.getByRole('button', { name: question.options.find(option => option.id === id)!.text, exact: true }).click()
    await region.getByRole('button', { name: 'Submit Answer' }).click()
  }
  await expect(page.getByText('100%', { exact: true })).toBeVisible()
})

test('privileged example endpoint is unavailable', async ({ request }) => {
  expect((await request.post('/api/admin-example')).status()).toBe(404)
})

test('generator downloads actual Markdown and reports clipboard failure', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied') } } }))
  await page.goto('/microlearning-generator')
  await page.getByLabel('Topic', { exact: true }).fill('Cardiac assessment')
  await page.getByLabel('Category', { exact: true }).selectOption('Cardiac')
  await page.getByRole('button', { name: 'Generate Content', exact: true }).click()
  const markdown = await page.locator('#markdown').inputValue()
  expect(markdown).toContain('Cardiac assessment')
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download Markdown', exact: true }).click()
  const download = await downloadEvent
  expect(await readFile((await download.path())!, 'utf8')).toBe(markdown)
  await page.getByRole('button', { name: 'Copy Markdown', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Could not copy')
})

test('every legacy quiz bank loads its own questions; Next advances without grading', async ({ page }) => {
  await page.goto('/quiz')
  for (const [key, bank] of Object.entries(BANKS)) {
    await page.getByLabel('Select bank', { exact: true }).selectOption(key)
    const card = page.getByRole('main', { name: 'Quiz card', exact: true })
    await expect(card.getByText(bank.items[0]!.question, { exact: true })).toBeVisible()
    if (bank.items.length > 1) {
      await card.getByRole('button', { name: 'Next', exact: true }).click()
      await expect(card.getByText(bank.items[0]!.question, { exact: true })).toHaveCount(0)
    } else await expect(card.getByRole('button', { name: 'Next', exact: true })).toBeDisabled()
    await card.getByRole('button', { name: /^A\./ }).click()
  }
})
