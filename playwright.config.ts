import { defineConfig, devices } from "@playwright/test";
import assert from "node:assert/strict";
const deployment = process.env.DEPLOYMENT_URL;
if (deployment) {
  const url = new URL(deployment);
  assert.equal(url.protocol, "https:");
  assert.equal(url.pathname, "/");
  assert.ok(!url.username && !url.password && !url.search && !url.hash);
  assert.match(process.env.EXPECTED_COMMIT_SHA || "", /^[a-f0-9]{40}$/u);
  assert.ok(process.env.EXPECTED_BRANCH?.trim());
  assert.ok(["production", "preview"].includes(process.env.DEPLOYMENT_MODE || ""));
}
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  timeout: 30000,
  expect: { timeout: 6000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: deployment || "http://127.0.0.1:4178",
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
  webServer: deployment
    ? undefined
    : {
        command: "npm run preview -- --port 4178",
        url: "http://127.0.0.1:4178",
        reuseExistingServer: false,
        timeout: 15000,
      },
});
