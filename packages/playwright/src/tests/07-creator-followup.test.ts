import { readFile } from "node:fs/promises";
import recipe from "../fixtures/cookbook/0005-image-service/manifest.json";
import info from "../fixtures/cookbook/0005-image-service/info.json";
import { expect, test, type Page } from "@playwright/test";

async function openManifestCreator(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Create new manifest", exact: true }).click();
  await page.getByRole("button", { name: "Start adding content", exact: true }).click();
  return page.getByRole("dialog", { name: "Add content", exact: true });
}

for (const [name, url, contentType, field] of [
  ["image", "https://creator.test/photo.jpg", "image/jpeg", "Link to image"],
  ["audio", "https://creator.test/audio.mp3", "audio/mpeg", "Link to audio file"],
  ["video", "https://creator.test/video.mp4", "video/mp4", "Link to video file"],
  ["YouTube", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "text/html", "Link to YouTube"],
]) {
  test(`Manifest Editor recognises ${name} links`, async ({ page }) => {
    await page.route("https://creator.test/**", (route) =>
      route.fulfill({ status: 200, contentType, body: "not JSON" })
    );
    await page.route("https://www.youtube.com/**", (route) =>
      route.fulfill({ status: 200, contentType, body: "not JSON" })
    );
    const dialog = await openManifestCreator(page);
    await dialog.getByRole("textbox", { name: "Paste a link", exact: true }).fill(url!);
    await dialog.getByRole("button", { name: "Use link", exact: true }).click();
    await expect(dialog.getByRole("textbox", { name: field!, exact: true })).toHaveValue(url!);
  });
}

test("Manifest Editor recognises an IIIF image service and opens its form", async ({ page }) => {
  await page.route(`${info.id}/info.json`, (route) => route.fulfill({ json: info }));
  const dialog = await openManifestCreator(page);
  await dialog.getByRole("textbox", { name: "Paste a link", exact: true }).fill(`${info.id}/info.json`);
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await expect(dialog.getByRole("textbox", { name: "Link to image service", exact: true })).toHaveValue(
    `${info.id}/info.json`
  );
});

test("Manifest Editor recognises an IIIF manifest and opens its browser", async ({ page }) => {
  await page.route(recipe.id, (route) => route.fulfill({ json: recipe }));
  const dialog = await openManifestCreator(page);
  await dialog.getByRole("textbox", { name: "Paste a link", exact: true }).fill(recipe.id);
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await expect(dialog.locator(".iiif-browser")).toBeVisible();
  await expect(dialog.getByText(recipe.label.en[0], { exact: true }).first()).toBeVisible();
});

for (const [name, url, contentType, field] of [
  ["webpage", "https://creator.test/page", "text/html", "Link"],
  ["plain-text", "https://creator.test/notes.txt", "text/plain", "Link to plain-text file"],
]) {
  test(`Manifest Editor detects ${name} rendering links`, async ({ page }, testInfo) => {
    await page.route("https://creator.test/**", (route) =>
      route.fulfill({ status: 200, contentType, body: "example content" })
    );
    await page.route("**/api/web-page-preview", (route) =>
      route.fulfill({ json: { title: "Linked webpage", description: "A preview" } })
    );
    await page.goto("/");
    await page.getByRole("button", { name: "Create new manifest", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Manifest", exact: true })).toBeVisible();
    const linking = page.getByRole("tab", { name: "Linking", exact: true });
    if (await linking.isVisible()) {
      await linking.click();
    } else {
      await page.getByRole("button", { name: "More tabs", exact: true }).click();
      await page.getByRole("menuitem", { name: "Linking", exact: true }).click();
    }
    await page.getByRole("button", { name: "Add Rendering", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Add content", exact: true });
    await dialog.getByRole("textbox", { name: "Paste a link", exact: true }).fill(url!);
    await dialog.getByRole("button", { name: "Use link", exact: true }).click();
    await expect(dialog.getByRole("textbox", { name: field!, exact: true })).toHaveValue(url!);
    await dialog.getByRole("button", { name: name === "webpage" ? "Add link" : "Create", exact: true }).click();
    await expect(dialog).toBeHidden();
    const downloading = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download manifest", exact: true }).click();
    const path = testInfo.outputPath("rendering.json");
    await (await downloading).saveAs(path);
    const manifest = JSON.parse(await readFile(path, "utf8"));
    expect(manifest.rendering[0].id).toBe(url);
    expect(manifest.rendering[0].format).toBe(contentType);
  });
}

test("tooltips stay in the modal and the link bar keeps its button aligned", async ({ page }, testInfo) => {
  const dialog = await openManifestCreator(page);
  const manual = dialog.getByRole("option", { name: "Empty canvas", exact: true });
  await manual.hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  expect(await tooltip.evaluate((node) => !!node.closest(".manifest-editor-modal"))).toBe(true);
  await dialog.getByRole("textbox", { name: "Paste a link", exact: true }).fill("https://example.org/photo.jpg");
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const input = dialog.getByRole("textbox", { name: "Paste a link", exact: true });
    const button = dialog.getByRole("button", { name: "Use link", exact: true });
    const inputBounds = (await input.boundingBox())!;
    const buttonBounds = (await button.boundingBox())!;
    const barBounds = (await input.locator("../..").boundingBox())!;
    expect(Math.abs(inputBounds.y + inputBounds.height / 2 - buttonBounds.y - buttonBounds.height / 2)).toBeLessThan(1);
    expect(buttonBounds.x).toBeGreaterThan(inputBounds.x + inputBounds.width - 1);
    expect(buttonBounds.x + buttonBounds.width).toBeLessThan(barBounds.x + barBounds.width);
    await expect(button).toBeInViewport();
  }
  await page.screenshot({ path: testInfo.outputPath("unified-link-bar.png"), animations: "disabled" });
});

test("Manifest Editor offers the thumbnail creator for an IIIF service link", async ({ page }) => {
  const size = { width: 400, height: Math.round((info.height * 400) / info.width) };
  await page.route(`${info.id}/info.json`, (route) => route.fulfill({ json: { ...info, sizes: [size] } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Create new manifest", exact: true }).click();
  await page.getByRole("tab", { name: "Descriptive", exact: true }).click();
  await page.getByRole("button", { name: "Add Thumbnail", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add content", exact: true });
  await dialog.getByRole("textbox", { name: "Paste a link", exact: true }).fill(`${info.id}/info.json`);
  await dialog.getByRole("button", { name: "Use link", exact: true }).click();
  await dialog.getByRole("option", { name: "IIIF thumbnail", exact: true }).click();
  await expect(dialog.getByRole("button", { name: `${size.width}x${size.height}`, exact: true })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Add thumbnail", exact: true })).toBeEnabled();
});
