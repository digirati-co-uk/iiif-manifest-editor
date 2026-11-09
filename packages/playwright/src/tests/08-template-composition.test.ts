import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import delft from "../fixtures/delft/irrigation-collage.json";

const service = delft.items[0].items[0].items[0].body.service[0];
async function exported(page: Page) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download manifest", exact: true }).click();
  const download = await pending;
  return JSON.parse(await readFile((await download.path())!, "utf8"));
}
async function addAt(page: Page, number: number) {
  await page.getByRole("button", { name: `Add image to position ${number}`, exact: true }).click();
  await page.getByRole("textbox", { name: "Paste a link", exact: true }).fill(`${service["@id"]}/info.json`);
  await page.getByRole("button", { name: "Use link", exact: true }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Add content", exact: true })).toBeHidden();
}
test("guided composition keeps slots, stacking and discard across resize and removal", async ({ page }) => {
  test.setTimeout(120_000);
  await page.route(`${service["@id"]}/info.json`, (route) => route.fulfill({ json: service }));
  await page.goto("/");
  await page.getByRole("button", { name: "Create Exhibition", exact: true }).click();
  await page.getByRole("button", { name: "Start building", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Dismiss", exact: true }).click();
  await page.getByRole("button", { name: "Start adding content", exact: true }).click();
  await page.getByRole("option", { name: "Multiple images", exact: true }).click();
  await page.getByRole("radio", { name: "Hero + inset", exact: true }).check();
  await page.getByRole("button", { name: "Create canvas", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Images", exact: true })).toHaveAttribute("aria-selected", "true");
  await addAt(page, 2);
  const inset = (await exported(page)).items[0].items[0].items[0];
  await expect(page.getByRole("button", { name: "Add image to position 1", exact: true })).toBeVisible();
  await addAt(page, 1);
  const filled = (await exported(page)).items[0];
  expect(filled.items[0].items[1].id).toBe(inset.id);
  await expect(page.getByText("Editing composition")).toBeHidden();
  await page.getByRole("spinbutton", { name: "Width (px)", exact: true }).fill("6000");
  await page.getByRole("button", { name: "Apply size", exact: true }).click();
  const resized = (await exported(page)).items[0];
  expect(resized.items[0].items[0].target).not.toEqual(filled.items[0].items[0].target);
  await page.getByRole("region", { name: "Canvas size" }).getByRole("button", { name: "Undo", exact: true }).click();
  expect((await exported(page)).items[0]).toEqual(filled);
  // Removing asks first: declining keeps the image, accepting leaves its position empty.
  const positions = page.getByRole("list", { name: "Image positions" });
  page.once("dialog", (dialog) => dialog.dismiss());
  await positions.getByRole("button", { name: "Remove", exact: true }).first().click();
  expect((await exported(page)).items[0].items[0].items).toHaveLength(2);
  page.once("dialog", (dialog) => dialog.accept());
  await positions.getByRole("button", { name: "Remove", exact: true }).first().click();
  await expect(page.getByRole("button", { name: "Add image to position 1", exact: true })).toBeVisible();
  const restored = await exported(page);
  expect(restored.items[0].items[0].items).toHaveLength(1);
  expect(JSON.stringify(restored)).not.toContain("canvas-layout");
});

test("positions swap immediately, cancelling a replacement is safe and saved assignments survive reload", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.route(`${service["@id"]}/info.json`, (route) => route.fulfill({ json: service }));
  await page.goto("/");
  await page.getByRole("button", { name: "Create Exhibition", exact: true }).click();
  await page.getByRole("button", { name: "Start building", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Dismiss", exact: true }).click();
  await page.getByRole("button", { name: "Start adding content", exact: true }).click();
  await page.getByRole("option", { name: "Multiple images", exact: true }).click();
  await page.getByRole("button", { name: "Create canvas", exact: true }).click();
  await addAt(page, 2);
  await addAt(page, 1);
  const beforeSwap = (await exported(page)).items[0];
  await page.getByRole("button", { name: "Move position 1 down", exact: true }).click();
  const swapped = (await exported(page)).items[0];
  expect(swapped.items[0].items.map((item: any) => item.id)).toEqual(
    beforeSwap.items[0].items.map((item: any) => item.id).reverse()
  );
  const positions = page.getByRole("list", { name: "Image positions" });
  await positions.getByRole("button", { name: "Replace", exact: true }).first().click();
  await page
    .getByRole("dialog", { name: "Add content", exact: true })
    .getByRole("button", { name: "Close", exact: true })
    .click();
  expect((await exported(page)).items[0]).toEqual(swapped);
  await positions.getByRole("button", { name: "Replace", exact: true }).first().click();
  await page.getByRole("textbox", { name: "Paste a link", exact: true }).fill(`${service["@id"]}/info.json`);
  await page.getByRole("button", { name: "Use link", exact: true }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Add content", exact: true })).toBeHidden();
  const replaced = (await exported(page)).items[0];
  expect(replaced.items[0].items).toHaveLength(2);
  expect(replaced.items[0].items[0].id).not.toBe(swapped.items[0].items[0].id);
  expect(replaced.items[0].items[0].target).toEqual(swapped.items[0].items[0].target);
  const projectId = new URL(page.url()).pathname.split("/")[2];
  await expect
    .poll(() =>
      page.evaluate(
        ({ projectId, canvasId }) =>
          new Promise((resolve, reject) => {
            const request = indexedDB.open("manifest-editor-projects-v2");
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              const db = request.result;
              const tx = db.transaction("manifest-editor-project-store", "readonly");
              const saved = tx.objectStore("manifest-editor-project-store").get(projectId!);
              saved.onsuccess = () =>
                resolve(
                  saved.result?.vaultData?.meta?.[canvasId]?.["canvas-layout"]?.state?.slots.map(
                    (slot: any) => slot.annotationIds[0]
                  )
                );
              tx.oncomplete = () => db.close();
            };
          }),
        { projectId, canvasId: swapped.id }
      )
    )
    .toEqual(replaced.items[0].items.map((item: any) => item.id));
  await page.reload();
  await page.getByRole("button", { name: "Edit slide Untitled collage", exact: true }).click();
  expect((await exported(page)).items[0]).toEqual(replaced);
});

test("resizing reapplies the layout by default, can be undone, and can be switched off first", async ({ page }) => {
  test.setTimeout(120_000);
  await page.route(`${service["@id"]}/info.json`, (route) => route.fulfill({ json: service }));
  await page.goto("/");
  await page.getByRole("button", { name: "Create Exhibition", exact: true }).click();
  await page.getByRole("button", { name: "Start building", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Dismiss", exact: true }).click();
  await page.getByRole("button", { name: "Start adding content", exact: true }).click();
  await page.getByRole("option", { name: "Multiple images", exact: true }).click();
  await page.getByRole("button", { name: "Create canvas", exact: true }).click();
  await addAt(page, 1);
  await addAt(page, 2);
  const before = (await exported(page)).items[0];

  await expect(page.getByText("Arranged with")).toHaveCount(0);
  const reapply = page.getByRole("checkbox", { name: "Reapply layout when resizing", exact: true });
  await expect(reapply).toBeChecked();
  await page.getByRole("spinbutton", { name: "Width (px)", exact: true }).fill("6000");
  await page.getByRole("button", { name: "Apply size", exact: true }).click();
  await expect(page.getByText("layout reapplied")).toBeVisible();
  const reflowed = (await exported(page)).items[0];
  expect(reflowed.items[0].items[0].target).not.toEqual(before.items[0].items[0].target);

  await page.getByRole("region", { name: "Canvas size" }).getByRole("button", { name: "Undo", exact: true }).click();
  expect((await exported(page)).items[0]).toEqual(before);

  await reapply.uncheck();
  await page.getByRole("spinbutton", { name: "Width (px)", exact: true }).fill("6000");
  await page.getByRole("button", { name: "Apply size", exact: true }).click();
  const kept = (await exported(page)).items[0];
  expect(kept.width).toBe(6000);
  expect(kept.items[0].items[0].target).toEqual(before.items[0].items[0].target);

  // Dragging the canvas edge on an untouched template reflows it automatically too.
  await page.getByRole("button", { name: "Resize canvas", exact: true }).click();
  const edge = (await page.getByRole("button", { name: "Resize canvas right edge", exact: true }).boundingBox())!;
  await page.mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2);
  await page.mouse.down();
  await page.mouse.move(edge.x + edge.width / 2 - 60, edge.y + edge.height / 2, { steps: 10 });
  await page.mouse.up();
  const dragged = (await exported(page)).items[0];
  expect(dragged.width).toBeLessThan(kept.width);
  expect(dragged.items[0].items[0].target).not.toEqual(kept.items[0].items[0].target);
  await expect(page.getByText("Custom arrangement")).toHaveCount(0);
});

test("the editing bar only appears after a manual move, and clicking the background confirms it", async ({ page }) => {
  test.setTimeout(120_000);
  await page.route(`${service["@id"]}/info.json`, (route) => route.fulfill({ json: service }));
  await page.goto("/");
  await page.getByRole("button", { name: "Create Exhibition", exact: true }).click();
  await page.getByRole("button", { name: "Start building", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Dismiss", exact: true }).click();
  await page.getByRole("button", { name: "Start adding content", exact: true }).click();
  await page.getByRole("option", { name: "Multiple images", exact: true }).click();
  await page.getByRole("radio", { name: "Hero + inset", exact: true }).check();
  await page.getByRole("button", { name: "Create canvas", exact: true }).click();
  await addAt(page, 1);
  await addAt(page, 2);
  const bar = page.getByText("Editing composition");
  await expect(bar).toBeHidden();

  // Resizing the slide keeps every image selectable on the canvas.
  await page.getByRole("spinbutton", { name: "Width (px)", exact: true }).fill("4500");
  await page.getByRole("button", { name: "Apply size", exact: true }).click();
  await expect(page.getByRole("button", { name: "Select image 1", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Select image 2", exact: true })).toBeVisible();
  await expect(bar).toBeHidden();

  await page.getByRole("button", { name: "Select image 2", exact: true }).click();
  await expect(page.getByRole("toolbar", { name: "Image actions" })).toBeVisible();
  const selection = (await page
    .locator('svg:has(> title:text-is("Annotation Editor")) > polygon')
    .first()
    .boundingBox())!;
  await page.mouse.move(selection.x + selection.width / 2, selection.y + selection.height / 2);
  await page.mouse.down();
  await page.mouse.move(selection.x - 60, selection.y - 40, { steps: 10 });
  await page.mouse.up();
  await expect(bar).toBeVisible();

  const viewer = (await page.locator(".atlas-canvas").boundingBox())!;
  await page.mouse.click(viewer.x + viewer.width - 24, viewer.y + viewer.height / 2);
  await expect(page.getByRole("toolbar", { name: "Image actions" })).toBeHidden();
  await expect(bar).toBeHidden();
  await expect(page.getByRole("button", { name: "Select image 2", exact: true })).toBeVisible();
  // A hand-arranged slide no longer reflows on its own; an untouched one does.
  await expect(page.getByText("Custom arrangement")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Reapply layout when resizing", exact: true })).not.toBeChecked();
});
