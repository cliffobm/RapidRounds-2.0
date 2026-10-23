import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs/promises'
import { materialStudyTopics } from '../lib/learning/material-study'
import { materialCollections } from '../lib/learning/material-questions'
import {
  getPracticeQuestion,
  practiceCollections,
  practiceLibrary,
} from '../lib/learning/practice-library'
import {
  createPracticeSession,
  PRACTICE_SESSIONS_KEY,
  readPracticeSessions,
} from '../lib/learning/practice-session'

async function currentPractice(page: Page) {
  const id = new URL(page.url()).searchParams.get('session')
  const raw = await page.evaluate(
    (key) => localStorage.getItem(key),
    PRACTICE_SESSIONS_KEY
  )
  const session = readPracticeSessions(raw).find((entry) => entry.id === id)
  expect(session).toBeDefined()
  return session!
}
async function accessible(page: Page) {
  await expect(page.locator('.rr-experience')).toHaveCSS('opacity', '1')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
  const violations = await page.evaluate(async () => {
    const r = await (window as any).axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] },
    })
    return r.violations.map((v: any) => ({
      id: v.id,
      nodes: v.nodes.map((n: any) => n.target),
    }))
  })
  expect(violations).toEqual([])
}
test('colleague review guide supports phone layouts, light/dark accessibility and a real feedback download', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const theme of ['Light', 'Dark']) {
    await page.goto('/settings')
    await page.getByRole('radio', { name: theme, exact: true }).check()
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 950 })
      await page.goto('/review-guide')
      await expect(
        page.getByRole('heading', { name: 'Help shape RapidRounds.' })
      ).toBeVisible()
      if (theme === 'Dark')
        await expect(page.locator('html')).toHaveClass(/dark/)
      else await expect(page.locator('html')).not.toHaveClass(/dark/)
      await accessible(page)
    }
  }
  await page
    .getByLabel('Review area', { exact: true })
    .selectOption('Question or rationale')
  await page
    .getByLabel('Case/topic, level and decision or question reference')
    .fill('Medication case / Advanced / decision 2')
  await page
    .getByLabel('What happened or needs correction?')
    .fill('The competing priority needs a clearer explanation in the debrief.')
  const waiting = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download review notes' }).click()
  const download = await waiting
  const path = await download.path()
  expect(path).not.toBeNull()
  const text = await fs.readFile(path!, 'utf8')
  expect(text).toContain('Medication case / Advanced / decision 2')
  expect(text).toContain('competing priority')
  await expect(page.getByRole('status')).toContainText('downloaded')
  await page.screenshot({
    path: '../review-guide-live-proof.png',
    fullPage: true,
    animations: 'disabled',
  })
})
test('all four clinical lessons preserve drafts, score actual checks and appear in Progress', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [topicIndex, topic] of materialStudyTopics.entries()) {
    await page.goto(`/study/topics/${topic.id}`)
    for (const [index, section] of topic.sections.entries()) {
      const radio = page.getByRole('radio', {
        name: section.check.options[section.check.correct]!,
        exact: true,
      })
      await radio.check()
      if (index === 0) {
        await page.reload()
        await expect(radio).toBeChecked()
      }
      await page
        .getByRole('button', { name: 'Check answer', exact: true })
        .click()
      await expect(page.getByRole('status')).toContainText(
        section.check.rationale
      )
      if (topicIndex === 0 && index === 0) {
        await accessible(page)
        await page.screenshot({
          path: '../clinical-study-390.png',
          fullPage: true,
          animations: 'disabled',
        })
      }
      await page
        .getByRole('button', {
          name: index === 2 ? 'View lesson results' : 'Next section',
          exact: true,
        })
        .click()
    }
    await expect(
      page.getByRole('region', { name: 'Clinical study result' })
    ).toContainText('100%')
    await expect(
      page.getByRole('link', { name: 'Practice this topic' })
    ).toHaveAttribute(
      'href',
      `/practice?collection=${topic.practiceCollectionId}`
    )
  }
  await page.goto('/progress')
  await expect(page.locator('.progress-result')).toHaveCount(4)
  await expect(page.locator('.progress-result').first()).toContainText(
    'Clinical study'
  )
  await expect(page.locator('.progress-result').first()).toContainText(
    '3 of 3 answered'
  )
})
test('new topic and advanced filters create complete five-question checks without feedback leaks', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 })
  for (const collection of materialCollections) {
    await page.goto(
      `/practice?collection=${collection.id}&level=advanced&mode=check&count=5`
    )
    await page
      .getByRole('button', { name: 'Start 5-question check', exact: true })
      .click()
    for (let index = 0; index < 5; index++) {
      const group = page
        .getByRole('group')
        .filter({ has: page.locator('legend') })
      const prompt = await group.locator('legend').innerText()
      const question = practiceLibrary.find(
        (q) => q.prompt === prompt && q.collectionId === collection.id
      )!
      expect(question.collectionId).toBe(collection.id)
      expect(question.level).toBe('advanced')
      await expect(
        page.getByText(question.context, { exact: true })
      ).toBeVisible()
      const answer = question.options.find((o) => o.id === question.correct[0])!
      await page.getByRole('radio', { name: answer.text, exact: true }).check()
      await expect(
        page.getByText(answer.explanation, { exact: true })
      ).toHaveCount(0)
      await page
        .getByRole('button', {
          name: index === 4 ? 'Submit check' : 'Save and continue',
          exact: true,
        })
        .click()
    }
    await expect(
      page.getByRole('region', { name: 'Practice result' })
    ).toContainText('100%')
  }
})

