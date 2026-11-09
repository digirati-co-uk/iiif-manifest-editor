import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

async function openExhibitionFormats(page: Page) {
  await page.goto("/");
  const create = page.getByRole("button", { name: "Create Exhibition", exact: true });
  const formats = page.getByRole("dialog", { name: "Choose exhibition format", exact: true });
  await expect(async () => {
    if (await create.isVisible()) await create.click();
    await expect(formats).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 10_000 });
  return formats;
}

async function openSlideshow(page: Page, fromOverview: boolean) {
  const formats = await openExhibitionFormats(page);
  await formats.getByRole("button", { name: "Skip for now", exact: true }).click();
  const path = new URL(page.url()).pathname;
  await page.goto(`${path}/slideshow`);
  const tip = page.getByRole("alertdialog");
  await tip.getByRole("button", { name: "Dismiss", exact: true }).click();
  if (!fromOverview) await page.getByRole("button", { name: "Slideshow", exact: true }).click();
}

for (const [creator, fromOverview] of [
  ["Multiple images", false],
  ["Multiple images with text", false],
  ["Multiple images with text", true],
] as const) {
  test(`${creator} opens the slideshow canvas from ${fromOverview ? "overview" : "slide list"}`, async ({
    page,
  }, testInfo) => {
    await openSlideshow(page, fromOverview);
    await page
      .getByRole("button", { name: fromOverview ? "Start adding content" : "Create new slide", exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "Add content", exact: true });
    await dialog.getByRole("option", { name: creator, exact: true }).click();
    await expect(dialog).toBeHidden();
    const downloading = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download manifest", exact: true }).click();
    const path = testInfo.outputPath("slide.json");
    await (await downloading).saveAs(path);
    const manifest = JSON.parse(await readFile(path, "utf8"));
    expect(manifest.items).toHaveLength(1);
    expect(manifest.items[0].behavior).toContain(creator === "Multiple images" ? "image" : "right");
    const preview = page.locator(".exhibition-slideshow-current-preview");
    await expect(preview).toBeVisible();
    await expect(preview.getByText("Empty slide", { exact: true })).toBeVisible();
    if (creator === "Multiple images with text") {
      await expect(preview.getByText("Add editorial text", { exact: true })).toBeVisible();
    }
    await page.screenshot({ path: testInfo.outputPath("created-slide.png"), animations: "disabled" });
  });
}

