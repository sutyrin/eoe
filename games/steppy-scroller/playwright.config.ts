import { defineConfig } from 'playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173';
const isLocal = baseURL.includes('127.0.0.1') || baseURL.includes('localhost');

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL,
    viewport: { width: 420, height: 900 }
  },
  webServer: isLocal
    ? {
        command: 'npm run dev -- --host 127.0.0.1 --port 4173',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: true,
        timeout: 30000
      }
    : undefined
});
