import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  timeout: 30000,
  expect: { timeout: 6000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4178",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1488, height: 1058 } },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], viewport: { width: 1488, height: 1058 } },
    },
  ],
  webServer: {
    command: "npm run preview -- --port 4178",
    url: "http://127.0.0.1:4178",
    reuseExistingServer: false,
    timeout: 15000,
  },
});
