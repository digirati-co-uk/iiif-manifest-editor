import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const viewer = process.env.EXHIBITION_VIEWER_URL || "http://localhost:5174";
test.skip(!process.env.EXHIBITION_VIEWER_URL, "Requires the local exhibition viewer and its slideshow QA fixtures");
const fixturePath = "/slideshow-qa";
const kitchenSink = "kitchen-sink.json";
const edgeCases = "import-edge-cases.json";

const activeSlide = (page: Page) => page.locator(".delft-slide:not([inert])");
const currentTitle = (page: Page) =>
  page.locator(".delft-toc-bar").getByRole("button", { name: "Show table of contents" }).first();
const nextSlide = (page: Page) => page.getByRole("button", { name: "Next slide", exact: true });

async function openViewer(
  page: Page,
  fixture: string,
  options: { canvas?: string; hash?: string; theme?: string } = {}
) {
  const search = new URLSearchParams({ manifest: `${fixturePath}/${fixture}` });
  if (options.canvas) search.set("canvas", `${viewer}${fixturePath}/${fixture}/canvas/${options.canvas}`);
  if (options.theme) search.set("theme", options.theme);
  await page.goto(`${viewer}/preview/leeds/slideshow?${search}${options.hash || ""}`);
}

test("navigates the mixed-media slideshow and makes only the active slide interactive", async ({ page }) => {
  // Exercise the viewer's embed markup independently of third-party availability and tracking consent.
  await page.route("https://www.youtube.com/embed/**", (route) => route.fulfill({ body: "YouTube test embed" }));
  await openViewer(page, kitchenSink);
  await expect(activeSlide(page)).toContainText("Generated slideshow QA material");
  await expect(page.getByRole("button", { name: "Previous slide" })).toBeDisabled();

  await page.keyboard.press("ArrowRight");
  await expect(activeSlide(page)).toContainText("End of the long editorial summary.");
  await activeSlide(page).getByRole("button", { name: "Show information about Image right editorial test" }).click();
  await expect(page.getByRole("dialog")).toContainText("Long editorial and metadata");
  await page.keyboard.press("Escape");

  for (const title of [
    "Left editorial",
    "Top editorial",
    "Bottom editorial",
    "Floating editorial",
    "Positioned images",
    "Image choices",
    "Long editorial only",
    "Linear tour",
  ]) {
    await nextSlide(page).click();
    await expect(currentTitle(page)).toHaveText(title);
    await expect(activeSlide(page)).toHaveCount(1);
  }
  await expect(activeSlide(page)).toContainText("Linear tour");
  await nextSlide(page).click();
  await expect(activeSlide(page)).toContainText("First stop");
  await nextSlide(page).click();
  await expect(activeSlide(page)).toContainText("Second stop");
  await nextSlide(page).click();
  await expect(currentTitle(page)).toHaveText("Non-linear pin tour");
  await activeSlide(page).getByRole("button", { name: "Open tour stop 1" }).click();
  await expect(activeSlide(page)).toContainText("First pin");

  await nextSlide(page).click();
  await expect(currentTitle(page)).toHaveText("Audio with artwork");
  await activeSlide(page).getByRole("button", { name: /play/i }).first().click();
  const seek = activeSlide(page).getByRole("slider", { name: "Seek" });
  await expect.poll(async () => Number(await seek.inputValue())).toBeGreaterThan(0);
  await nextSlide(page).click();
  await expect.poll(() => page.locator("audio").evaluate((element) => (element as HTMLAudioElement).paused)).toBe(true);
  await expect(currentTitle(page)).toHaveText("Local video");
  const video = activeSlide(page).locator("video");
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).videoWidth)).toBe(320);
  await video.evaluate((element) => (element as HTMLVideoElement).play());
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(0);
  await nextSlide(page).click();
  await expect(page.locator("video")).toHaveCount(0);
  await expect(activeSlide(page).getByTitle("YouTube video player")).toHaveAttribute("src", /\/embed\/aqz-KE-bpKQ/);
  await page.getByRole("button", { name: "Restart slideshow" }).click();
  await expect(activeSlide(page)).toContainText("Generated slideshow QA material");
});

