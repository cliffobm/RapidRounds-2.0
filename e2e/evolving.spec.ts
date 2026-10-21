import { test, expect } from '@playwright/test'
import {
  evolvingCases,
  reasoningQuestions,
} from '../lib/learning/evolving-content'
import { questionFor } from '../lib/learning/evolving-types'
for (const story of evolvingCases) {
  test(`evolving case completes and offers a distinct replay: ${story.id}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 950 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`/evolving/${story.id}`)
    await page.getByRole('button', { name: 'Start this case' }).click()
    for (const [index, frame] of story.paths[0]!.frames.entries()) {
      await page
        .getByRole('radio', {
          name: frame.question.options[0]!.text,
          exact: true,
        })
        .check()
      await page.getByRole('button', { name: 'Commit decision' }).click()
      await expect(page.getByRole('status')).toContainText(
        frame.question.options[0]!.explanation
      )
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
      await page
        .getByRole('button', {
          name: index === 5 ? 'Open the debrief' : 'Next clinical checkpoint',
        })
        .click()
    }
    await expect(
      page.getByRole('heading', { name: 'Debrief the decisions' })
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Try the next authored version' })
      .click()
    await expect(
      page.getByText(story.paths[1]!.patient, { exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('group', {
        name: story.paths[1]!.frames[0]!.question.prompt,
      })
    ).toBeVisible()
    expect(errors).toEqual([])
  })
}
test('return handoffs preserve a saved draft or advance exactly one checkpoint by choice', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 })
  await page.goto('/evolving/fever-neuro')
  await page
    .getByRole('checkbox', {
      name: 'Offer a new handoff after 30 minutes away',
    })
    .check()
  await page.getByRole('button', { name: 'Start this case' }).click()
  const choice = page.getByRole('radio').first()
  await choice.check()
  const label = await choice.getAttribute('value')
  await page.goto('/home')
  const age = async () =>
    page.evaluate(() => {
      const key = 'rapidrounds-evolving-v1:fever-neuro'
      const saved = JSON.parse(localStorage.getItem(key)!)
      saved.lastSeen = Date.now() - 31 * 60 * 1000
      localStorage.setItem(key, JSON.stringify(saved))
    })
  await age()
  await page.goto('/evolving/fever-neuro')
  await expect(
    page.getByRole('heading', { name: 'A new fictional handoff is available' })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Resume my saved moment' }).click()
  await expect(page.getByRole('radio').first()).toBeChecked()
  await expect(page.locator('.scenario-chart tbody tr')).toHaveCount(1)
  await page.goto('/home')
  await age()
  await page.goto('/evolving/fever-neuro')
  await page.getByRole('button', { name: 'Accept the next handoff' }).click()
  await expect(page.locator('.scenario-chart tbody tr')).toHaveCount(2)
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('rapidrounds-evolving-v1:fever-neuro')!)
  )
  expect(saved.index).toBe(1)
  expect(saved.answers[0]).toMatchObject({ skipped: true, selected: [] })
  expect(saved.selected).toEqual([])
})
test('advanced cases keep draft rationale on reload and delay coaching until debrief', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 950 })
  const story = evolvingCases[1]!
  await page.goto(`/evolving/${story.id}`)
  await page.getByRole('button', { name: 'Advanced', exact: true }).click()
  await page
    .getByRole('checkbox', {
      name: 'Offer a new handoff after 30 minutes away',
    })
    .check()
  await page.getByRole('button', { name: 'Start this case' }).click()
  for (const [index, frame] of story.paths[0]!.frames.entries()) {
    const question = questionFor(frame, 'advanced')
    for (const id of question.correct)
      await page
        .getByRole('checkbox', {
          name: question.options.find((o) => o.id === id)!.text,
          exact: true,
        })
        .check()
    await page
      .getByRole('textbox')
      .fill(
        'I prioritize the current change, compare an alternative cause and reassess evidence that could change the plan.'
      )
    if (index === 0) {
      await page.reload()
      await expect(page.getByRole('textbox')).toHaveValue(/I prioritize/)
    }
    await page.getByRole('button', { name: 'Commit decision' }).click()
    await expect(page.getByRole('status')).toContainText(
      'Feedback will appear in the debrief'
    )
    await expect(
      page.getByText(question.options[0]!.explanation, { exact: true })
    ).toHaveCount(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    await page
      .getByRole('button', {
        name: index === 5 ? 'Open the debrief' : 'Next clinical checkpoint',
      })
      .click()
  }
  await expect(
    page.getByRole('heading', { name: 'Debrief the decisions' })
  ).toBeVisible()
  await page
    .getByText('Decision 1 · Unassisted in-app response', { exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Advanced', exact: true })
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('checkbox', {
      name: 'Offer a new handoff after 30 minutes away',
    })
  ).toBeChecked()
  await expect(
    page.getByText(story.paths[0]!.frames[0]!.complex.options[0]!.explanation, {
      exact: true,
    })
  ).toBeVisible()
})
test('focus interface streamlines entry and a ten-question check saves progress without answer leaks', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 950 })
  await page.goto('/settings')
  await page
    .getByRole('radio', { name: 'Focus interface', exact: true })
    .check()
  await page.getByRole('radio', { name: 'Dark', exact: true }).check()
  await page.getByLabel('Default reasoning level').selectOption('advanced')
  await page.goto('/home')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Your learning', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Think clearly. Act with purpose.',
    })
  ).toBeHidden()
  await page
    .getByRole('link', { name: '10-question check', exact: true })
    .click()
  await page.getByRole('button', { name: 'Start 10-question check' }).click()
  for (let index = 0; index < 10; index++) {
    const ids = await page.evaluate(
      () => JSON.parse(localStorage.getItem('rapidrounds-quick-v1:10:')!).ids
    )
    const item = reasoningQuestions.find((q) => q.id === ids[index])!
    await page
      .getByRole('radio', { name: item.options[0]!.text, exact: true })
      .check()
    if (index === 3) {
      await page.reload()
      await expect(
        page.getByRole('radio', { name: item.options[0]!.text, exact: true })
      ).toBeChecked()
    }
    await expect(
      page.getByText(item.options[0]!.explanation, { exact: true })
    ).toHaveCount(0)
    await page
      .getByRole('button', {
        name: index === 9 ? 'Submit check' : 'Save and continue',
      })
      .click()
  }
  await expect(page.getByText(/10 of 10 choices matched/)).toBeVisible()
  await page.goto('/rr')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Case room', exact: true })
  ).toBeVisible()
  await page.screenshot({
    path: '../evolving-focus-library-390.png',
    fullPage: true,
    animations: 'disabled',
  })
  await page.goto('/evolving/skin-systemic')
  await page.getByRole('button', { name: 'Start this case' }).click()
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
  await page
    .getByRole('region', { name: 'Observation trend', exact: true })
    .focus()
  await page
    .getByRole('region', { name: 'Observation trend', exact: true })
    .press('ArrowRight')
  await expect
    .poll(() =>
      page
        .getByRole('region', { name: 'Observation trend', exact: true })
        .evaluate((element) => element.scrollLeft)
    )
    .toBeGreaterThan(0)
  await page.screenshot({
    path: '../evolving-case-390.png',
    fullPage: true,
    animations: 'disabled',
  })
})