test('phone topic choices lead to focused practice, brief guided feedback and a complete ventilation review', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const theme of ['Light', 'Dark']) {
    await page.goto('/settings')
    await page.getByRole('radio', { name: theme, exact: true }).check()
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 950 })
      await page.goto('/practice')
      await expect(
        page.getByRole('textbox', { name: 'Search practice topics' })
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: /Mixed topics 196 questions/ })
      ).toHaveAttribute('aria-pressed', 'true')
      await page
        .getByRole('button', {
          name: `View all ${practiceCollections.length} topics`,
        })
        .click()
      await expect(page.locator('.practice-topic-card')).toHaveCount(
        practiceCollections.length + 1
      )
      await accessible(page)
    }
  }
  await page
    .getByRole('textbox', { name: 'Search practice topics' })
    .fill('respiratory')
  await expect(page.locator('.practice-topic-card')).toHaveCount(2)
  await page
    .getByRole('button', { name: /Respiratory assessment 5 questions/ })
    .click()
  await expect(
    page.getByText('Every question comes from this topic.')
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Change topic' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: '10 questions', exact: true })
  ).toBeDisabled()
  await page.screenshot({
    path: '../practice-topics-390.png',
    fullPage: true,
    animations: 'disabled',
  })
  await page
    .getByRole('button', {
      name: 'Start 5-question guided practice',
      exact: true,
    })
    .click()
  await expect(page).toHaveURL(/\/practice\?session=/)
  const initial = await currentPractice(page)
  expect(initial.collectionId).toBe('pulm_template')
  expect(initial.ids).toHaveLength(5)
  expect(initial.ids).toContain('pulm-demo-1')
  for (let index = 0; index < initial.ids.length; index++) {
    const question = getPracticeQuestion(initial.ids[index]!)!
    expect(question.collectionId).toBe('pulm_template')
    const option = question.options.find(
      (entry) => entry.id === question.correct[0]
    )!
    await page.getByRole('radio', { name: option.text, exact: true }).check()
    if (index === 0) {
      await page.reload()
      await expect(
        page.getByRole('radio', { name: option.text, exact: true })
      ).toBeChecked()
      expect((await currentPractice(page)).ids).toEqual(initial.ids)
    }
    await page
      .getByRole('button', { name: 'Submit answer', exact: true })
      .click()
    await expect(
      page.getByRole('heading', { name: 'Correct', exact: true })
    ).toBeVisible()
    await expect(page.locator('.brief-answer')).toBeVisible()
    await expect(
      page.getByText('Full answer review follows your results.', {
        exact: true,
      })
    ).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Clinical reasoning', exact: true })
    ).toHaveCount(0)
    await expect(
      page.getByRole('region', { name: 'Worked example', exact: true })
    ).toHaveCount(0)
    await page
      .getByRole('button', {
        name: index === 4 ? 'View results' : 'Next question',
        exact: true,
      })
      .click()
  }
  await expect(
    page.getByRole('region', { name: 'Practice result' })
  ).toContainText('100%')
  const ventilation = getPracticeQuestion('pulm-demo-1')!
  const review = page
    .locator('.decision-review')
    .filter({ hasText: ventilation.context })
  await expect(review).toHaveCount(1)
  await review.locator('summary').first().click()
  await expect(
    review.getByRole('region', { name: 'Clinical reasoning', exact: true })
  ).toBeVisible()
  await expect(
    review.getByRole('region', { name: 'Key terms', exact: true })
  ).toBeVisible()
  await expect(
    review.getByRole('region', { name: 'Worked example', exact: true })
  ).toBeVisible()
  await expect(
    review.getByRole('region', { name: 'Rationale references', exact: true })
  ).toBeVisible()
  await expect(
    review.getByRole('region', { name: 'Key terms', exact: true })
  ).toContainText(/tidal volume/i)
  await review
    .getByRole('button', { name: 'Reference: VE', exact: true })
    .first()
    .click()
  await expect(
    page.getByRole('heading', { name: 'Minute ventilation', exact: true })
  ).toBeVisible()
  await expect(page.locator('.inline-reference-card')).toContainText(
    'tidal volume × respiratory rate'
  )
  await accessible(page)
  await page
    .getByRole('button', { name: 'Close reference', exact: true })
    .click()
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 950 })
    await accessible(page)
  }
  await page.screenshot({
    path: '../ventilation-rationale-390.png',
    fullPage: true,
    animations: 'disabled',
  })
})