test("keeps Image only slides free of editorial text, including the default floating title", async ({ page }) => {
  await openViewer(page, kitchenSink, { canvas: "gallery" });
  const slide = activeSlide(page);
  await expect(slide.locator("canvas").first()).toBeVisible();
  await expect(slide.getByText("Image choices", { exact: true })).toBeHidden();

  await openViewer(page, edgeCases, { canvas: "plain" });
  await expect(slide.locator("canvas").first()).toBeVisible();
  await expect(slide.getByText("Image without layout behavior", { exact: true })).toBeHidden();

  await page.route(`**${fixturePath}/${kitchenSink}`, async (route) => {
    const manifest = await (await route.fetch()).json();
    const canvas = manifest.items.find((item: { id: string }) => item.id.endsWith("/gallery"));
    canvas.behavior.push("float-top-left");
    canvas.summary = { en: ["Previously saved overlay"] };
    await route.fulfill({ json: manifest });
  });
  await openViewer(page, kitchenSink, { canvas: "gallery" });
  await expect(slide.locator("canvas").first()).toBeVisible();
  await expect(slide.getByText("Previously saved overlay", { exact: true })).toBeHidden();

  await openViewer(page, edgeCases, { canvas: "titles" });
  await expect(
    slide.getByText("Title without an editorial summary", { exact: true }).filter({ visible: true })
  ).toBeVisible();
});

test("honors a direct canvas link and routes reordered contents to the correct manifest canvas", async ({ page }) => {
  await openViewer(page, edgeCases, { hash: "#s1" });
  await expect(currentTitle(page)).toHaveText("Image without layout behavior");
  await currentTitle(page).click();
  const toc = page.getByRole("dialog", { name: "Table of contents" });
  await toc.getByRole("link", { name: "Tour across two annotation pages" }).click();
  await expect(currentTitle(page)).toHaveText("Tour across two annotation pages");
  await nextSlide(page).click();
  await expect(activeSlide(page)).toContainText("First page stop");
  await nextSlide(page).click();
  await expect(activeSlide(page)).toContainText("Second page stop");
  await page.getByRole("button", { name: "Restart slideshow" }).click();
  await expect(activeSlide(page)).toContainText("Empty slide");
  await currentTitle(page).click();
  await toc.getByRole("link", { name: "Tour across two annotation pages" }).click();
  await expect(currentTitle(page)).toHaveText("Tour across two annotation pages");
});

test("uses the current canvas duration and continues through more than one timed slide", async ({ page }) => {
  await page.clock.install();
  await openViewer(page, kitchenSink);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.clock.runFor(1500);
  await expect(currentTitle(page)).toHaveText("Opening background");
  await page.clock.runFor(600);
  await expect(currentTitle(page)).toHaveText("Image right editorial test");
  await page.clock.runFor(2200);
  await expect(currentTitle(page)).toHaveText("Image right editorial test");
  await page.clock.runFor(1000);
  await expect(currentTitle(page)).toHaveText("Left editorial");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.fastForward(6000);
  await expect(currentTitle(page)).toHaveText("Left editorial");
});

test("keeps long editorial text scrollable at phone size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 610 });
  await openViewer(page, kitchenSink, { canvas: "right" });
  const panel = activeSlide(page).locator(".exhibition-info-block");
  await expect(panel).toBeVisible();
  const bounds = await panel.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(610 - 56);
  expect(
    await panel.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
      return element.scrollTop;
    })
  ).toBeGreaterThan(0);
  await openViewer(page, kitchenSink, { canvas: "text", theme: "minimal" });
  const text = activeSlide(page).getByText("End of the text-only article.");
  await text.scrollIntoViewIfNeeded();
  await expect(text).toBeInViewport();
});

test("points the editorial arrow toward the image on desktop and mobile", async ({ page }) => {
  for (const [canvas, desktop, mobile] of [
    ["top", [0, 1], [0, 1]],
    ["bottom", [0, -1], [0, -1]],
    ["left", [1, 0], [0, -1]],
    ["right", [-1, 0], [0, -1]],
  ] as const) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openViewer(page, kitchenSink, { canvas });
    const arrow = activeSlide(page).locator(".exhibition-info-block").locator("..").locator('svg[aria-hidden="true"]');
    const direction = () =>
      arrow.evaluate((element) => {
        const transform = new DOMMatrix(getComputedStyle(element).transform);
        // The SVG path points left before CSS rotation.
        const point = transform.transformPoint({ x: -1, y: 0 });
        return [Math.round(point.x), Math.round(point.y)];
      });
    await expect.poll(direction).toEqual(desktop);
    await page.setViewportSize({ width: 390, height: 610 });
    await expect.poll(direction).toEqual(mobile);
  }
});

