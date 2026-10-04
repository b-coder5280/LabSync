import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', outputDir: './artifacts/test-results',
  reporter: 'list', use: { baseURL: 'http://localhost:3100', channel: 'msedge', headless: true },
});
