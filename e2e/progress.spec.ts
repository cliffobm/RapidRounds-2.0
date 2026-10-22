import { test, expect, type Page } from '@playwright/test'
import {
  getPracticeQuestion,
  practiceCollections,
  practicePool,
} from '../lib/learning/practice-library'
import {
  PRACTICE_SESSIONS_KEY,
  type UnifiedPracticeSession,
} from '../lib/learning/practice-session'
import { studyUnits } from '../lib/learning/study'

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

const collection = practiceCollections.find(
  (entry) =>
    entry.count >= 10 &&
    practicePool(entry.id).every(
      (question) => question.level === 'unclassified'
    )
)!

async function assertAccessiblePhoneLayout(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-rr-motion', 'true')
  await expect(page.locator('.rr-experience')).toHaveCSS('opacity', '1')
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
      nodes: entry.nodes.map((node: any) => ({
        target: node.target,
        summary: node.failureSummary,
      })),
    }))
  })
  const diagnostics = await page.evaluate(() => ({
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    motionPreference: document.documentElement.dataset.rrMotion,
    elements: ['.rr-experience', '.eyebrow'].map((selector) => {
      const element = document.querySelector(selector)!
      const style = getComputedStyle(element)
      return {
        selector,
        color: style.color,
        opacity: style.opacity,
        background: style.backgroundColor,
        animation: style.animationName,
        transition: style.transition,
      }
    }),
  }))
  expect(violations, JSON.stringify(diagnostics)).toEqual([])
}

async function currentSession(page: Page) {
  await expect(page).toHaveURL(/\/practice\?session=/)
  const id = new URL(page.url()).searchParams.get('session')
  return page.evaluate(
    ({ key, id }) => {
      const sessions = JSON.parse(
        localStorage.getItem(key) ?? '[]'
      ) as UnifiedPracticeSession[]
      return sessions.find((entry) => entry.id === id)!
    },
    { key: PRACTICE_SESSIONS_KEY, id }
  )
}

async function selectCanonicalAnswer(page: Page, wrong = false) {
  const session = await currentSession(page)
  const question = getPracticeQuestion(session.ids[session.index]!)!
  const option = question.options.find((entry) =>
    wrong
      ? !question.correct.includes(entry.id)
      : question.correct.includes(entry.id)
  )!
  await page.getByRole('radio', { name: option.text, exact: true }).check()
  return { question, option }
}

async function startPractice(
  page: Page,
  mode: 'guided' | 'check',
  count: 5 | 10
) {
  await page.goto(
    `/practice?collection=${encodeURIComponent(collection.id)}&mode=${mode}&count=${count}`
  )
  await expect(
    page.getByRole('heading', { name: 'Practice your next decision' })
  ).toBeVisible()
  if (mode === 'check' && count === 5) {
    await assertAccessiblePhoneLayout(page)
    await page.screenshot({
      path: '../practice-unified-390.png',
      fullPage: true,
      animations: 'disabled',
    })
  }
  await page
    .getByRole('button', {
      name: `Start ${count}-question ${mode === 'guided' ? 'guided practice' : 'check'}`,
      exact: true,
    })
    .click()
  await expect(page).toHaveURL(/\/practice\?session=/)
  await expect(
    page.getByText(`Question 1 of ${count}`, { exact: true })
  ).toBeVisible()
}

async function completeGuided(page: Page, firstWrong = false) {
  for (let index = 0; index < 5; index++) {
    const { question } = await selectCanonicalAnswer(
      page,
      firstWrong && index === 0
    )
    await page
      .getByRole('button', { name: 'Submit answer', exact: true })
      .click()
    await expect(
      page.getByRole('heading', {
        name: index === 0 && firstWrong ? 'Incorrect' : 'Correct',
        exact: true,
      })
    ).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Correct answer', exact: true })
    ).toContainText(
      question.options.find((option) => question.correct.includes(option.id))!
        .explanation
    )
    if (index === 0) {
      await page.reload()
      await expect(
        page.getByRole('heading', {
          name: firstWrong ? 'Incorrect' : 'Correct',
          exact: true,
        })
      ).toBeVisible()
      await expect(page.getByRole('radio', { checked: true })).toBeDisabled()
    }
    await page
      .getByRole('button', {
        name: index === 4 ? 'View results' : 'Next question',
        exact: true,
      })
      .click()
  }
  await expect(
    page.getByRole('heading', { name: 'Your results', exact: true })
  ).toBeVisible()
}

test('guided questions provide immediate feedback and preserve first and repeat results separately', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 })
  await startPractice(page, 'guided', 5)
  await completeGuided(page, true)
  await expect(
    page.getByRole('region', { name: 'Practice result' })
  ).toContainText('80%')
  await expect(
    page.getByRole('region', { name: 'Practice result' })
  ).toContainText('4 of 5 questions correct')
  const firstId = (await currentSession(page)).id
  await page.goto('/progress')
  await expect(
    page.getByRole('heading', { name: 'Practice history', exact: true })
  ).toBeVisible()
  await expect(page.locator('.progress-result')).toHaveCount(1)
  await expect(page.locator('.progress-result')).toContainText(
    'First recorded attempt'
  )
  await page
    .locator('.progress-result')
    .getByRole('link', { name: 'Open activity →', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Your results', exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Start another practice', exact: true })
    .click()
  await page
    .getByRole('button', {
      name: 'Start 5-question guided practice',
      exact: true,
    })
    .click()
  await expect
    .poll(async () => (await currentSession(page))?.id)
    .not.toBe(firstId)
  await completeGuided(page)
  await page.goto('/progress')
  await expect(page.locator('.progress-result')).toHaveCount(2)
  await expect(
    page.locator('.progress-result').filter({ hasText: 'Repeat practice' })
  ).toContainText('100%')
  await expect(
    page.locator('.progress-result').filter({ hasText: 'Repeat practice' })
  ).toContainText('+20 percentage points')
  await expect(
    page
      .locator('.progress-result')
      .filter({ hasText: 'First recorded attempt' })
  ).toContainText('80%')
  await assertAccessiblePhoneLayout(page)
  await page.screenshot({
    path: '../progress-history-390.png',
    fullPage: true,
    animations: 'disabled',
  })
  await page.reload()
  await expect(page.locator('.progress-result')).toHaveCount(2)
})

