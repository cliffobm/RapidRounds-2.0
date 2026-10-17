import { test, expect } from '@playwright/test'
import { additionalCases } from '../lib/learning/additional-cases'
import { authoredQuestions } from '../lib/learning/authored-questions'

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
    await expect(page.getByText(/6 of 6 decisions matched/)).toBeVisible()
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
