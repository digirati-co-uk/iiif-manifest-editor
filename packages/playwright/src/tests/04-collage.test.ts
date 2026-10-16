import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import delft from "../fixtures/delft/irrigation-collage.json";

test.use({ actionTimeout: 15_000 });

// A single real Delft scene, pinned so these checks don't depend on exhibition edits.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("tour_step/exhibition-editor", "false"));
});

const sourceCanvas = delft.items[0];
const sourceImage = sourceCanvas.items[0].items[0].body;
const service = sourceImage.service[0];

async function exportedCanvas(page: Page) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download manifest", exact: true }).click();
  const download = await pending;
  const file = await download.path();
  const manifest = JSON.parse(await readFile(file!, "utf8"));
  expect(JSON.stringify(manifest)).not.toContain('"canvas-layout"');
  return manifest.items[0];
}
// Reload only once the debounced workspace save has reached IndexedDB.
async function waitForSavedCanvas(page: Page, canvas: { id: string; width: number; height: number }, layoutId: string) {
  const projectId = new URL(page.url()).pathname.split("/")[2];
  await expect
    .poll(
      () =>
        page.evaluate(
          ({ projectId, canvasId }) =>
            new Promise((resolve, reject) => {
              const request = indexedDB.open("manifest-editor-projects-v2");
              request.onerror = () => reject(request.error);
              request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction("manifest-editor-project-store", "readonly");
                const saved = transaction.objectStore("manifest-editor-project-store").get(projectId!);
                saved.onerror = () => reject(saved.error);
                saved.onsuccess = () => {
                  const data = saved.result?.vaultData;
                  const canvas = data?.entities.Canvas[canvasId];
                  resolve({
                    width: canvas?.width,
                    height: canvas?.height,
                    layoutId: data?.meta?.[canvasId]?.["canvas-layout"]?.state?.layoutId,
                  });
                };
                transaction.oncomplete = () => db.close();
              };
            }),
          { projectId, canvasId: canvas.id }
        ),
      { timeout: 15_000 }
    )
    .toEqual({ width: canvas.width, height: canvas.height, layoutId });
}
async function openDelft(page: Page) {
  await page.route(delft.id, (route) => route.fulfill({ json: delft }));
  await page.goto("/");
  await page.getByRole("button", { name: "Open manifest URL" }).click();
  await page.getByPlaceholder("Paste Manifest URL").fill(delft.id);
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.waitForURL(/\/editor\//);
  const projectPath = new URL(page.url()).pathname.split("/").slice(0, 3).join("/");
  await page.goto(`${projectPath}/exhibition`);
  const skip = page.getByRole("button", { name: "Skip for now" });
  await skip.click();
  const hint = page.getByRole("alertdialog");
  await hint.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Edit slide Citarum River, then and now", exact: true }).click();
  await page
    .locator(".exhibition-slideshow-current-toolbar")
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Select image 1", exact: true })).toBeVisible();
}

test("Delft collage: layout, smart resize, dragging, export and reload", async ({ page }) => {
  test.setTimeout(90_000);
  await openDelft(page);
  await page.getByRole("tab", { name: "Images", exact: true }).click();
  await page.getByRole("radio", { name: "Feature left", exact: true }).check();
  await expect(page.getByRole("button", { name: "Add image to position 1", exact: true })).toBeVisible();
  let canvas = await exportedCanvas(page);
  expect(canvas.items[0].items).toHaveLength(2);
  const width = page.getByRole("spinbutton", { name: "Width (px)", exact: true });
  await width.fill("1500");
  await expect(page.getByRole("spinbutton", { name: "Height (px)", exact: true })).toHaveValue("1500");
  await page.getByRole("button", { name: "Apply size", exact: true }).click();
  canvas = await exportedCanvas(page);
  expect(canvas.width).toBe(1500);
  expect(canvas.height).toBe(1500);
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  await page.waitForTimeout(600); // Atlas zoom transition must settle before measuring a drag.
  const imageButton = page.getByRole("button", { name: "Select image 1", exact: true });
  let imageBox = await imageButton.boundingBox();
  const viewer = await page.locator(".atlas-canvas").first().elementHandle();
  const before = canvas.items[0].items[0].target;
  const region = before.split("xywh=")[1].split(",").map(Number);
  await imageButton.click();
  await expect(page.getByRole("button", { name: "Done", exact: true }).first()).toBeVisible();
  imageBox = await page.locator('svg:has(> title:text-is("Annotation Editor")) > polygon').first().boundingBox();
  const stationaryBefore = (await page.getByRole("button", { name: "Select image 2", exact: true }).boundingBox())!;
  // The box is selected using the existing annotation helper; drag the interior to the left of the canvas.
  expect(imageBox).toBeTruthy();
  const x = imageBox!.x + imageBox!.width * 0.35;
  const y = imageBox!.y + (imageBox!.width * region[3]) / region[2] / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  // Release over the sidebar's edge controls too: the gesture still needs to commit.
  await page.mouse.move(imageBox!.x - 15, y, { steps: 20 });
  await expect(page.getByText(/Canvas will expand/)).toBeVisible();
  await page.mouse.up();
  await expect(page.getByText(/Canvas will expand/)).toBeHidden();
  await page.keyboard.press("Enter");
  const stationaryAfter = (await page.getByRole("button", { name: "Select image 2", exact: true }).boundingBox())!;
  expect(Math.abs(stationaryAfter.x - stationaryBefore.x)).toBeLessThan(2);
  expect(Math.abs(stationaryAfter.y - stationaryBefore.y)).toBeLessThan(2);
  canvas = await exportedCanvas(page);
  expect(canvas.items[0].items[0].target).not.toEqual(before);
  expect(canvas.width).toBeGreaterThan(1500);
  expect(await viewer!.evaluate((node) => node.isConnected)).toBe(true);
  await waitForSavedCanvas(page, canvas, "feature-left");
  await page.reload();
  await page.getByRole("button", { name: "Edit slide Citarum River, then and now", exact: true }).click();
  await page
    .locator(".exhibition-slideshow-current-toolbar")
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Add image to position 1", exact: true })).toBeVisible();
});

test("Delft collage: resize an image, switch selection, and resize the canvas edge", async ({ page }) => {
  await openDelft(page);
  await page.getByRole("tab", { name: "Images", exact: true }).click();
  await page.getByRole("radio", { name: "Side by side", exact: true }).check();
  const original = await exportedCanvas(page);
  const region = original.items[0].items[0].target.split("xywh=")[1].split(",").map(Number);
  const button = page.getByRole("button", { name: "Select image 1", exact: true });
  const box = (await button.boundingBox())!;
  await button.click();
  await expect(page.getByRole("button", { name: "Done", exact: true }).first()).toBeVisible();
  const right = box.x + box.width;
  const bottom = box.y + (box.width * region[3]) / region[2];
  await page.mouse.move(right, bottom);
  await page.mouse.down();
  await page.mouse.move(right + 20, bottom + 20, { steps: 12 });
  await page.mouse.up();
  await page.keyboard.press("Enter");
  const resized = await exportedCanvas(page);
  const next = resized.items[0].items[0].target.split("xywh=")[1].split(",").map(Number);
  expect(next[2]).toBeGreaterThan(region[2]);
  expect(next[2] / next[3]).toBeCloseTo(region[2] / region[3], 2);

  const freeBox = (await button.boundingBox())!;
  await button.click();
  await expect(page.getByRole("button", { name: "Done", exact: true }).first()).toBeVisible();
  await page.keyboard.down("Shift");
  const freeRight = freeBox.x + freeBox.width;
  const freeBottom = freeBox.y + (freeBox.width * next[3]) / next[2];
  await page.mouse.move(freeRight, freeBottom);
  await page.mouse.down();
  await page.mouse.move(freeRight + 25, freeBottom, { steps: 12 });
  await page.mouse.up();
  await page.keyboard.up("Shift");
  await page.keyboard.press("Enter");
  const free = (await exportedCanvas(page)).items[0].items[0].target.split("xywh=")[1].split(",").map(Number);
  expect(free[2]).toBeGreaterThan(next[2]);
  expect(free[3]).toBe(next[3]);

  await page.getByRole("button", { name: "Select image 1", exact: true }).click();
  await page.getByRole("button", { name: "Select image 2", exact: true }).click();
  await expect(page.getByRole("button", { name: "Select image 1", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Select image 2", exact: true })).toBeHidden();
  // Reapplying a layout cancels its old selection and restores the template positions.
  await page.getByRole("radio", { name: "Side by side", exact: true }).click();
  await expect(page.getByRole("button", { name: "Select image 2", exact: true })).toBeVisible();
  expect((await exportedCanvas(page)).items[0].items[0].target).toEqual(original.items[0].items[0].target);

  const resize = page.getByRole("button", { name: "Resize canvas", exact: true });
  await resize.click();
  const edge = await page.getByRole("button", { name: "Resize canvas bottom edge", exact: true }).boundingBox();
  expect(edge).toBeTruthy();
  const edgeX = edge!.x + edge!.width / 2;
  const edgeY = edge!.y + edge!.height / 2;
  await page.mouse.move(edgeX, edgeY);
  await page.mouse.down();
  await page.mouse.move(edgeX, edgeY - 30, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByRole("button", { name: "Resize canvas", exact: true })).toBeVisible();
  const smaller = await exportedCanvas(page);
  expect(smaller.width).toBe(original.width);
  expect(smaller.height).toBeLessThan(original.height);
});

test("empty exhibition canvas: template, placeholder insertion and layout compatibility", async ({ page }) => {
  test.setTimeout(90_000);
  await page.route(`${service.id || (service as any)["@id"]}/info.json`, (route) => route.fulfill({ json: service }));
  await page.goto("/");
  await page.getByRole("button", { name: "Create Exhibition", exact: true }).click();
  await page.getByRole("button", { name: "Start building", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Start adding content", exact: true }).click();
  await page.getByRole("option", { name: "Empty slide An empty image slide.", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Title", exact: true })).toHaveCount(0);
  await page.getByRole("radio", { name: "Feature left", exact: true }).check();
  await page.getByRole("button", { name: "Create canvas", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Add content", exact: true })).toBeHidden();
  await expect(page.getByRole("button", { name: /Add image to position/ })).toHaveCount(3);
  await page.getByRole("button", { name: "Add image to position 1", exact: true }).click();
  await page.getByRole("option", { name: "IIIF Image IIIF Image service", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Link to image service", exact: true })
    .fill(service.id || (service as any)["@id"]);
  await page.getByRole("textbox", { name: "Link to image service", exact: true }).blur();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Add content", exact: true })).toBeHidden();
  await expect(page.getByRole("button", { name: /Add image to position/ })).toHaveCount(2);
  const canvas = await exportedCanvas(page);
  expect(canvas.width).toBe(3000);
  expect(canvas.height).toBe(2000);
  expect(canvas.items[0].items).toHaveLength(1);
  expect(JSON.stringify(canvas.items[0].items[0].target)).toContain("xywh=");
  await page.getByRole("tab", { name: "Images", exact: true }).click();
  await page.getByRole("button", { name: "Switch to single image", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Side by side", exact: true })).toHaveCount(0);
  await expect(page.getByRole("spinbutton", { name: "Width (px)", exact: true })).toHaveCount(0);
  const single = await exportedCanvas(page);
  expect(single.width).toBe(service.width);
  expect(single.height).toBe(service.height);
  expect(single.items[0].items[0].target).toBe(single.id);
  await page.getByRole("button", { name: "Switch to multi-image layout", exact: true }).click();
  await expect(page.getByRole("group", { name: "Canvas shape", exact: true })).toHaveCount(0);
  await page.getByRole("radio", { name: "Side by side", exact: true }).check();
  await expect(page.getByRole("button", { name: /Add image to position/ })).toHaveCount(1);
  await waitForSavedCanvas(page, single, "pair");
  await page.reload();
  await page.getByRole("button", { name: "Edit slide Untitled collage", exact: true }).click();
  await page
    .locator(".exhibition-slideshow-current-toolbar")
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await expect(page.getByRole("button", { name: /Add image to position/ })).toHaveCount(1);
  await page.getByRole("button", { name: "Browse IIIF for position 1", exact: true }).click();
  await expect(page.locator(".iiif-browser")).toBeVisible();
  await expect(page.getByRole("option", { name: "IIIF Image IIIF Image service", exact: true })).toHaveCount(0);
});

test("main manifest editor shares the ratio lock and expand-to-fit controls", async ({ page }) => {
  await openDelft(page);
  const projectPath = new URL(page.url()).pathname.split("/").slice(0, 3).join("/");
  await page.goto(projectPath);
  await page.getByRole("button", { name: "Canvases", exact: true }).click();
  await page.getByRole("tab", { name: "Technical", exact: true }).click();
  const width = page.getByRole("spinbutton", { name: "Width (px)", exact: true });
  const height = page.getByRole("spinbutton", { name: "Height (px)", exact: true });
  await page.getByRole("button", { name: "Lock aspect ratio", exact: true }).click();
  await width.fill("200");
  await expect(height).toHaveValue("1000");
  await page.getByRole("button", { name: "Apply size", exact: true }).click();
  await page.getByRole("button", { name: /Expand to fit/ }).click();
  await expect(width).not.toHaveValue("200");
  const canvas = await exportedCanvas(page);
  expect(canvas.width).toBeGreaterThan(200);
  expect(canvas.items[0].items[0].target).toEqual(sourceCanvas.items[0].items[0].target);
});

test("tour drawing starts with no leftover image selection", async ({ page }) => {
  await openDelft(page);
  await page.getByRole("button", { name: "Select image 1", exact: true }).click();
  const selection = (await page
    .locator('svg:has(> title:text-is("Annotation Editor")) > polygon')
    .first()
    .boundingBox())!;
  await page.mouse.move(selection.x + selection.width / 2, selection.y + selection.height / 2);
  await page.mouse.down();
  await page.mouse.move(selection.x + selection.width / 2 + 25, selection.y + selection.height / 2 + 20, { steps: 10 });
  await page.mouse.up();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Resize canvas", exact: true }).click();
  await page.getByRole("button", { name: "More tabs", exact: true }).click();
  await page.getByRole("menuitem", { name: "Tour steps", exact: true }).click();
  await page.getByRole("button", { name: "+ Add new step", exact: true }).click();
  const editor = page.locator('svg:has(> title:text-is("Annotation Editor"))');
  await expect(editor).toBeVisible();
  await expect(page.getByRole("button", { name: "Resize canvas bottom edge", exact: true })).toHaveCount(0);
  await expect(editor.locator('polygon[points]:not([points=""])')).toHaveCount(0);
  await expect
    .poll(() =>
      editor.locator("rect").evaluateAll(
        (rects) =>
          rects.filter((rect) => {
            const style = getComputedStyle(rect);
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              rect.getBoundingClientRect().width > 20 &&
              rect.getBoundingClientRect().height > 20
            );
          }).length
      )
    )
    .toBe(0);
});

test("image controls: reversible mode, colours and clear placeholders", async ({ page }) => {
  await openDelft(page);
  await page.getByRole("tab", { name: "Images", exact: true }).click();
  await page.getByRole("radio", { name: "Feature left", exact: true }).check();
  await page.getByRole("button", { name: "Clear placeholders", exact: true }).click();
  await expect(page.getByRole("button", { name: /Add image to position/ })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Background colour value", exact: true }).fill("#aaccdd");
  const canvas = await exportedCanvas(page);
  expect(canvas.backgroundColor).toBe("#aaccdd");
  await expect(page.locator(".atlas-container")).toHaveCSS("background-color", "rgb(146, 175, 190)");
  await page.getByRole("button", { name: "Add media", exact: true }).first().click();
  await expect(page.getByRole("option", { name: "IIIF Image IIIF Image service", exact: true })).toBeVisible();
});

test("resize across a placeholder and discard both image and canvas changes", async ({ page }) => {
  await openDelft(page);
  await page.getByRole("tab", { name: "Images", exact: true }).click();
  await page.getByRole("radio", { name: "Feature left", exact: true }).check();
  const original = await exportedCanvas(page);
  const placeholder = (await page.getByRole("button", { name: "Add image to position 1", exact: true }).boundingBox())!;
  await page.getByRole("button", { name: "Select image 1", exact: true }).click();
  const selection = (await page
    .locator('svg:has(> title:text-is("Annotation Editor")) > polygon')
    .first()
    .boundingBox())!;
  await page.keyboard.down("Shift");
  await page.mouse.move(selection.x + selection.width, selection.y + selection.height);
  await expect(page.locator(".atlas-canvas")).toHaveClass(/atlas-cursor-se/);
  await page.mouse.down();
  await page.mouse.move(placeholder.x + placeholder.width / 2, placeholder.y + placeholder.height / 2, { steps: 18 });
  await page.mouse.up();
  await page.keyboard.up("Shift");
  const changed = await exportedCanvas(page);
  const region = (target: string) => target.split("xywh=")[1].split(",").map(Number);
  expect(region(changed.items[0].items[0].target)[2]).toBeGreaterThan(
    region(original.items[0].items[0].target)[2] + 100
  );
  await page.getByRole("button", { name: "Discard changes", exact: true }).click();
  expect(await exportedCanvas(page)).toEqual(original);
  await page.getByRole("button", { name: "Resize canvas", exact: true }).click();
  const edge = (await page.getByRole("button", { name: "Resize canvas left edge", exact: true }).boundingBox())!;
  await page.mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2);
  await page.mouse.down();
  await page.mouse.move(edge.x + edge.width / 2 + 40, edge.y + edge.height / 2, { steps: 12 });
  await page.mouse.up();
  const smaller = await exportedCanvas(page);
  expect(smaller.width).toBeLessThan(original.width);
  expect(smaller.behavior).not.toEqual(original.behavior);
  await page.getByRole("button", { name: "Discard changes", exact: true }).click();
  expect(await exportedCanvas(page)).toEqual(original);
  await expect(page.getByRole("button", { name: /Add image to position/ })).toHaveCount(1);
});
