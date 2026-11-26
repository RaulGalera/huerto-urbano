const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    ...devices['Pixel 7'],
  },
  webServer: {
    command: 'node e2e/servidor.js',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
