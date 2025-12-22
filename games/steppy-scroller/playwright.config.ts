import { defineConfig } from 'playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173';
const isLocal = baseURL.includes('127.0.0.1') || baseURL.includes('localhost');
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  use: {
    baseURL,
    ...(executablePath ? { executablePath } : {})
  },
  projects: [
    {
      name: 'baseline-420x900',
      use: { viewport: { width: 420, height: 900 } }
    },
    {
      name: 'mobile-360x800',
      use: { viewport: { width: 360, height: 800 } }
    },
    {
      name: 'mobile-390x844',
      use: { viewport: { width: 390, height: 844 } }
    },
    {
      name: 'mobile-412x915',
      use: { viewport: { width: 412, height: 915 } }
    },
    {
      name: 'desktop-1920x1080',
      use: { viewport: { width: 1920, height: 1080 } }
    }
  ],
  webServer: isLocal
    ? {
        command: 'npm run dev -- --host 127.0.0.1 --port 4173',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: true,
        timeout: 30000
      }
    : undefined
});
