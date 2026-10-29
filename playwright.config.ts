import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'node apps/server/dist/index.js',
      url: 'http://localhost:3001/halsa',
      timeout: 20000,
      reuseExistingServer: false,
      env: {
        PORT: '3001',
        USE_FIXTURES: 'true',
      },
    },
    {
      command: 'npx vite preview --port 4173 --strictPort',
      cwd: './apps/web',
      url: 'http://localhost:4173',
      timeout: 20000,
      reuseExistingServer: false,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
