import { test, expect } from '@playwright/test'
import tavr from '../cjis/preview/tavr_case_family.json'

async function assertStudyHeadingContrast(
  page: import('@playwright/test').Page
) {
  const headings = page
    .getByRole('region', { name: 'All Study Materials' })
    .locator('h3')
  await expect(headings).toHaveCount(4)
  const pairs = await headings.evaluateAll((elements) =>
    elements.map((element) => {
      const fg = getComputedStyle(element).color
      let current: Element | null = element
      let bg = ''
      while (current) {
        const value = getComputedStyle(current).backgroundColor
        if (value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
          bg = value
          break
        }
        current = current.parentElement
      }
      const luminance = (value: string) => {
        const rgb = value
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((n) => n / 255)
          .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4))
        return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722
      }
      const a = luminance(fg),
        b = luminance(bg)
      return {
        title: element.textContent,
        contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        truncated: element.scrollWidth > element.clientWidth,
      }
    })
  )
  for (const pair of pairs) {
    expect(pair.contrast, pair.title!).toBeGreaterThanOrEqual(4.5)
    expect(pair.truncated, pair.title!).toBe(false)
  }
}

test('study headings remain readable through dark/light switches and refresh', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
  await page.goto('/study')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await assertStudyHeadingContrast(page)
  for (const dark of [false, true, false]) {
    await page.getByRole('button', { name: 'Toggle dark mode' }).click()
    await expect(
      page.getByRole('button', { name: 'Toggle dark mode' })
    ).toHaveAttribute('aria-pressed', String(dark))
    await expect
      .poll(() =>
        page.evaluate(
          () => getComputedStyle(document.documentElement).colorScheme
        )
      )
      .toBe(dark ? 'dark' : 'light')
    // Wait for existing color transitions before checking the final contrast.
    await expect
      .poll(async () => {
        const color = await page
          .getByRole('region', { name: 'All Study Materials' })
          .locator('h3')
          .first()
          .evaluate((e) => getComputedStyle(e).color)
        return color
      })
      .toBe(dark ? 'rgb(239, 248, 251)' : 'rgb(8, 18, 31)')
    await assertStudyHeadingContrast(page)
  }
  // Clear the init script in a new page so it cannot overwrite the saved choice.
  const next = await page.context().newPage()
  await next.goto('/study')
  // The context init script is not used: addInitScript above belongs to the first page.
  await expect(next.locator('html')).not.toHaveClass(/dark/)
  await assertStudyHeadingContrast(next)
  expect(
    await next.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(next.viewportSize()!.width)
  await next.close()
})

test('every RR card opens a usable case without the question-bank service', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/rest/v1/rpc/get_scenario_questions**', (route) =>
    route.abort()
  )
  await page.goto('/rr')
  const links = page.getByRole('main').getByRole('link', { name: /^Start / })
  await expect(links).toHaveCount(6)
  const hrefs = await links.evaluateAll((items) =>
    items.map((item) => item.getAttribute('href')!)
  )
  for (const href of hrefs) {
    const response = await page.goto(href)
    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole('region', { name: 'Case decision' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Submit Answer' })
    ).toBeDisabled()
    await expect(
      page.getByText(/Question bank unavailable|No questions available/)
    ).toHaveCount(0)
    await page.getByRole('link', { name: 'Back to RR Scenarios' }).click()
    await expect(page).toHaveURL(/\/rr$/)
  }
  expect(errors).toEqual([])
})

test('guided v3 case supports definitions, completes all decisions, and resets', async ({
  page,
}) => {
  await page.goto('/rr/tavr-conduction')
  await page.getByText('TAVR', { exact: true }).click()
  await expect(
    page.getByText(/^Transcatheter aortic valve replacement:/)
  ).toBeVisible()
  for (const [i, question] of tavr.questions.entries()) {
    const option = question.options.find(
      (o) => o.id === question.correct_option_id
    )!
    await page
      .getByRole('region', { name: 'Case decision' })
      .getByRole('button', { name: option.text, exact: true })
      .click()
    await page
      .getByRole('button', { name: 'Submit Answer', exact: true })
      .click()
    await expect(
      page.getByRole('heading', { name: 'What changed', exact: true })
    ).toBeVisible()
    await page
      .getByRole('button', {
        name: i === 4 ? 'View practice summary' : 'Next decision',
        exact: true,
      })
      .click()
  }
  await expect(page.getByText('5 / 5', { exact: true })).toBeVisible()
  await expect(page.getByText('1', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Practice again' }).click()
  await expect(
    page.getByRole('heading', { name: 'Decision 1 of 5' })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Submit Answer' })
  ).toBeDisabled()
})

test('home restores branding and supports reduced motion without blocking navigation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByTestId('brand-intro')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Replay logo intro' })
  ).toBeHidden()
  await page.getByRole('link', { name: 'Start a round', exact: true }).click()
  await expect(page).toHaveURL(/\/rr$/)
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'RR Scenarios' })
  ).toHaveAttribute('aria-current', 'page')
  expect(errors).toEqual([])
})
