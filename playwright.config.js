import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    headless: true,  // run without showing browser
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [['html', { open: 'never' }]],
  webServer: {
  command: 'npx live-server ./ --port=5500',
  port: 5500,
  reuseExistingServer: true,
},
});

