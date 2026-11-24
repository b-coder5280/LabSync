import { defineConfig } from '@playwright/test';
const executablePath = process.env.LABSYNC_CHROMIUM_PATH;
export default defineConfig({
  testDir: './tests', outputDir: './artifacts/test-results',
  reporter: 'list', use: { baseURL: 'http://localhost:3100', channel: executablePath ? undefined : 'msedge', headless: true,
    launchOptions: executablePath ? { executablePath } : undefined },
});
