import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs/promises'
import { materialStudyTopics } from '../lib/learning/material-study'
import { materialCollections } from '../lib/learning/material-questions'
import { practiceLibrary } from '../lib/learning/practice-library'
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
test('colleague review guide supports phone layouts, dark accessibility and a real feedback download', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/settings')
  await page.getByRole('radio', { name: 'Dark', exact: true }).check()
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 950 })
    await page.goto('/review-guide')
    await expect(
      page.getByRole('heading', { name: 'Help shape RapidRounds.' })
    ).toBeVisible()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await accessible(page)
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
