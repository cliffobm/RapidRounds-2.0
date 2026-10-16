import { test, expect } from '@playwright/test'
import { guidedCases } from '../lib/learning/cases'
import { studyUnits } from '../lib/learning/study'

for (const width of [390, 1440]) {
  test(`redesigned learning flows work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 })
    const errors: string[] = []
    const external: string[] = []
    page.on('pageerror', error => errors.push(page.url() + ": " + error.message))
    await page.route('**/*', route => {
      const url = new URL(route.request().url())
      if (!['localhost', '127.0.0.1'].includes(url.hostname)) {
        external.push(url.hostname); return route.abort()
      }
      return route.continue()
    })
    for (const [route, name] of [['/', 'home'], ['/quiz', 'practice'], ['/rr', 'rounds'], ['/study', 'study'], ['/test', 'explore']]) {
      await page.goto(route!)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByRole('img', { name: 'Rapid Rounds metallic RR logo' }).first()).toBeVisible()
      await page.screenshot({ path: `../redesign-${name}-${width}.png`, fullPage: true, animations: 'disabled' })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    }
    await page.goto('/quiz')
    await expect(page.getByRole('combobox')).toHaveCount(0)
    await page.getByRole('button', { name: /Acute coronary syndromes/ }).click()
    await expect(page.getByRole('button', { name: 'Check answer' })).toBeDisabled()
    await page.getByRole('radio').nth(1).check()
    await page.getByRole('button', { name: 'Check answer' }).click()
    await expect(page.getByRole('status')).toContainText('You connected the dots.')
    await page.screenshot({ path: `../redesign-feedback-${width}.png`, fullPage: true, animations: 'disabled' })
    await page.getByRole('button', { name: 'Finish round' }).click()
    await expect(page.getByText('1 correct · 1 answered · 0 skipped')).toBeVisible()
    await page.goto('/quiz?bank=vascular_disease_core')
    await expect(page.getByText('Question 1 of 5')).toBeVisible()
    await page.getByRole('button', { name: 'Skip this question' }).click()
    await expect(page.getByText('Question 2 of 5')).toBeVisible()
    const story = guidedCases[1]!
    await page.goto(`/rr/${story.id}`)
    await page.screenshot({ path: `../redesign-patient-${width}.png`, fullPage: true, animations: 'disabled' })
    for (const [index, step] of story.stages.entries()) {
      await expect(page.getByText(`Decision ${index + 1} of 6`)).toBeVisible()
      await page.getByRole('radio').nth(step.correct).check()
      await page.getByRole('button', { name: 'Check answer' }).click()
      await expect(page.getByRole('status')).toContainText(step.rationale)
      await page.getByRole('button', { name: index === 5 ? 'See your debrief' : 'Continue the story' }).click()
    }
    await expect(page.getByText(/6 of 6 decisions matched/)).toBeVisible()
    await page.goto('/study?pillar=recognize_cues')
    const unit = studyUnits[0]!
    await page.getByRole('radio').nth(1).check()
    await page.getByRole('button', { name: 'Check answer' }).click()
    await page.getByRole('button', { name: 'Explore the lesson' }).click()
    await expect(page.getByRole('heading', { name: 'Start with a baseline' })).toBeVisible()
    await page.getByRole('button', { name: 'Apply what you explored' }).click()
    await page.getByRole('radio').nth(unit.post.correct).check()
    await page.getByRole('button', { name: 'Check answer' }).click()
    await page.getByRole('button', { name: 'See your learning snapshot' }).click()
    await page.screenshot({ path: `../redesign-learning-snapshot-${width}.png`, fullPage: true, animations: 'disabled' })
    await page.goto('/study')
    await expect(page.getByText('/ 6 units explored').filter({ visible: true })).toBeVisible()
    const records = await page.evaluate(() => JSON.parse(localStorage.getItem('rapidrounds-study-v1') ?? '[]'))
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({ preCorrect: false, postCorrect: true })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect(await page.locator('.rr-original-logo').first().evaluate(element => getComputedStyle(element).animationName)).toBe('none')
    expect(errors).toEqual([])
    expect(external).toEqual([])
  })
}

test('narrow-screen layouts and dark theme remain accessible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  for (const route of ['/', '/quiz', '/rr', '/study', '/test', '/rr/sepsis']) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Use dark theme' }).click()
  await expect(page.getByRole('button', { name: 'Use light theme' })).toBeVisible()
  for (const route of ['/', '/quiz', '/rr/sepsis', '/study']) {
    await page.goto(route)
    await expect(page.getByRole('button', { name: 'Use light theme' })).toBeVisible()
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
    const violations = await page.evaluate(async () => {
      const results = await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
      return results.violations.map((entry: any) => ({ id: entry.id, nodes: entry.nodes.map((node: any) => node.target) }))
    })
    expect(violations).toEqual([])
    if (route === '/') await page.screenshot({ path: '../redesign-home-dark-390.png', fullPage: true, animations: 'disabled' })
  }
})