test('trauma knowledge check conceals explanations until completion and then explains the airway priority', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const trauma = practiceLibrary.find((question) =>
    question.context.includes('rider, GCS 12')
  )!
  expect(trauma).toBeDefined()
  const session = createPracticeSession({
    id: 'trauma-complete-review',
    mode: 'check',
    collectionId: trauma.collectionId,
    count: 5,
  })!
  session.ids = [
    trauma.id,
    ...practiceLibrary
      .filter(
        (question) =>
          question.collectionId === trauma.collectionId &&
          question.id !== trauma.id
      )
      .slice(0, 4)
      .map((question) => question.id),
  ]
  await page.goto('/practice')
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify([session])),
    { key: PRACTICE_SESSIONS_KEY, session }
  )
  await page.goto(`/practice?session=${session.id}`)
  for (let index = 0; index < session.ids.length; index++) {
    const question = getPracticeQuestion(session.ids[index]!)!
    const option = question.options.find(
      (entry) => entry.id === question.correct[0]
    )!
    await page.getByRole('radio', { name: option.text, exact: true }).check()
    await expect(
      page.getByRole('heading', { name: 'Correct', exact: true })
    ).toHaveCount(0)
    await expect(
      page.getByRole('region', { name: 'Clinical reasoning', exact: true })
    ).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^Reference:/ })).toHaveCount(
      0
    )
    await expect(
      page.getByText(option.explanation, { exact: true })
    ).toHaveCount(0)
    await page
      .getByRole('button', {
        name: index === 4 ? 'Submit check' : 'Save and continue',
        exact: true,
      })
      .click()
  }
  await expect(
    page.getByRole('region', { name: 'Practice result' })
  ).toContainText('100%')
  const review = page
    .locator('.decision-review')
    .filter({ hasText: trauma.context })
  await review.locator('summary').first().click()
  await expect(
    review.getByRole('region', { name: 'Clinical reasoning', exact: true })
  ).toBeVisible()
  await expect(
    review.getByRole('region', { name: 'Context matters', exact: true })
  ).toBeVisible()
  await expect(
    review.getByRole('region', { name: 'Rationale references', exact: true })
  ).toBeVisible()
  await accessible(page)
})
