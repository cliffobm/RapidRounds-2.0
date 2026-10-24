import { defineConfig, devices } from '@playwright/test'

// This is deliberately separate from the offline learning suite. It verifies
// that the review entry point stays closed even when Auth is not configured.
// A real account/password is never stored in browser tests or source control.
export default defineConfig({
  testDir: './e2e',
  testMatch: ['tester-access.spec.ts'],
  workers: 1,
  reporter: 'list',
  outputDir: 'tester-test-results',
  use: { baseURL: 'http://localhost:3101', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.CI ? 'chrome' : 'msedge',
      },
    },
  ],
  webServer: {
    command: 'npx next start -p 3101',
    url: 'http://localhost:3101/tester-login',
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      RR_REQUIRE_TESTER_LOGIN: 'true',
      NEXT_PUBLIC_REVIEW_AUTH_ONLY: 'true',
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
    },
  },
})
