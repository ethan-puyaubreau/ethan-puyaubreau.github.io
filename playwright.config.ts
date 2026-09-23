import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const BASE = `http://localhost:${PORT}`;

// Smoke tests run against the built site. The webServer builds then previews;
// locally an already-running preview is reused.
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run preview",
    // Build with CI-shaped stamps so the footer is as wide as it is in production.
    env: {
      PUBLIC_BUILD_SHA: "0123456789abcdef0123456789abcdef01234567",
      PUBLIC_BUILD_TIME: "2026-09-21T18:42:07+02:00",
    },
    url: BASE,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