test("restores a saved text region in standalone slideshow preview", async ({ page }) => {
  const canvas = `${viewer}${fixturePath}/${edgeCases}/canvas/background`;
  const search = new URLSearchParams({ manifest: `${fixturePath}/${edgeCases}`, canvas, minimal: "true" });
  await page.goto(`${viewer}/preview/slideshow?${search}`);
  const stage = activeSlide(page);
  const panel = stage.locator(".exhibition-info-block").locator("..");
  await expect(panel).toContainText("Position the text lower on the stage.");
  const stageBox = await stage.boundingBox();
  const panelBox = await panel.boundingBox();
  expect((panelBox!.x - stageBox!.x) / stageBox!.width).toBeCloseTo(125 / 800, 2);
  expect((panelBox!.y - stageBox!.y) / stageBox!.height).toBeCloseTo(230 / 450, 2);
  expect(panelBox!.width / stageBox!.width).toBeCloseTo(425 / 800, 2);
});

async function importSlideshow(page: Page, fixture: string) {
  await page.goto("/");
  const importer = page.getByRole("dialog", { name: "Open a Manifest from a URL" });
  await expect(async () => {
    if (!(await importer.isVisible())) await page.getByRole("button", { name: "Open manifest URL" }).click();
    await expect(importer).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 5000 });
  await importer.getByPlaceholder("Paste Manifest URL", { exact: true }).fill(`${viewer}${fixturePath}/${fixture}`);
  await importer.getByRole("button", { name: "Open", exact: true }).click();
  await page.waitForURL(/\/editor\/[^/]+$/);
  await page.goto(`${new URL(page.url()).pathname}/exhibition`);
  await page.getByRole("button", { name: "Choose preview", exact: true }).click();
  await page.getByRole("menuitem", { name: "Change exhibition format" }).click();
  const format = page.getByRole("dialog", { name: "Choose exhibition format" });
  await format.getByRole("button", { name: "Use Leeds exhibition slideshow format" }).click();
  await expect(format).toBeHidden();
}

const item = (page: Page, title: string) =>
  page.getByRole("article").filter({ hasText: title }).getByRole("button").first();

test("edits an imported slideshow, updates the live viewer, and preserves the saved manifest", async ({
  page,
}, testInfo) => {
  await importSlideshow(page, kitchenSink);
  await item(page, "Image right editorial test").click();
  await page.getByRole("tab", { name: "Layout", exact: true }).click();
  await page.getByLabel("Slide duration (seconds)", { exact: true }).fill("4");
  const toolbar = page.locator(".exhibition-slideshow-current-toolbar");
  const iframe = page.locator('iframe[title="Exhibition preview"]');
  if (!(await iframe.isVisible())) await toolbar.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(iframe).toHaveAttribute("src", /localhost:5174\/preview\/leeds\/slideshow/);
  const frame = iframe.contentFrame();
  await expect(frame.locator(".delft-slide:not([inert])")).toContainText("End of the long editorial summary.");
  const editorial = frame.locator(".delft-slide:not([inert]) .exhibition-info-block").locator("../..");
  await page.getByRole("button", { name: "Text above image", exact: true }).click();
  await expect(editorial).toHaveCSS("flex-direction", "column-reverse");
  await page.getByRole("button", { name: "Text below image", exact: true }).click();
  await expect(editorial).toHaveCSS("flex-direction", "column");
  await item(page, "Left editorial").click();
  await expect(frame.locator(".delft-slide:not([inert])")).toContainText("French and English metadata");

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download manifest", exact: true }).click();
  const path = testInfo.outputPath("editor-round-trip.json");
  await (await downloading).saveAs(path);
  const exported = JSON.parse(await readFile(path, "utf8"));
  const source = await (await page.request.get(`${viewer}${fixturePath}/${kitchenSink}`)).json();
  expect(exported.items.map((canvas: { id: string }) => canvas.id)).toEqual(
    source.items.map((canvas: { id: string }) => canvas.id)
  );
  expect(exported.items[1].duration).toBe(4);
  expect(exported.items[1].behavior).toContain("bottom");
  expect(exported.items[2].summary.fr).toEqual(source.items[2].summary.fr);
  expect(exported.items[11].accompanyingCanvas.type).toBe("Canvas");
});

