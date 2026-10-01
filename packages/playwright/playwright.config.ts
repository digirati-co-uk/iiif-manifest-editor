import { defineConfig, devices } from "@playwright/test";

const urls = {
  local: "http://localhost:3000",
  watch: "http://localhost:3000",
  dev: "https://manifest-editor-preview.digirati.workers.dev/",
  prod: "https://manifest-editor.digirati.services/",
};
const target = process.env.E2E_TARGET || "local";
if (!Object.hasOwn(urls, target)) {
  throw new Error(`Unknown E2E_TARGET: ${target}`);
}
const baseURL = urls[target as keyof typeof urls];

export default defineConfig({
  testDir: "./src/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer:
    target === "local"
      ? {
          command:
            "pnpm -w exec turbo build --filter='web^...' && pnpm --filter web build && pnpm --filter web start --port 3000 --hostname localhost",
          url: baseURL,
          env: { NEXT_DIST_DIR: ".next-e2e" },
          reuseExistingServer: false,
          timeout: 300_000,
          stdout: "pipe",
          gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
        }
      : undefined,
});
