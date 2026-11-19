import { defineConfig, devices } from '@playwright/test';

// The web build is served from web-demo/ on :8099 by tests/serve-web.mjs.
export default defineConfig({
  webServer: {
    command: 'node tests/serve-web.mjs',
    url: 'http://localhost:8099/demo.html',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  workers: 2,
  expect: { timeout: 20_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8099',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-phone', use: { ...devices['iPhone 14'], browserName: 'chromium' } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
  ],
});
