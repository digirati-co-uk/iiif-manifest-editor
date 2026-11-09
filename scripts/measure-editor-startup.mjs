/** Measure an already-running local app. Never builds packages or starts/stops a server. */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

const require = createRequire(new URL("../packages/playwright/package.json", import.meta.url));
const { chromium } = require("@playwright/test");
const baseURL = process.argv[2] || "http://localhost:3000";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname), "Use a local measurement server");
const output = process.argv[3] || "test-results/editor-startup.json";
const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  // Keep external analytics and example thumbnails out of the local startup measurement.
  await context.route("**/*", (route) =>
    new URL(route.request().url()).origin === new URL(baseURL).origin ? route.continue() : route.abort()
  );
  await context.addInitScript(() => {
    window.__startupTasks = [];
    new PerformanceObserver((list) => {
      window.__startupTasks.push(...list.getEntries().map(({ startTime, duration }) => ({ startTime, duration })));
    }).observe({ type: "longtask", buffered: true });
  });
  const page = await context.newPage();
  const network = process.env.PERF_NETWORK || "local";
  assert.ok(["local", "slow4g"].includes(network), "PERF_NETWORK must be local or slow4g");
  if (network === "slow4g") {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 1_600_000 / 8,
      uploadThroughput: 750_000 / 8,
    });
  }
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const scripts = new Map();
  const downloads = [];
  page.on("response", (response) => {
    if (response.request().resourceType() === "script" && response.ok()) {
      downloads.push(response.body().then((body) => scripts.set(response.url(), body.length)));
    }
  });
  async function checkpoint() {
    await Promise.all(downloads);
    const performance = await page.evaluate(() => ({
      navigation: performance.getEntriesByType("navigation").map((entry) => ({
        ttfb: entry.responseStart,
        domContentLoaded: entry.domContentLoadedEventEnd,
        load: entry.loadEventEnd,
      })),
      longTasks: window.__startupTasks,
    }));
    return {
      ...performance,
      scriptBytes: [...scripts.values()].reduce((a, b) => a + b, 0),
      scripts: Object.fromEntries(scripts),
    };
  }
  const response = await page.goto(`${baseURL}/?tab=recent`, { waitUntil: "load" });
  assert.equal(response.status(), 200);
  await page.getByRole("button", { name: "Create new manifest", exact: true }).waitFor();
  const homepage = await checkpoint();
  const start = Date.now();
  await page.getByRole("button", { name: "Create new manifest", exact: true }).click();
  await page.getByRole("button", { name: "Download manifest", exact: true }).waitFor({ timeout: 60_000 });
  const editor = { readyMs: Date.now() - start, ...(await checkpoint()) };
  scripts.clear();
  downloads.length = 0;
  const reloadStart = Date.now();
  await page.reload({ waitUntil: "load" });
  await page.getByRole("button", { name: "Download manifest", exact: true }).waitFor();
  const editorReload = { readyMs: Date.now() - reloadStart, ...(await checkpoint()) };
  assert.deepEqual(errors, [], "Application errors during startup");
  const report = { baseURL, network, homepage, editor, editorReload, errors };
  await mkdir(new URL("../test-results/", import.meta.url), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  console.log(
    JSON.stringify(
      {
        homepageBytes: homepage.scriptBytes,
        editorBytes: editor.scriptBytes,
        editorReadyMs: editor.readyMs,
        editorReloadMs: editorReload.readyMs,
        editorReloadBytes: editorReload.scriptBytes,
        homepageLongestTask: Math.max(0, ...homepage.longTasks.map((entry) => entry.duration)),
        output,
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}
