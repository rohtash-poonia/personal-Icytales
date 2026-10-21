import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "node ../backend/tests/e2eServer.js",
      url: "http://127.0.0.1:5099/api/health",
      timeout: 60_000,
      reuseExistingServer: false,
      env: { PORT: "5099" },
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100",
      timeout: 120_000,
      reuseExistingServer: false,
      env: { ICYTALES_E2E: "1", API_PROXY_URL: "http://127.0.0.1:5099", NEXT_PUBLIC_API_URL: "" },
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