test("exposes tour annotations from every annotation page in the editor", async ({ page }) => {
  await importSlideshow(page, edgeCases);
  await item(page, "Tour across two annotation pages").click();
  await page.getByRole("tab", { name: "Tour steps", exact: true }).click();
  const panel = page.getByRole("tabpanel", { name: "Tour steps" });
  await expect(panel).toContainText("First page stop");
  await expect(panel).toContainText("Second page stop");
});

test("changes the live template and persists it across reload", async ({ page }, testInfo) => {
  await importSlideshow(page, kitchenSink);
  await item(page, "Image right editorial test").click();
  const frame = page.locator('iframe[title="Exhibition preview"]');
  await expect(frame).toHaveAttribute("src", /\/preview\/leeds\/slideshow/);

  await page.getByRole("button", { name: "Choose preview" }).click();
  await page.getByRole("menuitem", { name: "Change exhibition format" }).click();
  await page.getByRole("button", { name: "Use Slideshow format", exact: true }).click();
  await expect(frame).toHaveAttribute("src", /\/preview\/delft\/slideshow/);
  await expect(frame.contentFrame().locator(".delft-slide:not([inert])")).toContainText("Image right editorial test");

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download manifest", exact: true }).click();
  const path = testInfo.outputPath("changed-template.json");
  await (await downloading).saveAs(path);
  const exported = JSON.parse(await readFile(path, "utf8"));
  expect(exported.behavior).toContain("template-exhibition-slideshow");
  expect(exported.behavior).not.toContain("template-leeds-exhibition-slideshow");

  await page.reload();
  await item(page, "Image right editorial test").click();
  await expect(frame).toHaveAttribute("src", /\/preview\/delft\/slideshow/);

  await page.getByRole("button", { name: "Choose preview" }).click();
  await page.getByRole("menuitem", { name: "Change exhibition format" }).click();
  await page.getByRole("button", { name: "Use Scrolling story format", exact: true }).click();
  await expect(frame).toHaveAttribute("src", /\/preview\/delft\/scroll/);
});