for (const count of [5, 10] as const) {
  test(`${count}-question checks save drafts, resume from Home and Progress, and defer explanations until submission`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 950 })
    await startPractice(page, 'check', count)
    if (count === 5) await assertAccessiblePhoneLayout(page)
    const { option } = await selectCanonicalAnswer(page)
    await expect
      .poll(async () => (await currentSession(page))?.selected)
      .toBe(option.id)
    await page.reload()
    await expect(
      page.getByRole('radio', { name: option.text, exact: true })
    ).toBeChecked()
    await page.goto('/home')
    await page
      .getByRole('region', { name: 'Your next learning activity' })
      .getByRole('link', {
        name: `Continue: ${collection.title} →`,
        exact: true,
      })
      .click()
    await expect(
      page.getByRole('radio', { name: option.text, exact: true })
    ).toBeChecked()
    await expect(
      page.getByRole('heading', { name: 'Correct answer', exact: true })
    ).toHaveCount(0)
    await page
      .getByRole('button', { name: 'Save and continue', exact: true })
      .click()
    await expect(
      page.getByText(`Question 2 of ${count}`, { exact: true })
    ).toBeVisible()
    await page.goto('/progress')
    await expect(
      page.getByText(`Knowledge check · Question 2 of ${count}`, {
        exact: true,
      })
    ).toBeVisible()
    await page
      .getByRole('link', { name: `Resume ${collection.title} →`, exact: true })
      .click()
    for (let index = 1; index < count; index++) {
      const { question } = await selectCanonicalAnswer(page)
      await expect(page.locator('.answer-review')).toHaveCount(0)
      for (const option of question.options) {
        await expect(
          page.getByText(option.explanation, { exact: true })
        ).toHaveCount(0)
      }
      await expect(
        page.getByRole('button', { name: /Submit check|Save and continue/ })
      ).toBeEnabled()
      await page
        .getByRole('button', {
          name: index === count - 1 ? 'Submit check' : 'Save and continue',
          exact: true,
        })
        .click()
    }
    await expect(
      page.getByRole('heading', { name: 'Your results', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Practice result' })
    ).toContainText(`${count} of ${count} questions correct`)
    await expect(
      page.getByRole('region', { name: 'Practice result' })
    ).toContainText('100%')
    await page.locator('.decision-review > summary').first().click()
    await expect(
      page.getByRole('heading', { name: 'Correct answer', exact: true })
    ).toBeVisible()
    await page.goto('/progress')
    await expect(page.locator('.progress-result')).toHaveCount(1)
    await expect(page.locator('.progress-result')).toContainText(
      'Knowledge check'
    )
    await expect(
      page.getByRole('link', {
        name: `Resume ${collection.title} →`,
        exact: true,
      })
    ).toHaveCount(0)
    await expect(page.locator('body')).not.toContainText(
      /time limit|seconds remaining|time expired/i
    )
  })
}

test('unfinished study restores lessons and submitted feedback through Home and Progress without fabricating completion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 })
  const unit = studyUnits[0]!
  await page.goto(`/study?pillar=${unit.id}`)
  await page
    .getByRole('radio', {
      name: unit.pre.options[unit.pre.correct]!,
      exact: true,
    })
    .check()
  await page.getByRole('button', { name: 'Check answer', exact: true }).click()
  await page
    .getByRole('button', { name: 'Explore the lesson', exact: true })
    .click()
  await page.goto('/home')
  await page
    .getByRole('region', { name: 'Your next learning activity' })
    .getByRole('link', { name: `Continue: ${unit.title} →`, exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: unit.sections[0]!.heading, exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Apply what you explored', exact: true })
    .click()
  await page
    .getByRole('radio', {
      name: unit.post.options[unit.post.correct]!,
      exact: true,
    })
    .check()
  await page.getByRole('button', { name: 'Check answer', exact: true }).click()
  await page.goto('/progress')
  await expect(
    page.getByText('Application knowledge check', { exact: true })
  ).toBeVisible()
  await expect(page.locator('.progress-result')).toHaveCount(0)
  await page
    .getByRole('link', { name: `Resume ${unit.title} →`, exact: true })
    .click()
  await expect(page.getByRole('status')).toContainText(unit.post.rationale)
  await expect(page.getByRole('radio', { checked: true })).toHaveValue(
    String(unit.post.correct)
  )
  await page
    .getByRole('button', { name: 'See your learning snapshot', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'You closed the loop.', exact: true })
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'You closed the loop.', exact: true })
  ).toBeVisible()
  await page.goto('/progress')
  await expect(
    page.getByRole('link', { name: `Resume ${unit.title} →`, exact: true })
  ).toHaveCount(0)
  await expect(page.locator('.progress-result')).toHaveCount(0)
  await page.goto(`/study?pillar=${unit.id}`)
  await page
    .getByRole('button', { name: 'Restart checks', exact: true })
    .click()
  await expect(
    page.getByRole('group', { name: unit.pre.prompt, exact: true })
  ).toBeVisible()
})
