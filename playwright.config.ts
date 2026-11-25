import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3210",
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "node scripts/reset-test-db.mjs && npm run build && npm run start -- --port 3210",
    url: "http://127.0.0.1:3210",
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      STURDY_DB_PATH: ".data/test-sturdy.db",
      ADMIN_EMAIL: "admin@test.local",
      ADMIN_PASSWORD: "test-password-123",
      SESSION_COOKIE_SECURE: "false",
    },
  },
});
