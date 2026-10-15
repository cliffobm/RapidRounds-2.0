import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: ['auth.browser.ts', 'profile.browser.ts'],
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || 'test-results/auth-regression',
  workers: 1,
  reporter: 'line',
  use: { baseURL: 'http://127.0.0.1:3000', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: [
    { command: 'node e2e/fixtures/profile-api.mjs', url: 'http://127.0.0.1:54321/health', reuseExistingServer: false },
    { command: process.env.PLAYWRIGHT_AUTH_SERVER_COMMAND || 'npm run start -- --hostname 127.0.0.1', url: 'http://127.0.0.1:3000', reuseExistingServer: false, env: { NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3000' } },
  ],
})