test("bottom create appends slides while the sidebar icon inserts below the selected slide", async ({
  page,
}, testInfo) => {
  await openSlideshow(page, false);

  const createSlide = async (buttonName: string) => {
    await page.getByRole("button", { name: buttonName, exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Add content", exact: true });
    await dialog.getByRole("option", { name: "Multiple images", exact: true }).click();
    await expect(dialog).toBeHidden();
  };
  const downloadCanvasIds = async (name: string): Promise<string[]> => {
    const downloading = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download manifest", exact: true }).click();
    const path = testInfo.outputPath(`${name}.json`);
    await (await downloading).saveAs(path);
    const manifest = JSON.parse(await readFile(path, "utf8"));
    return manifest.items.map((canvas: { id: string }) => canvas.id);
  };
  const selectFirstSlide = async () => {
    await page.getByRole("article").first().getByRole("button").first().click();
    await expect(
      page.locator(".exhibition-slideshow-current-toolbar").getByRole("button", { name: "Previous", exact: true })
    ).toBeDisabled();
  };

  await createSlide("Create new slide");
  await createSlide("Create new slide");
  const originalIds = await downloadCanvasIds("original");
  expect(originalIds).toHaveLength(2);

  await selectFirstSlide();
  await createSlide("Create new slide");
  const appendedIds = await downloadCanvasIds("appended");
  expect(appendedIds).toHaveLength(3);
  expect(appendedIds.slice(0, 2)).toEqual(originalIds);

  await selectFirstSlide();
  await createSlide("Add new slide");
  const insertedIds = await downloadCanvasIds("inserted");
  expect(insertedIds).toHaveLength(4);
  expect(insertedIds.filter((_, index) => index !== 1)).toEqual(appendedIds);
});

test("Slideshow format in the Exhibition editor opens an empty slide in the preview and edit workspace", async ({
  page,
}, testInfo) => {
  const formats = await openExhibitionFormats(page);
  await formats.getByRole("button", { name: "Use Leeds exhibition slideshow format", exact: true }).click();
  await formats.getByRole("button", { name: "Start building", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Dismiss", exact: true }).click();
  await expect(page).toHaveURL(/\/editor\/[^/]+\/exhibition(?:\?.*)?$/);
  await page.getByRole("button", { name: "Create new slide", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add content", exact: true });
  await dialog.getByRole("option", { name: "Multiple images with text", exact: true }).click();
  await expect(dialog).toBeHidden();
  const toolbar = page.locator(".exhibition-slideshow-current-toolbar");
  await expect(toolbar).toBeVisible();
  const preview = page.locator('iframe[title="Exhibition preview"]');
  await expect(preview).toBeVisible();
  await toolbar.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(preview).toBeHidden();
  await expect(toolbar).toBeVisible();
  await toolbar.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(preview).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("template-workspace.png"), animations: "disabled" });
});

for (const editor of ["slideshow route", "Slideshow format"] as const) {
  test(`${editor} displays imported canvases without behavior`, async ({ page }, testInfo) => {
    const manifestId = "https://slideshow.test/manifest.json";
    const imageUrl = "https://slideshow.test/image.svg";
    const imageCanvasId = "https://slideshow.test/canvas/1";
    const manifest = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: manifestId,
      type: "Manifest",
      label: { en: ["Imported slides"] },
      items: [
        {
          id: imageCanvasId,
          type: "Canvas",
          label: { en: ["Image without behavior"] },
          width: 900,
          height: 600,
          items: [
            {
              id: `${imageCanvasId}/page`,
              type: "AnnotationPage",
              items: [
                {
                  id: `${imageCanvasId}/painting`,
                  type: "Annotation",
                  motivation: "painting",
                  target: imageCanvasId,
                  body: { id: imageUrl, type: "Image", format: "image/svg+xml", width: 900, height: 600 },
                },
              ],
            },
          ],
        },
        {
          id: "https://slideshow.test/canvas/2",
          type: "Canvas",
          label: { en: ["Empty without behavior"] },
          width: 900,
          height: 600,
          items: [],
        },
      ],
    };
    await page.route(manifestId, (route) => route.fulfill({ json: manifest }));
    await page.route(imageUrl, (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#2176ae"/><circle cx="450" cy="300" r="160" fill="#f6bd60"/></svg>',
      })
    );
    await page.goto("/");
    const dialog = page.getByRole("dialog", { name: "Open a Manifest from a URL", exact: true });
    await expect(async () => {
      if (!(await dialog.isVisible())) {
        await page.getByRole("button", { name: "Open manifest URL", exact: true }).click();
      }
      await expect(dialog).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 5000 });
    await dialog.getByPlaceholder("Paste Manifest URL", { exact: true }).fill(manifestId);
    await dialog.getByRole("button", { name: "Open", exact: true }).click();
    await page.waitForURL(/\/editor\/[^/]+$/);
    await page.goto(`${new URL(page.url()).pathname}/exhibition${editor === "slideshow route" ? "/slideshow" : ""}`);
    const formats = page.getByRole("dialog", { name: "Choose exhibition format", exact: true });
    if (editor === "Slideshow format") {
      await formats.getByRole("button", { name: "Use Leeds exhibition slideshow format", exact: true }).click();
      await formats.getByRole("button", { name: "Start building", exact: true }).click();
    } else {
      await formats.getByRole("button", { name: "Skip for now", exact: true }).click();
    }
    await page.getByRole("alertdialog").getByRole("button", { name: "Dismiss", exact: true }).click();
    if (editor === "Slideshow format") {
      await page.getByRole("article").filter({ hasText: "Image without behavior" }).getByRole("button").first().click();
      const toolbar = page.locator(".exhibition-slideshow-current-toolbar");
      const frame = page.locator('iframe[title="Exhibition preview"]');
      await expect(toolbar).toBeVisible();
      await expect(frame).toBeVisible();
      await toolbar.getByRole("button", { name: "Edit", exact: true }).click();
      await expect(frame).toBeHidden();
      await expect(page.locator(".atlas-container").last()).toBeVisible();
      await page.getByRole("article").filter({ hasText: "Empty without behavior" }).getByRole("button").first().click();
      await expect(toolbar).toContainText("Empty without behavior");
      await toolbar.getByRole("button", { name: "Preview", exact: true }).click();
      await expect(frame).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath("imported-workspace.png"), animations: "disabled" });
      return;
    }
    await page.getByRole("button", { name: "Slideshow", exact: true }).click();
    const preview = page.locator(".exhibition-slideshow-current-preview");
    await expect(preview).toBeVisible();
    const image = preview.locator("img");
    await expect(image).toHaveAttribute("src", imageUrl);
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBe(900);
    await expect(image.locator("..")).toHaveCSS("width", await preview.evaluate((node) => `${node.clientWidth}px`));
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(preview.getByText("Empty slide", { exact: true })).toBeVisible();
    await expect(page.locator(".exhibition-slideshow-current-toolbar")).toContainText("Empty without behavior");
    await page.getByRole("button", { name: "Previous", exact: true }).click();
    await expect(preview.locator("img")).toHaveAttribute("src", imageUrl);
    await page.screenshot({ path: testInfo.outputPath("imported-slide.png"), animations: "disabled" });
  });
}
