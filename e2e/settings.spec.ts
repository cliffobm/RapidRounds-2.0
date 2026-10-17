import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

for (const width of [320, 390, 1440]) {
  test(`landing and saved preferences work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Decide better.'
    )
    await page
      .getByRole('button', { name: 'Play original introduction' })
      .click()
    await expect(page.locator('video')).toBeVisible()
    await expect
      .poll(() =>
        page
          .locator('video')
          .evaluate((video: HTMLVideoElement) => video.readyState)
      )
      .toBeGreaterThanOrEqual(2)
    await page.getByRole('button', { name: 'Stop introduction' }).click()
    await expect(page.locator('video')).toHaveCount(0)
    await page.screenshot({
      path: `../settings-landing-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    })
    await page.getByRole('link', { name: 'Enter Rapid Rounds' }).click()
    await expect(page).toHaveURL(/\/home$/)
    await page.getByRole('link', { name: 'Settings', exact: true }).click()
    await expect(
      page.getByText('Changes save automatically on this device.')
    ).toBeVisible()
    await page.getByLabel('Preferred name').fill('Alex')
    await page.getByLabel('Discipline or role').fill('RN')
    await page.getByLabel('Unit or specialty').fill('Cardiac ICU')
    await page
      .getByLabel('My learning goal')
      .fill('Recognize deterioration earlier')
    await page.getByRole('radio', { name: 'Dark', exact: true }).check()
    await page.getByLabel('Text size').selectOption('larger')
    await page.getByRole('checkbox', { name: /Increase contrast/ }).check()
    await page.getByRole('checkbox', { name: /Reduce motion/ }).check()
    await page.getByLabel('Sessions per week').selectOption('4')
    await page.getByLabel('Time per session').selectOption('15')
    await page.getByLabel('Remind me to').selectOption('practice')
    await page.getByLabel('Local time').fill('08:30')
    await page
      .getByRole('combobox', { name: 'Repeat', exact: true })
      .selectOption('weekly')
    await page
      .getByRole('combobox', { name: 'Day', exact: true })
      .selectOption('2')
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export calendar reminder' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('rapidrounds-reminder.ics')
    const calendar = await readFile((await download.path())!, 'utf8')
    expect(calendar).toContain('RRULE:FREQ=WEEKLY;BYDAY=TU')
    expect(calendar).toContain('T083000')
    expect(calendar).toContain('SUMMARY:Rapid Rounds practice')
    expect(calendar).toContain('DURATION:PT15M')
    expect(calendar).not.toContain('Alex')
    await page.reload()
    await expect(page.getByLabel('Preferred name')).toHaveValue('Alex')
    await expect(page.getByLabel('Unit or specialty')).toHaveValue(
      'Cardiac ICU'
    )
    await expect(page.locator('html')).toHaveAttribute('data-rr-text', 'larger')
    await expect(page.locator('html')).toHaveAttribute('data-rr-motion', 'true')
    await expect(page.locator('html')).toHaveClass(/dark/)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    await page.screenshot({
      path: `../settings-preferences-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    })
    await page.goto('/home')
    await expect(page.getByText('Make this moment yours, Alex.')).toBeVisible()
    await expect(
      page.getByText('Recognize deterioration earlier')
    ).toBeVisible()
    await page.goto('/')
    await expect(
      page.getByText('Still logo · reduced motion enabled')
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Play original introduction' })
    ).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('system appearance, OS reduced motion, accessibility and privacy boundaries', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  await page.goto('/settings')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await page.getByRole('radio', { name: 'Dark', exact: true }).check()
  await page.getByRole('checkbox', { name: /Increase contrast/ }).check()
  await page.getByLabel('Text size').selectOption('larger')
  for (const route of ['/settings', '/', '/home', '/quiz?bank=acute_mi']) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
    const violations = await page.evaluate(async () => {
      const results = await (window as any).axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      })
      return results.violations.map((entry: any) => ({
        id: entry.id,
        nodes: entry.nodes.map((node: any) => node.target),
      }))
    })
    expect(violations).toEqual([])
  }
  expect((await page.request.get('/profile')).status()).toBe(503)
  expect((await page.request.get('/admin')).status()).toBe(503)
})
