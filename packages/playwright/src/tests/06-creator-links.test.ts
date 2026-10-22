import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

async function openExhibition(page: Page, format = "Leeds exhibition") {
  await page.goto("/");
  await page.getByRole("button", { name: "Create Exhibition", exact: true }).click();
  const formats = page.getByRole("dialog", { name: "Choose exhibition format", exact: true });
  await formats.getByRole("button", { name: `Use ${format} format`, exact: true }).click();
  await formats.getByRole("button", { name: "Start building", exact: true }).click();
  const tip = page.getByRole("alertdialog");
  if (await tip.isVisible()) await tip.getByRole("button", { name: "Dismiss", exact: true }).click();
  await page
    .getByRole("button", { name: format.endsWith("scroll") ? "Create new section" : "Create new slide", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Add content", exact: true });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function downloadManifest(page: Page, outputPath: string) {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download manifest", exact: true }).click();
  await (await download).saveAs(outputPath);
  return JSON.parse(await readFile(outputPath, "utf8"));
}

// Pin requests to exercise real probes and creators without depending on remote hosts.
async function mockLink(page: Page, contentType = "text/html", body = "<html>Ordinary webpage</html>") {
  await page.route("https://creator.test/**", (route) =>
    route.fulfill({
      status: 200,
      contentType,
      body: route.request().method() === "HEAD" ? "" : body,
    })
  );
}

