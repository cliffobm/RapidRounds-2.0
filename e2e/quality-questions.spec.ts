import { test, expect } from '@playwright/test'
import {
  practiceCollections,
  getPracticeQuestion,
} from '../lib/learning/practice-library'
import {
  PRACTICE_SESSIONS_KEY,
  readPracticeSessions,
} from '../lib/learning/practice-session'

test('every topic starts a complete five-question set at every declared reasoning level on a phone', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 390, height: 950 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const collection of practiceCollections)
    for (const level of ['foundation', 'challenge', 'advanced'] as const) {
      await page.goto(
        `/practice?collection=${encodeURIComponent(collection.id)}&level=${level}&mode=check&count=5`
      )
      await expect(
        page.getByText('5 questions available at this level.', { exact: true })
      ).toBeVisible()
      await page
        .getByRole('button', { name: 'Start 5-question check', exact: true })
        .click()
      await expect(page).toHaveURL(/session=/)
      const sessionId = new URL(page.url()).searchParams.get('session')
      const raw = await page.evaluate(
        (key) => localStorage.getItem(key),
        PRACTICE_SESSIONS_KEY
      )
      const session = readPracticeSessions(raw).find((s) => s.id === sessionId)!
      expect(session, `${collection.id}/${level}`).toBeDefined()
      expect(session.ids).toHaveLength(5)
      for (const id of session.ids) {
        const q = getPracticeQuestion(id, session.revision)!
        expect(q.collectionId).toBe(collection.id)
        expect(q.level).toBe(level)
      }
      await expect(page.getByRole('radio')).toHaveCount(4)
      await expect(
        page.getByRole('region', { name: 'Key cues', exact: true })
      ).toHaveCount(0)
      await expect(
        page.getByRole('region', { name: 'Clinical reasoning', exact: true })
      ).toHaveCount(0)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    }
})

test('Advanced shock gives a clear grade and complete scenario-specific debrief after submission', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(
    '/practice?collection=multisystem_core_shock&level=advanced&mode=check&count=5'
  )
  await page
    .getByRole('button', { name: 'Start 5-question check', exact: true })
    .click()
  await expect(page).toHaveURL(/session=/)
  const sessionId = new URL(page.url()).searchParams.get('session')
  const raw = await page.evaluate(
    (key) => localStorage.getItem(key),
    PRACTICE_SESSIONS_KEY
  )
  const session = readPracticeSessions(raw).find((s) => s.id === sessionId)!
  for (const [index, id] of session.ids.entries()) {
    const q = getPracticeQuestion(id, session.revision)!
    const choice = q.options.find((o) =>
      index === 0 ? !q.correct.includes(o.id) : q.correct.includes(o.id)
    )!
    await expect(
      page.getByText(q.review!.debrief, { exact: true })
    ).toHaveCount(0)
    await expect(
      page.getByRole('region', { name: 'Reassessment and uncertainty' })
    ).toHaveCount(0)
    await page.getByRole('radio', { name: choice.text, exact: true }).check()
    await page
      .getByRole('button', {
        name: index === 4 ? 'Submit check' : 'Save and continue',
        exact: true,
      })
      .click()
  }
  await expect(
    page.getByRole('region', { name: 'Practice result' })
  ).toContainText('80%')
  await expect(
    page.getByRole('region', { name: 'Practice result' })
  ).toContainText('4 of 5 questions correct')
  const q = getPracticeQuestion(session.ids[0]!, session.revision)!
  const review = page.locator('.decision-review').first()
  await review.locator('summary').first().click()
  await expect(
    review.getByRole('region', { name: 'Key cues', exact: true })
  ).toBeVisible()
  await expect(
    review.getByRole('region', { name: 'Clinical reasoning', exact: true })
  ).toContainText(q.review!.reasoning[0]!)
  await expect(
    review.getByRole('region', {
      name: 'Reassessment and uncertainty',
      exact: true,
    })
  ).toContainText(q.review!.uncertainty!)
  await expect(
    review.getByRole('region', {
      name: 'Why your answer was incorrect',
      exact: true,
    })
  ).toBeVisible()
  await expect(
    review.getByRole('region', {
      name: 'Clinical judgment debrief',
      exact: true,
    })
  ).toContainText(q.review!.debrief)
  await review.getByText('Other options', { exact: true }).click()
  await expect(
    review
      .getByRole('region', { name: 'Rationale references', exact: true })
      .getByRole('link')
  ).toHaveCount(q.review!.references.length)
  await page.screenshot({
    path: '../cjis-v2-shock-review-phone.png',
    fullPage: true,
    animations: 'disabled',
  })
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 950 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
    const violations = await page.evaluate(async () =>
      (
        await (window as any).axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] },
        })
      ).violations.map((v: any) => ({
        id: v.id,
        nodes: v.nodes.map((n: any) => n.target),
      }))
    )
    expect(violations).toEqual([])
  }
})
