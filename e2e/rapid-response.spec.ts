import { test, expect, type Page } from '@playwright/test'
import {
  rapidResponseCases,
  type RapidResponseCase,
} from '../lib/learning/rapid-response-content'
import {
  RAPID_RESPONSE_KEY,
  createRapidResponseSession,
  readRapidResponseSessions,
  submitRapidResponseAnswer,
} from '../lib/learning/rapid-response-session'
import { historyKey, readAttempts } from '../lib/learning/attempt-history'
import { getEcgRhythm } from '../lib/learning/ecg-rhythms'

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

async function sessions(page: Page) {
  return readRapidResponseSessions(
    await page.evaluate((key) => localStorage.getItem(key), RAPID_RESPONSE_KEY)
  )
}
async function sessionFor(page: Page, caseId: string) {
  const found = (await sessions(page)).find(
    (session) => session.caseId === caseId
  )
  expect(found).toBeDefined()
  return found!
}
async function chooseCorrect(
  page: Page,
  story: RapidResponseCase,
  index: number
) {
  const question = story.stages[index]!.question
  await expect(
    page.getByRole('group', { name: question.prompt, exact: true })
  ).toBeVisible()
  for (const id of question.correct) {
    const option = question.options.find((value) => value.id === id)!
    await page
      .getByRole(question.correct.length === 1 ? 'radio' : 'checkbox', {
        name: option.text,
        exact: true,
      })
      .check()
  }
}
async function submitCorrect(
  page: Page,
  story: RapidResponseCase,
  index: number
) {
  await chooseCorrect(page, story, index)
  await page
    .getByRole('button', {
      name:
        index === story.stages.length - 1
          ? 'Submit and review'
          : 'Save decision and continue',
      exact: true,
    })
    .click()
}
async function startCase(
  page: Page,
  story: RapidResponseCase,
  challenge = false
) {
  await page.goto(`/rapid-response?case=${story.id}`)
  await expect(
    page.getByRole('heading', { name: story.title, exact: true })
  ).toBeVisible()
  if (challenge)
    await page
      .getByRole('radio', { name: 'Response challenge', exact: true })
      .check()
  else
    await expect(
      page.getByRole('radio', { name: 'Untimed practice', exact: true })
    ).toBeChecked()
  await page.getByRole('button', { name: 'Start case', exact: true }).click()
  await expect(
    page.getByRole('region', { name: 'Current patient information' })
  ).toBeVisible()
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
    const result = await (window as any).axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] },
    })
    return result.violations.map((value: any) => ({
      id: value.id,
      nodes: value.nodes.map((node: any) => ({
        target: node.target,
        summary: node.failureSummary,
      })),
    }))
  })
  expect(violations).toEqual([])
}
async function seedExpiry(
  page: Page,
  story: RapidResponseCase,
  id: string,
  answered = false
) {
  let session = createRapidResponseSession(story.id, { mode: 'challenge', id })!
  if (answered) {
    session = submitRapidResponseAnswer({
      ...session,
      activeMs: 1000,
      selected: [...story.stages[0]!.question.correct],
    })
  }
  const selected = [...story.stages[session.index]!.question.correct]
  session = {
    ...session,
    selected,
    activeMs: session.budgetMs! - 1000,
    paused: true,
  }
  // Use the production reader to prove this is a supported saved state.
  expect(readRapidResponseSessions(JSON.stringify([session]))).toHaveLength(1)
  await page.goto('/rapid-response')
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify([value])),
    { key: RAPID_RESPONSE_KEY, value: session }
  )
  await page.goto(`/rapid-response?session=${id}`)
  await expect(page.getByRole('region', { name: 'Case paused' })).toBeVisible()
  await page.getByRole('button', { name: 'Resume case', exact: true }).click()
  await expect(
    page.getByRole('alert', { name: 'Practice time reached' })
  ).toBeVisible({ timeout: 8000 })
  return session
}