for (const format of ["Leeds exhibition", "Leeds exhibition slideshow", "Leeds exhibition scroll"]) {
  test(`${format}: link-first choices and manual creation`, async ({ page }, testInfo) => {
    const dialog = await openExhibition(page, format);
    await expect(dialog.getByRole("textbox", { name: "Paste a link", exact: true })).toBeFocused();
    await expect(dialog.getByRole("option", { name: "YouTube", exact: true })).toHaveCount(0);
    const manual = dialog.getByRole("listbox", { name: "Create without a link", exact: true });
    const blank = manual.getByRole("option", {
      name: format.endsWith("slideshow") ? "Multiple images" : "Empty slide",
      exact: true,
    });
    await expect(blank).toBeVisible();
    await blank.hover();
    await expect(page.getByRole("tooltip")).toContainText(
      format.endsWith("slideshow") ? "multiple images" : "blank slide"
    );
    // The description is help on hover/focus, not a second line of card copy.
    await expect(blank).toHaveText(format.endsWith("slideshow") ? "Multiple images" : "Empty slide");
    const all = dialog.getByRole("button", { name: "Choose a content type instead", exact: true });
    await all.click();
    await expect(dialog.getByRole("button", { name: "Show fewer options", exact: true })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    await expect(dialog.getByRole("option", { name: "YouTube", exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Show fewer options", exact: true }).click();
    await blank.focus();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden();
    const manifest = await downloadManifest(page, testInfo.outputPath("manual.json"));
    expect(manifest.items).toHaveLength(1);
    expect(manifest.items[0].type).toBe("Canvas");
    if (format.endsWith("scroll")) expect(manifest.items[0].behavior).toContain("splash");
  });
}

test("a recognised YouTube link opens a prefilled form and creates one slide", async ({ page }, testInfo) => {
  await mockLink(page);
  // Other probes also check the URL; keep those checks local and deterministic.
  await page.route("https://www.youtube.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<html></html>" })
  );
  const dialog = await openExhibition(page);
  const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  await dialog.getByRole("textbox", { name: "Paste a link", exact: true }).fill(url);
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await expect(dialog.getByRole("textbox", { name: "Link to YouTube", exact: true })).toHaveValue(url);
  const help = dialog.getByRole("button", { name: "Help for YouTube", exact: true });
  await dialog.getByRole("textbox", { name: "Link to YouTube", exact: true }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(help).toBeFocused();
  await expect(page.getByRole("tooltip")).toContainText("YouTube link");
  await dialog.getByRole("button", { name: "Back to Add content options", exact: true }).click();
  await expect(dialog.getByRole("textbox", { name: "Paste a link", exact: true })).toHaveValue(url);
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await dialog.getByRole("button", { name: "Create", exact: true }).click();
  await expect(dialog).toBeHidden();
  const manifest = await downloadManifest(page, testInfo.outputPath("youtube.json"));
  expect(manifest.items).toHaveLength(1);
  expect(manifest.items[0].items[0].items[0].body.id).toBe(url);
});

test("multiple matches offer a choice while preserving the link and manual routes", async ({ page }) => {
  // A .jpg URL with a video content type matches the real image and video probes.
  await mockLink(page, "video/mp4", "not JSON");
  const dialog = await openExhibition(page);
  const url = "https://creator.test/ambiguous.jpg";
  await dialog.getByRole("textbox", { name: "Paste a link", exact: true }).fill(url);
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Choose how to use this link");
  const matches = dialog.getByRole("listbox", { name: "Matching content types", exact: true });
  await expect(matches.getByRole("option")).toHaveCount(2);
  await expect(dialog.getByRole("listbox", { name: "Create without a link", exact: true })).toBeVisible();
  await matches.getByRole("option", { name: "Image from a link", exact: true }).click();
  await expect(dialog.getByRole("textbox", { name: "Link to image", exact: true })).toHaveValue(url);
  await dialog.getByRole("button", { name: "Back to Add content options", exact: true }).click();
  await expect(matches).toBeVisible();
  await dialog.getByRole("button", { name: "Choose a content type instead", exact: true }).click();
  await expect(dialog.getByRole("option", { name: "Browse IIIF content", exact: true })).toBeVisible();
});

test("unknown links reveal alternatives and failed requests can be retried", async ({ page }) => {
  await mockLink(page);
  const dialog = await openExhibition(page);
  const input = dialog.getByRole("textbox", { name: "Paste a link", exact: true });
  const url = "https://creator.test/unknown";
  await input.fill(url);
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("couldn’t identify content");
  await expect(input).toHaveValue(url);
  await expect(dialog.getByRole("option", { name: "Browse IIIF content", exact: true })).toBeVisible();
  await page.unroute("https://creator.test/**");
  await page.route("https://creator.test/**", (route) => route.abort("failed"));
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("couldn’t check this link");
  await expect(input).toHaveValue(url);
  await page.unroute("https://creator.test/**");
  await mockLink(page);
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("couldn’t identify content");
});

test("editing a link discards old results and manual selection cancels pending checks", async ({ page }, testInfo) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("https://creator.test/**", async (route) => {
    await pending;
    await route.fulfill({ status: 200, contentType: "image/jpeg", body: "image" }).catch(() => {});
  });
  const dialog = await openExhibition(page);
  const input = dialog.getByRole("textbox", { name: "Paste a link", exact: true });
  await input.fill("https://creator.test/slow.jpg");
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Checking…", exact: true })).toBeVisible();
  await input.fill("https://creator.test/new-link");
  release();
  await expect(dialog.getByRole("button", { name: "Use link", exact: true })).toBeEnabled();
  await expect(input).toHaveValue("https://creator.test/new-link");
  await expect(dialog.getByRole("textbox", { name: "Link to image", exact: true })).toHaveCount(0);
  await page.unroute("https://creator.test/**");
  await page.route("https://creator.test/**", () => {});
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await dialog.getByRole("option", { name: "Empty slide", exact: true }).click();
  await expect(dialog).toBeHidden();
  const manifest = await downloadManifest(page, testInfo.outputPath("cancelled-probe.json"));
  expect(manifest.items).toHaveLength(1);
});

test("slow checks time out and reduced motion keeps a static placeholder", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("https://creator.test/**", () => {});
  const dialog = await openExhibition(page);
  const input = dialog.getByRole("textbox", { name: "Paste a link", exact: true });
  await expect(input).toHaveAttribute("placeholder", "https://example.org/manifest.json");
  await expect(dialog.locator(".creator-resource-hint")).toHaveCount(0);
  await input.fill("https://creator.test/slow");
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Checking took too long", { timeout: 12_000 });
  await expect(dialog.getByRole("button", { name: "Use link", exact: true })).toBeEnabled();
  await expect(dialog.getByRole("option", { name: "Video", exact: true })).toBeVisible();
});

test("cycling hints stop when typing and the compact dialog fits a narrow screen", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const dialog = await openExhibition(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const hint = dialog.locator(".creator-resource-hint");
  await expect(hint).toBeVisible();
  const first = await hint.innerText();
  await expect(hint).not.toHaveText(first, { timeout: 4500 });
  await dialog.getByRole("textbox", { name: "Paste a link", exact: true }).fill("https://example.org/photo.jpg");
  await expect(hint).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Use link", exact: true })).toBeInViewport();
  await expect(dialog.getByRole("option", { name: "Text panel", exact: true })).toBeInViewport();
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: testInfo.outputPath("compact-dialog.png") });
});
