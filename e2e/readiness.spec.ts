import { test, expect } from '@playwright/test'
import { guidedCases } from '../lib/learning/cases'
import { transferQuestions } from '../lib/learning/worked-examples'

test('original logo remains available when the introduction video cannot load', async ({
  page,
}) => {
  await page.route('**/brand/rapidrounds-intro.mp4', (route) => route.abort())
  await page.goto('/')
  await page.getByRole('button', { name: 'Play original introduction' }).click()
  await expect(page.getByRole('status')).toContainText(
    'The video could not load'
  )
  await expect(
    page
      .getByRole('img', { name: 'Rapid Rounds metallic RR logo', exact: true })
      .last()
  ).toBeVisible()
  await expect(page.locator('video')).toHaveCount(0)
})

test('saved learning flows connect to the pathway and preserve first application evidence', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/rr/sepsis')
  const story = guidedCases[0]!
  await page.getByRole('radio').nth(1).check()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByText('Why each option matters').click()
  await expect(
    page.getByText(story.stages[0]!.explanations![1]!, { exact: true })
  ).toBeVisible()
  await page.reload()
  await expect(page.getByRole('radio').nth(1)).toBeChecked()
  await expect(page.getByRole('radio').nth(1)).toBeDisabled()
  await page.goto('/home')
  await page
    .getByRole('link', { name: 'Continue: The deteriorating patient' })
    .click()
  await page.getByRole('button', { name: 'Continue the story' }).click()
  for (const [index, step] of story.stages.entries()) {
    if (index === 0) continue
    await page.getByRole('radio').nth(step.correct).check()
    await page.getByRole('button', { name: 'Check answer' }).click()
    await page
      .getByRole('button', {
        name: index === 5 ? 'See your debrief' : 'Continue the story',
      })
      .click()
  }
  await expect(page.getByText(/5 of 6 decisions correct/)).toBeVisible()
  await page.goto('/pathway')
  await expect(
    page.getByRole('link', { name: 'Revisit the guided case' })
  ).toBeVisible()
  await page.getByRole('link', { name: 'Try the new patient' }).click()
  for (const [index, item] of transferQuestions.entries()) {
    await expect(
      page.getByText(transferQuestions[0]!.rationale, { exact: true })
    ).toHaveCount(0)
    await page.getByRole('radio').nth(item.correct).check()
    await page
      .getByRole('button', {
        name: index === 2 ? 'Submit final choice' : 'Save choice and continue',
      })
      .click()
    if (index === 0) await page.reload()
  }
  await expect(page.getByText(/3 of 3 choices matched/)).toBeVisible()
  await expect(
    page.getByText(/Treat this as immediate application/)
  ).toBeVisible()
  await page.reload()
  await expect(page.getByText(/3 of 3 choices matched/)).toBeVisible()
  await page.goto('/quiz?bank=vascular_disease_core')
  await page.getByRole('button', { name: 'Skip this question' }).click()
  await page.reload()
  await expect(page.getByText('Question 2 of 5', { exact: true })).toBeVisible()
  await page.goto('/content-review')
  const download = page.waitForEvent('download')
  await page
    .getByRole('link', { name: 'Download question intake spreadsheet' })
    .click()
  expect((await download).suggestedFilename()).toBe('question-template.csv')
  await page.goto('/reference/drug-reference')
  await expect(
    page.getByRole('heading', { name: 'This collection needs clinical review' })
  ).toBeVisible()
  await expect(page.getByText(/2.5-10mg/)).toHaveCount(0)
  expect(errors).toEqual([])
})

test('new learning routes fit narrow phones and pass automated dark-theme accessibility checks', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/settings')
  await page.getByRole('radio', { name: 'Dark', exact: true }).check()
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 950 })
    for (const route of [
      '/home',
      '/pathway',
      '/pathway/transfer',
      '/content-review',
      '/reference/calculators',
      '/leaderboard',
      '/achievements',
      '/glossary',
      '/quiz',
      '/rr',
    ]) {
      await page.goto(route)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      if (route === '/leaderboard') {
        await expect(
          page.getByRole('heading', {
            name: 'Shared leaderboards are not enabled',
          })
        ).toBeVisible()
        await expect(page.getByText('Sarah Chen', { exact: true })).toHaveCount(
          0
        )
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
      const violations = await page.evaluate(async () => {
        const result = await (window as any).axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] },
        })
        return result.violations.map((entry: any) => ({
          id: entry.id,
          targets: entry.nodes.map((node: any) => node.target),
        }))
      })
      expect(violations).toEqual([])
      if (width === 390 && ['/home', '/pathway', '/quiz'].includes(route))
        await page.screenshot({
          path: `../readiness-${route.slice(1)}-390.png`,
          fullPage: true,
          animations: 'disabled',
        })
    }
  }
})