test('all six Rapid Response cases withhold feedback, score canonical decisions and record timing separately', async ({
  page,
}) => {
  test.setTimeout(120_000)
  expect(rapidResponseCases).toHaveLength(6)
  for (const story of rapidResponseCases) {
    expect(story.stages).toHaveLength(4)
    await startCase(page, story)
    await expect(
      page.getByRole('timer', { name: 'Active case time' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Enable quiet timing sound' })
    ).toHaveCount(0)
    for (const [index, stage] of story.stages.entries()) {
      await expect(
        page.getByRole('region', { name: 'Rapid Response result' })
      ).toHaveCount(0)
      await expect(page.locator('.scenario-feedback')).toHaveCount(0)
      await expect(
        page.getByRole('region', { name: 'Correct answer', exact: true })
      ).toHaveCount(0)
      if (stage.rhythmId) {
        const strip = page.getByTestId('ecg-strip')
        await expect(strip.locator('.ecg-strip-heading strong')).toHaveText(
          'ECG strip'
        )
        await expect(strip.getByRole('img')).toHaveAccessibleName(/^ECG strip /)
        await expect(strip.locator('svg title')).toHaveText('ECG strip')
        expect(await strip.locator('svg desc').textContent()).not.toContain(
          getEcgRhythm(stage.rhythmId).label
        )
      }
      await submitCorrect(page, story, index)
    }
    const result = page.getByRole('region', { name: 'Rapid Response result' })
    await expect(
      result.getByRole('region', { name: 'Practice result' })
    ).toContainText('100%')
    await expect(result).toContainText('4 of 4 decisions correct')
    await expect(result).toContainText(
      'Accuracy and time are reported separately'
    )
    await expect(result.locator('.feedback-result')).toHaveCount(4)
    await expect(
      result.locator('.feedback-result').filter({ hasText: /^Correct$/ })
    ).toHaveCount(4)
    for (const stage of story.stages.filter((value) => value.rhythmId)) {
      await expect(
        result
          .locator('.ecg-strip-heading strong')
          .filter({ hasText: getEcgRhythm(stage.rhythmId!).label })
          .first()
      ).toBeVisible()
    }
    const stored = await sessionFor(page, story.id)
    expect(stored.complete).toBe(true)
    expect(stored.answers).toHaveLength(4)
    expect(stored.activeMs).toBeGreaterThanOrEqual(
      stored.answers.reduce((sum, answer) => sum + answer.elapsedMs, 0)
    )
    expect(stored.budgetMs).toBeNull()
    expect(stored.mode).toBe('untimed')
    await page.reload()
    // Reloading the initial ?case link offers the saved result without silently starting again.
    await page
      .getByRole('button', { name: 'Review saved result', exact: true })
      .click()
    await expect(
      page.getByRole('region', { name: 'Rapid Response result' })
    ).toContainText('100%')
  }
  const attempts = readAttempts(
    await page.evaluate((key) => localStorage.getItem(key), historyKey)
  ).filter((value) => value.kind === 'rapid-response')
  expect(attempts).toHaveLength(6)
  expect(
    attempts.every(
      (value) =>
        value.correct === 4 &&
        value.answered === 4 &&
        value.timing?.mode === 'untimed' &&
        value.timing.budgetMs === null
    )
  ).toBe(true)
  await page.goto('/progress')
  for (const story of rapidResponseCases) {
    const card = page.locator('.progress-result').filter({
      has: page.getByRole('heading', { name: story.title, exact: true }),
    })
    await expect(card).toContainText('100%')
    await expect(card).toContainText('Active time')
    await expect(card).toContainText(
      'Time is a practice reference, separate from accuracy.'
    )
  }
})

test('active timing excludes explicit pauses and leaving, with draft resume from Home and Progress', async ({
  page,
}) => {
  const story = rapidResponseCases[0]!
  await startCase(page, story)
  await chooseCorrect(page, story, 0)
  await expect
    .poll(async () => (await sessionFor(page, story.id)).activeMs)
    .toBeGreaterThanOrEqual(1000)
  await page.getByRole('button', { name: 'Pause case', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Case paused' })).toBeVisible()
  const paused = await sessionFor(page, story.id)
  await page.goto('/home')
  const homeResume = page
    .getByRole('region', { name: 'Your next learning activity' })
    .getByRole('link', { name: `Continue: ${story.title} →`, exact: true })
  await expect(homeResume).toHaveAttribute(
    'href',
    `/rapid-response?session=${encodeURIComponent(paused.id)}`
  )
  await homeResume.click()
  await expect(page.getByRole('region', { name: 'Case paused' })).toBeVisible()
  expect((await sessionFor(page, story.id)).activeMs).toBe(paused.activeMs)
  await page.getByRole('button', { name: 'Resume case', exact: true }).click()
  for (const id of story.stages[0]!.question.correct) {
    const option = story.stages[0]!.question.options.find(
      (value) => value.id === id
    )!
    await expect(
      page.getByRole(
        story.stages[0]!.question.correct.length === 1 ? 'radio' : 'checkbox',
        { name: option.text, exact: true }
      )
    ).toBeChecked()
  }
  await page
    .getByRole('button', { name: 'Save decision and continue', exact: true })
    .click()
  await page.getByRole('button', { name: 'Pause case', exact: true }).click()
  const secondPause = await sessionFor(page, story.id)
  await page.goto('/progress')
  await page
    .getByRole('link', { name: `Resume ${story.title} →`, exact: true })
    .click()
  await expect(page.getByRole('region', { name: 'Case paused' })).toBeVisible()
  const restored = await sessionFor(page, story.id)
  expect(restored.index).toBe(1)
  expect(restored.answers).toEqual(secondPause.answers)
  expect(restored.activeMs).toBe(secondPause.activeMs)
  await page.getByRole('button', { name: 'Resume case', exact: true }).click()
  for (let index = 1; index < story.stages.length; index++)
    await submitCorrect(page, story, index)
  await expect(
    page.getByRole('region', { name: 'Rapid Response result' })
  ).toContainText('100%')
})

test('a countdown expiry preserves the current draft and allows a full score after continuing', async ({
  page,
}) => {
  const story = rapidResponseCases[0]!
  const fixture = await seedExpiry(page, story, 'rapid-e2e-continue')
  const alert = page.getByRole('alert', { name: 'Practice time reached' })
  await expect(alert).toContainText('Time does not mark this case as failed')
  const expired = await sessionFor(page, story.id)
  expect(expired.complete).toBe(false)
  expect(expired.answers).toEqual([])
  expect(expired.selected).toEqual(fixture.selected)
  expect(expired.activeMs).toBe(fixture.budgetMs)
  await page
    .getByRole('button', { name: 'Continue without a time limit', exact: true })
    .click()
  await expect(
    page.getByRole('timer', { name: 'Active case time' })
  ).toContainText('Continued')
  for (const id of fixture.selected) {
    const option = story.stages[0]!.question.options.find(
      (value) => value.id === id
    )!
    await expect(
      page.getByRole(
        story.stages[0]!.question.correct.length === 1 ? 'radio' : 'checkbox',
        { name: option.text, exact: true }
      )
    ).toBeChecked()
  }
  await page
    .getByRole('button', { name: 'Save decision and continue', exact: true })
    .click()
  for (let index = 1; index < story.stages.length; index++)
    await submitCorrect(page, story, index)
  const result = page.getByRole('region', { name: 'Rapid Response result' })
  await expect(result).toContainText('100%')
  await expect(result).toContainText('No points were deducted for time.')
  const final = await sessionFor(page, story.id)
  expect(final.continuedAfterExpiry).toBe(true)
  expect(final.answers).toHaveLength(4)
  const attempts = readAttempts(
    await page.evaluate((key) => localStorage.getItem(key), historyKey)
  )
  expect(
    attempts.find((value) => value.id === fixture.id)?.timing
  ).toMatchObject({
    mode: 'challenge',
    budgetMs: fixture.budgetMs,
    exceededBudget: true,
  })
})

test('finishing at the time target scores only submitted decisions and lists remaining decisions as unanswered', async ({
  page,
}) => {
  const story = rapidResponseCases[0]!
  await seedExpiry(page, story, 'rapid-e2e-review-at-expiry', true)
  await page
    .getByRole('button', { name: 'Finish and review', exact: true })
    .click()
  const result = page.getByRole('region', { name: 'Rapid Response result' })
  await expect(result).toContainText('100%')
  await expect(result).toContainText('1 of 1 decisions correct')
  await expect(result).toContainText('3 unanswered decisions')
  await expect(
    result.locator('.feedback-result').filter({ hasText: /^Not answered$/ })
  ).toHaveCount(3)
  await expect(
    result.locator('.feedback-result').filter({ hasText: /^Incorrect$/ })
  ).toHaveCount(0)
  const final = await sessionFor(page, story.id)
  expect(final.complete).toBe(true)
  expect(final.answers).toHaveLength(1)
  expect(final.selected).toEqual([])
})

test('phone challenge is accessible, silent by default and resets optional sound when paused', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const story = rapidResponseCases[0]!
  await startCase(page, story, true)
  const enable = page.getByRole('button', {
    name: 'Enable quiet timing sound',
    exact: true,
  })
  await expect(enable).toHaveAttribute('aria-pressed', 'false')
  await expect(
    page.getByRole('timer', { name: 'Practice time remaining' })
  ).toHaveAttribute('aria-live', 'off')
  await accessible(page)
  await page.screenshot({
    path: '../rapid-response-390.png',
    fullPage: true,
    animations: 'disabled',
  })
  await enable.click()
  const disable = page.getByRole('button', {
    name: 'Turn timing sound off',
    exact: true,
  })
  const unavailable = page.getByRole('status').filter({
    hasText: 'Monitor sound is unavailable. The visual timer still works.',
  })
  await expect
    .poll(async () => (await disable.count()) + (await unavailable.count()))
    .toBe(1)
  if (await disable.count()) {
    await expect(disable).toHaveAttribute('aria-pressed', 'true')
    await expect(
      page.getByRole('slider', { name: 'Timing sound volume' })
    ).toHaveValue('0.05')
    await disable.click()
    await expect(enable).toHaveAttribute('aria-pressed', 'false')
    await enable.click()
    await expect(disable).toHaveAttribute('aria-pressed', 'true')
  } else await expect(unavailable).toBeVisible()
  await page.getByRole('button', { name: 'Pause case', exact: true }).click()
  await page.getByRole('button', { name: 'Resume case', exact: true }).click()
  await expect(enable).toHaveAttribute('aria-pressed', 'false')
  await page.reload()
  // Initial case navigation offers an explicitly paused saved attempt.
  await page
    .getByRole('button', { name: 'Open saved case', exact: true })
    .click()
  await page.getByRole('button', { name: 'Resume case', exact: true }).click()
  await expect(enable).toHaveAttribute('aria-pressed', 'false')
  expect(errors).toEqual([])
})

test('ECG library filters all 17 examples and preserves readable strip scrolling in light and dark phone layouts', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await page.goto('/ecg')
  await expect(page.getByRole('status')).toHaveText('17 of 17 examples')
  await expect(page.getByTestId('ecg-strip')).toHaveCount(17)
  await page.getByRole('searchbox', { name: 'Find a rhythm' }).fill('VT')
  await expect(
    page.getByRole('heading', {
      name: 'Monomorphic ventricular tachycardia',
      exact: true,
    })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: 'Pulseless ventricular tachycardia',
      exact: true,
    })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Sinus rhythm', exact: true })
  ).toHaveCount(0)
  await page.getByRole('searchbox', { name: 'Find a rhythm' }).fill('')
  await page.getByRole('button', { name: 'AV blocks', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('4 of 17 examples')
  await page.getByRole('searchbox', { name: 'Find a rhythm' }).fill('Mobitz II')
  await expect(page.getByRole('status')).toHaveText('1 of 17 examples')
  await expect(
    page.getByRole('heading', {
      name: 'Second-degree AV block · Mobitz II',
      exact: true,
    })
  ).toBeVisible()
  for (const theme of ['Light', 'Dark']) {
    await page.goto('/settings')
    await page.getByRole('radio', { name: theme, exact: true }).check()
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 950 })
      await page.goto('/ecg')
      await expect(page.getByRole('status')).toHaveText('17 of 17 examples')
      if (theme === 'Dark')
        await expect(page.locator('html')).toHaveClass(/dark/)
      else await expect(page.locator('html')).not.toHaveClass(/dark/)
      await accessible(page)
      await page
        .getByTestId('ecg-strip')
        .first()
        .getByRole('button', { name: 'Enlarge ECG strip', exact: true })
        .click()
      const strip = page.locator('.ecg-strip-scroll').first()
      const measurements = await strip.evaluate((node) => ({
        content: node.scrollWidth,
        viewport: node.clientWidth,
      }))
      expect(measurements.content).toBeGreaterThan(measurements.viewport)
      await expect(strip).toHaveAttribute('tabindex', '0')
      await strip.focus()
      await page.keyboard.press('ArrowRight')
      await expect
        .poll(() => strip.evaluate((node) => node.scrollLeft))
        .toBeGreaterThan(0)
    }
  }
  await page.setViewportSize({ width: 390, height: 950 })
  await page.getByRole('button', { name: 'AV blocks', exact: true }).click()
  await page.screenshot({
    path: '../ecg-library-390.png',
    fullPage: true,
    animations: 'disabled',
  })
})
