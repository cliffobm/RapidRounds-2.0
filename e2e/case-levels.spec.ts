import { expect, test } from '@playwright/test'
import { evolvingCases } from '../lib/learning/evolving-content'
import {
  evolvingRevision,
  legacyEvolvingRevision,
  questionFor,
} from '../lib/learning/evolving-types'
import { newCaseSession } from '../lib/learning/evolving-session'

for (const id of [
  'skin-systemic',
  'abdomen-turn',
  'medication-shift',
  'kidney-trend',
])
  for (const level of ['challenge', 'advanced'] as const) {
    test(`${id} ${level} uses distinct clinical questions on both patient paths`, async ({
      page,
    }) => {
      const story = evolvingCases.find((story) => story.id === id)!
      await page.setViewportSize({ width: 390, height: 950 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(`/evolving/${id}`)
      await page
        .getByRole('button', {
          name: level === 'challenge' ? 'Challenge' : 'Advanced',
          exact: true,
        })
        .click()
      await page
        .getByRole('button', { name: 'Start case', exact: true })
        .click()
      for (const [pathIndex, path] of story.paths.entries()) {
        for (const [index, frame] of path.frames.entries()) {
          const question = questionFor(frame, level)
          await expect(
            page.getByRole('group', { name: question.prompt, exact: true })
          ).toBeVisible()
          await expect(
            page.getByText(frame.question.prompt, { exact: true })
          ).toHaveCount(0)
          await expect(
            page.getByText(frame.complex.prompt, { exact: true })
          ).toHaveCount(0)
          for (const id of question.correct)
            await page
              .getByRole(question.correct.length === 1 ? 'radio' : 'checkbox', {
                name: question.options.find((option) => option.id === id)!.text,
                exact: true,
              })
              .check()
          if (level === 'advanced')
            await page
              .getByRole('textbox')
              .fill(
                'I would compare the new clinical findings with baseline, weigh competing causes and reassess the response to the prioritized plan.'
              )
          if (pathIndex === 0 && index === 1) {
            await page.reload()
            for (const id of question.correct)
              await expect(
                page.getByRole(
                  question.correct.length === 1 ? 'radio' : 'checkbox',
                  {
                    name: question.options.find((option) => option.id === id)!
                      .text,
                    exact: true,
                  }
                )
              ).toBeChecked()
          }
          await page
            .getByRole('button', { name: 'Submit answer', exact: true })
            .click()
          if (level === 'advanced')
            await expect(
              page.getByText(question.options[0]!.explanation, { exact: true })
            ).toHaveCount(0)
          else
            await expect(page.getByRole('status')).toContainText(
              question.options.find(
                (option) => option.id === question.correct[0]
              )!.explanation
            )
          await page
            .getByRole('button', {
              name: index === 5 ? 'View results' : 'Next decision',
              exact: true,
            })
            .click()
        }
        await expect(
          page.getByRole('region', { name: 'Practice result', exact: true })
        ).toContainText('100%')
        if (pathIndex === 0)
          await page
            .getByRole('button', { name: 'Try another version', exact: true })
            .click()
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    })
  }

test('an earlier Advanced attempt keeps its score and explicitly starts updated questions', async ({
  page,
}) => {
  const story = evolvingCases.find((story) => story.id === 'skin-systemic')!
  const saved = {
    ...newCaseSession(story, 'advanced', 'pause'),
    revision: legacyEvolvingRevision,
    index: 5,
    complete: true,
    answers: story.paths[0]!.frames.map((frame) => ({
      selected: [...frame.complex.correct],
      rationale: '',
      confidence: 'unsure',
      assisted: false,
      skipped: false,
    })),
  }
  await page.addInitScript(
    ({ saved }) =>
      localStorage.setItem(
        'rapidrounds-evolving-v1:skin-systemic',
        JSON.stringify(saved)
      ),
    { saved }
  )
  await page.goto('/evolving/skin-systemic')
  await expect(
    page.getByRole('region', { name: 'Practice result' })
  ).toContainText('100%')
  await page
    .getByRole('button', { name: 'Start updated case', exact: true })
    .click()
  await expect(
    page.getByRole('group', {
      name: story.paths[0]!.frames[0]!.advanced.prompt,
      exact: true,
    })
  ).toBeVisible()
  const current = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('rapidrounds-evolving-v1:skin-systemic')!)
  )
  expect(current.revision).toBe(evolvingRevision)
  const archive = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem('rapidrounds-evolving-archive:skin-systemic')!
    )
  )
  expect(archive[0].revision).toBe(legacyEvolvingRevision)
})

test('unconfigured login is explicit and account URLs require a session', async ({
  page,
}) => {
  await page.goto('/auth/sign-in')
  await expect(
    page.getByRole('heading', { name: 'Tester sign in', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Sign in', exact: true })
  ).toBeDisabled()
  await expect(
    page.getByRole('link', { name: /Continue reviewing without signing in/ })
  ).toBeVisible()
  await page.goto('/account')
  await expect(page).toHaveURL(/\/auth\/sign-in/)
  await page.goto('/auth/callback?code=not-real')
  await expect(page).toHaveURL(/status=callback-error/)
})
