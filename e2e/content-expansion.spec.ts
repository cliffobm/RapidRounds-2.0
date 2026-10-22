import { test, expect } from '@playwright/test'
import { additionalCases } from '../lib/learning/additional-cases'
import { authoredQuestions } from '../lib/learning/authored-questions'

test('inline definitions preserve answers, support keyboard dismissal and record assistance', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/quiz?bank=neuro_template')
  await page.getByRole('radio').first().check()
  const trigger = page.getByRole('button', { name: 'Reference: aphasia' })
  await trigger.focus()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await trigger.press('Enter')
  const card = page.getByRole('dialog', { name: 'Aphasia' })
  await expect(card).toContainText(
    'Difficulty producing or understanding language.'
  )
  const bounds = await card.boundingBox()
  expect(bounds!.x).toBeGreaterThanOrEqual(0)
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320)
  await expect(page.getByRole('radio').first()).toBeChecked()
  await page.keyboard.press('Escape')
  await expect(card).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await trigger.click()
  await expect(card).toBeVisible()
  await page.getByRole('button', { name: 'Close reference' }).click()
  const saved = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem('rapidrounds-session-v1:practice:neuro_template')!
    )
  )
  expect(saved.state.responses[0]).toMatchObject({
    definitions_used: 1,
    outcome: 'correct',
    competency_eligible: false,
  })
  await page.reload()
  await expect(page.getByRole('radio').first()).toBeChecked()
  expect(errors).toEqual([])
})

test('case value cards retain source limits and theme, while independent application stays unlinked', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/settings')
  await page.getByRole('radio', { name: 'Dark', exact: true }).check()
  await page.goto('/rr/respiratory-change')
  await page.getByRole('radio').first().check()
  await page.locator('.patient-vitals .inline-reference-trigger').nth(1).click()
  const card = page.getByRole('dialog', {
    name: 'Resting adult respiratory rate',
  })
  await expect(card).toContainText('12–18 breaths/min')
  await expect(card).toContainText('not a patient-specific target')
  expect(
    await card.evaluate((element) => Boolean(element.closest('.rr-app')))
  ).toBe(true)
  await expect(page.getByRole('radio').first()).toBeChecked()
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
  const violations = await page.evaluate(async () =>
    (
      await (window as any).axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] },
      })
    ).violations.map((entry: any) => ({
      id: entry.id,
      targets: entry.nodes.map((node: any) => node.target),
    }))
  )
  expect(violations).toEqual([])
  await page.screenshot({
    path: '../inline-reference-values-390.png',
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('button', { name: 'Close reference' }).click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: 'Continue the story' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('radio').first()).not.toBeChecked()
  await page.goto('/pathway/transfer')
  await expect(page.locator('.inline-reference-trigger')).toHaveCount(0)
})

for (const story of additionalCases) {
  test(`new guided case completes and resumes: ${story.id}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 950 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`/rr/${story.id}`)
    for (const [index, step] of story.stages.entries()) {
      await expect(
        page.getByText(`Decision ${index + 1} of 6`, { exact: true })
      ).toBeVisible()
      await page.getByRole('radio').nth(step.correct).check()
      await page.getByRole('button', { name: 'Check answer' }).click()
      await expect(page.getByRole('status')).toContainText(step.rationale)
      if (index === 1) {
        await page.reload()
        await expect(page.getByRole('radio').nth(step.correct)).toBeChecked()
        await expect(page.getByRole('radio').nth(step.correct)).toBeDisabled()
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
      await page
        .getByRole('button', {
          name: index === 5 ? 'See your debrief' : 'Continue the story',
        })
        .click()
    }
    await expect(page.getByText(/6 of 6 decisions correct/)).toBeVisible()
    const activities = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('rapidrounds-activity-v1') ?? '[]')
    )
    expect(
      activities.some((entry: any) => entry.href === `/rr/${story.id}`)
    ).toBe(true)
    expect(errors).toEqual([])
  })
}
test('glossary preserves the selected answer and labels authored, reference-assisted practice', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 })
  await page.goto('/quiz?bank=neuro_template')
  await page.getByRole('button', { name: 'Skip this question' }).click()
  await expect(
    page.getByText('Authored educational draft · Clinical review pending', {
      exact: true,
    })
  ).toBeVisible()
  const item = authoredQuestions.find(
    (entry) => entry.bankKey === 'neuro_template'
  )!
  const position = item.options.findIndex(
    (option) => option.id === item.correctId
  )
  await page.getByRole('radio').nth(position).check()
  await page
    .getByText('Open glossary & value examples', { exact: true })
    .click()
  await page.getByRole('searchbox').fill('SpO2')
  await expect(
    page.getByRole('heading', { name: 'SpO₂', exact: true })
  ).toBeVisible()
  await expect(page.getByRole('radio').nth(position)).toBeChecked()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/Reference-assisted practice/)).toBeVisible()
  await page.getByText('Why each option matters', { exact: true }).click()
  await expect(
    page.getByText(item.explanations[position]!, { exact: true }).first()
  ).toBeVisible()
  await page.reload()
  await expect(page.getByRole('radio').nth(position)).toBeChecked()
  const saved = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem('rapidrounds-session-v1:practice:neuro_template')!
    )
  )
  expect(saved.state.responses[1]).toMatchObject({
    definitions_used: 1,
    evidence_class: 'authored_draft_practice',
    competency_eligible: false,
  })
  await page.getByRole('link', { name: 'Glossary', exact: true }).click()
  await page.getByRole('button', { name: 'Values & units' }).click()
  await page.getByRole('searchbox').fill('sodium')
  await expect(page.getByText('135–145 mEq/L', { exact: true })).toBeVisible()
  await page.screenshot({
    path: '../content-expansion-glossary-390.png',
    fullPage: true,
    animations: 'disabled',
  })
})