test("moves editorial overlay in the layout diagram, thumbnail and live viewer", async ({ page }, testInfo) => {
  await importSlideshow(page, kitchenSink);
  await item(page, "Floating editorial").click();
  const frame = page.locator('iframe[title="Exhibition preview"]');
  const liveOverlay = frame.contentFrame().locator(".delft-slide:not([inert]) .exhibition-info-block").locator("..");
  await expect(liveOverlay).toContainText("Floating panel over a cover image");
  await expect(liveOverlay).toHaveCSS("bottom", "8px");
  await page.getByRole("tab", { name: "Layout", exact: true }).click();
  await page.getByRole("button", { name: "Top left", exact: true }).click();
  await expect(page.getByRole("button", { name: "Top left", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(liveOverlay).toHaveCSS("top", "8px");
  await expect(liveOverlay).toHaveCSS("left", "8px");
  const diagramOverlay = page.getByRole("button", { name: "Edit slide text", exact: true });
  await expect(diagramOverlay).toHaveCSS("position", "absolute");
  await expect(diagramOverlay).toHaveCSS("top", "4px");
  const thumbnail = page.getByRole("article").filter({ hasText: "Floating editorial" });
  const summary = thumbnail.getByText("Floating panel over a cover image", { exact: true });
  const [card, text] = await Promise.all([thumbnail.boundingBox(), summary.boundingBox()]);
  expect(text!.x - card!.x).toBeLessThan(card!.width / 4);

  await page.getByRole("button", { name: "Bottom right", exact: true }).click();
  await expect(diagramOverlay).toHaveCSS("bottom", "4px");
  await expect(liveOverlay).toHaveCSS("bottom", "8px");
  const moved = await summary.boundingBox();
  expect(moved!.x).toBeGreaterThan(text!.x);
  expect(moved!.y).toBeGreaterThan(text!.y);

  await page.getByRole("button", { name: "No overlay", exact: true }).click();
  await page.getByRole("button", { name: "Image only", exact: true }).click();
  await expect(liveOverlay).toBeHidden();
  await expect(
    frame.contentFrame().locator(".delft-slide:not([inert])").getByText("Floating editorial", { exact: true })
  ).toBeHidden();
  await page.getByRole("checkbox", { name: "Overlay text on the image" }).check();
  await page.getByRole("button", { name: "Bottom right", exact: true }).click();
  await expect(liveOverlay).toBeVisible();
  await expect(liveOverlay).toHaveCSS("bottom", "8px");

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download manifest", exact: true }).click();
  const path = testInfo.outputPath("moved-overlay.json");
  await (await downloading).saveAs(path);
  const exported = JSON.parse(await readFile(path, "utf8"));
  const exportedBehavior = exported.items.find((canvas: { id: string }) => canvas.id.endsWith("/floating")).behavior;
  expect(exportedBehavior).toContain("right");
  expect(exportedBehavior.filter((flag: string) => flag.startsWith("float-"))).toEqual(["float-bottom-right"]);
});

test("zooms into tour pins and back without replacing the image viewer", async ({ page }) => {
  await openViewer(page, kitchenSink, { canvas: "pin" });
  const stage = activeSlide(page);
  const first = stage.getByRole("button", { name: /^(Open|Close) tour stop 1$/ });
  await expect(stage.getByRole("heading", { name: "Non-linear pin tour" })).toBeHidden();
  const canvas = await stage.locator("canvas").first().elementHandle();
  const overviewX = await first.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return Math.round(box.x + box.width / 2);
  });
  const movement = first.evaluate(
    (element) =>
      new Promise<number[]>((resolve) => {
        const samples = new Set<number>();
        const start = performance.now();
        function frame(now: number) {
          const box = element.getBoundingClientRect();
          samples.add(Math.round(box.x + box.width / 2));
          if (now - start < 850) requestAnimationFrame(frame);
          else resolve([...samples]);
        }
        requestAnimationFrame(frame);
      })
  );

  await first.click();
  await expect(stage.getByRole("complementary")).toContainText("First pin");
  const positions = await movement;
  expect(await canvas.evaluate((element) => element.isConnected)).toBe(true);
  expect(positions.length).toBeGreaterThan(2);
  await stage.getByRole("button", { name: "Exit", exact: true }).click();
  await expect(stage.getByRole("complementary")).toHaveCount(0);
  await expect
    .poll(async () => {
      const currentX = await first.evaluate((element) => {
        const box = element.getBoundingClientRect();
        return Math.round(box.x + box.width / 2);
      });
      return Math.abs(currentX - overviewX);
    })
    .toBeLessThanOrEqual(2);

  await stage.getByRole("button", { name: "Open tour stop 2" }).click();
  await expect(stage.getByRole("complementary")).toContainText("Second pin");
  await stage.getByRole("button", { name: "Close tour stop", exact: true }).click();
  expect(await canvas.evaluate((element) => element.isConnected)).toBe(true);
});

test("keeps the selected tour pin visible above the details on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 610 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openViewer(page, kitchenSink, { canvas: "pin" });
  const stage = activeSlide(page);
  await stage.getByRole("button", { name: "Open tour stop 1" }).click();
  const pin = stage.getByRole("button", { name: "Close tour stop 1" });
  const panel = stage.getByRole("complementary");
  await expect(panel).toContainText("First pin");
  const mapBox = (await stage.boundingBox())!;
  const panelBox = (await panel.boundingBox())!;
  expect(panelBox.height).toBeLessThanOrEqual(mapBox.height / 2);
  await expect
    .poll(async () => {
      const pinBox = (await pin.boundingBox())!;
      return pinBox.y + pinBox.height;
    })
    .toBeLessThan(panelBox.y);
  await pin.click();
  await expect(panel).toHaveCount(0);
});
