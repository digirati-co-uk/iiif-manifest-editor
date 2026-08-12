#!/usr/bin/env node

import { mkdir, readFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { chromium } from "@playwright/test";

const configPath = resolve(process.argv[2] || "exhibition-presets.json");
const configDirectory = dirname(configPath);

function fail(message) {
  console.error(message);
  process.exit(1);
}

let entries;
try {
  entries = JSON.parse(await readFile(configPath, "utf8"));
} catch (error) {
  fail(`Could not read ${configPath}: ${error.message}`);
}

if (
  !Array.isArray(entries) ||
  entries.some(
    (entry) =>
      !entry ||
      typeof entry.url !== "string" ||
      typeof entry.output !== "string",
  )
) {
  fail("Configuration must be an array of objects with url and output fields.");
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const thumbnailPage = await browser.newPage({
  viewport: { width: 640, height: 360 },
});

try {
  for (const entry of entries) {
    const output = isAbsolute(entry.output)
      ? entry.output
      : resolve(configDirectory, entry.output);
    await mkdir(dirname(output), { recursive: true });
    console.log(`${entry.url} -> ${output}`);
    await page.goto(entry.url, { waitUntil: "networkidle" });
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete),
    );
    await page.evaluate(() => document.fonts.ready);
    const screenshot = await page.screenshot({ animations: "disabled" });

    await thumbnailPage.setContent(
      `<img src="data:image/png;base64,${screenshot.toString("base64")}" width="640" height="360">`,
    );
    await thumbnailPage.locator("img").screenshot({ path: output });
  }
} finally {
  await browser.close();
}
