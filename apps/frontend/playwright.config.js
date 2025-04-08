import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './end_to_end',
  timeout: 30000,
  retries: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    headless: true,
    viewport: { width: 1512, height: 982 },
    actionTimeout: 2000,
    ignoreHTTPSErrors: true,
    video: 'on-first-retry',
  },
  projects: [
    { name: 'Chromium', use: { browserName: 'chromium' } },
    { name: 'Firefox', use: { browserName: 'firefox' } },
    { name: 'WebKit', use: { browserName: 'webkit' } },
  ],
});
