import { test, expect } from '@playwright/test'
import { evolvingCases } from '../lib/learning/evolving-content'
import { newCaseSession } from '../lib/learning/evolving-session'
import { questionFor } from '../lib/learning/evolving-types'

test('case results distinguish correct, incorrect and unanswered decisions and survive reload', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 })
  const story = evolvingCases[0]!
  const saved = {
    ...newCaseSession(story, 'challenge', 'handoff'),
    index: 5,
    complete: true,
    answers: story.paths[0]!.frames.map((frame, index) => {
      const question = questionFor(frame, 'challenge')
      return {
        selected:
          index === 4 ? [] : index === 5 ? ['0', '2'] : question.correct,
        rationale: '',
        confidence: 'confident',
        assisted: index === 1 || index === 4,
        skipped: index === 4,
      }
    }),
  }
  await page.addInitScript(
    ({ saved }) => {
      localStorage.setItem(
        'rapidrounds-evolving-v1:fever-neuro',
        JSON.stringify(saved)
      )
      localStorage.setItem(
        'rapidrounds-preferences-v1',
        JSON.stringify({ theme: 'dark' })
      )
    },
    { saved }
  )
  await page.goto('/evolving/fever-neuro')
  const result = page.getByRole('region', { name: 'Practice result' })
  await expect(result.getByText('80%', { exact: true })).toBeVisible()
  await expect(result.getByText('4 of 5 decisions correct')).toBeVisible()
  await expect(
    result.getByText('Reference support used: 1. No points deducted.')
  ).toBeVisible()
  const rows = page.locator('.decision-review')
  await expect(rows).toHaveCount(6)
  await expect(rows.nth(4).locator(':scope > summary')).toContainText(
    'Not answered'
  )
  await rows.nth(4).locator(':scope > summary').click()
  await expect(
    rows.nth(4).getByText(/This decision is excluded from your score/)
  ).toBeVisible()
  await expect(
    rows.nth(4).getByRole('heading', { name: 'Incorrect', exact: true })
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Review incorrect decisions' }).click()
  await expect(rows).toHaveCount(1)
  const question = story.paths[0]!.frames[5]!.complex
  await expect(
    rows.getByRole('heading', { name: question.prompt, exact: true })
  ).toBeVisible()
  await expect(
    rows.getByRole('region', { name: 'Your answer', exact: true })
  ).toContainText(question.options[2]!.text)
  await expect(
    rows.getByRole('region', { name: 'Correct answer', exact: true })
  ).toContainText(question.options[1]!.text)
  await page.getByRole('button', { name: 'All decisions (6)' }).click()
  await page.reload()
  await expect(result.getByText('80%', { exact: true })).toBeVisible()
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
  const violations = await page.evaluate(async () =>
    (
      await (window as any).axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] },
      })
    ).violations.map((v: any) => ({
      id: v.id,
      targets: v.nodes.map((n: any) => n.target),
    }))
  )
  expect(violations).toEqual([])
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
  await page.screenshot({
    path: '../debrief-results-390.png',
    fullPage: true,
    animations: 'disabled',
  })
  await page.goto('/rr')
  await expect(
    page.getByRole('heading', { name: 'The Unusual Headache', exact: true })
  ).toBeVisible()
  await expect(page.getByText('2 paths · 6 decisions per path')).toHaveCount(0)
})
