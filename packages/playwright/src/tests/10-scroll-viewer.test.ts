import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const viewer = process.env.EXHIBITION_VIEWER_URL || "http://localhost:5174";
test.skip(!process.env.EXHIBITION_VIEWER_URL, "Requires the local exhibition viewer and its scroll QA fixtures");
const fixtures = "/scroll-qa";
const kitchen = "kitchen-sink.json";
const edge = "navigation-edge-cases.json";

async function openScroll(
  page: Page,
  fixture: string,
  { route = "leeds/scroll", hash = "", params = {} as Record<string, string> } = {}
) {
  const query = new URLSearchParams({ manifest: `${fixtures}/${fixture}`, ...params });
  await page.goto(`${viewer}/preview/${route}?${query}${hash}`);
  await expect(page.locator(".exv-scroll")).toBeVisible();
}

test("renders the cover and the image, text, tour and media sections", async ({ page }) => {
  await openScroll(page, kitchen);
  await expect(page.getByRole("heading", { name: "Scrolling exhibition kitchen sink" })).toBeVisible();
  await expect(page.locator("#s0")).toContainText("Generated slideshow QA material");
  for (const index of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
    await expect(page.locator(`#s${index}`)).toBeAttached();
  }
  await expect(page.locator("#s5")).toContainText("End of the text-only article.");
  await expect(page.locator("#s6")).toContainText("First page stop");
  await expect(page.locator("#s6")).toContainText("Second page stop");
  const deckStop = page.locator("#s8").getByRole("button", { name: /linear step two/i });
  await deckStop.click();
  await expect(deckStop).toHaveAttribute("aria-current", "step");
  const manualTour = page.locator("#s7");
  await manualTour.getByRole("button", { name: "Next tour stop" }).click();
  await expect(manualTour.getByRole("heading", { name: "Linear step two" })).toBeVisible();
  await page.locator("#s9").getByRole("button", { name: "Open tour stop 1" }).click();
  await expect(page.locator("#s9").getByRole("complementary")).toContainText("First pin");
  await page.locator("#s9").getByRole("button", { name: "Close tour stop", exact: true }).click();
  await expect(page.locator("#s9").getByRole("complementary")).toHaveCount(0);
});

test("steps through image details across painting pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 610 });
  await openScroll(page, kitchen, {
    hash: "#s13",
    params: { "show-navigation-controls": "false" },
  });
  const details = page.locator("#s13");
  await expect(details.getByRole("heading", { name: "Landscape detail" })).toBeVisible();
  await details.getByRole("button", { name: "Next", exact: true }).click();
  await expect(details.getByRole("heading", { name: "Portrait detail" })).toBeVisible();
  await details.getByRole("button", { name: "Previous", exact: true }).click();
  await expect(details.getByRole("heading", { name: "Landscape detail" })).toBeVisible();
});

test("honors saved scroll settings and gives empty canvases working navigation targets", async ({ page }) => {
  await openScroll(page, edge);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
  await expect(page.locator(".exv-scroll-progress")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Next canvas or tour step" })).toHaveCount(0);
  await page.getByRole("button", { name: "Show table of contents" }).last().click();
  const contents = page.getByRole("dialog", { name: "Table of contents" });
  const links = contents.getByRole("link");
  await expect(links.filter({ hasText: "Final text section" })).toHaveAttribute("href", "#s4");
  await links.filter({ hasText: "Empty imported section" }).click();
  await expect(contents).toBeHidden();
  await expect(page.locator("#s1")).toContainText("Empty section");
  await expect(page.locator("#s1")).toBeInViewport();
  await page.locator("#s2").scrollIntoViewIfNeeded();
  await expect(page.locator("#s2 canvas").first()).toBeVisible();
});

test("opens a direct section link and uses the same position for button and keyboard navigation", async ({ page }) => {
  await openScroll(page, kitchen, { hash: "#s5" });
  await expect(page.locator("#s5")).toBeInViewport();
  await expect(page.locator("#s0")).not.toBeInViewport();
  const next = page.getByRole("link", { name: "Next canvas or tour step" });
  await expect(next).toHaveAttribute("href", "#s6");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#s6")).toBeInViewport();
  await expect(next).toHaveAttribute("href", /#s6-step-/);
  await next.click();
  await expect(page).toHaveURL(/#s6-step-/);
  const back = page.getByRole("link", { name: "Scroll to top" });
  await expect(back).toHaveCSS("opacity", "1");
  await back.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5);
});

test("uses the same scroll and selection options on the generic preview route", async ({ page }) => {
  await openScroll(page, kitchen, {
    route: "scroll",
    params: {
      canvas: `${viewer}${fixtures}/${kitchen}/canvas/info`,
      "show-title-block": "false",
      "show-progress-bar": "false",
      "show-progress-table-of-contents": "false",
      "show-navigation-controls": "false",
      "show-scroll-to-top": "false",
    },
  });
  await expect(page.locator("#s5")).toBeVisible();
  await expect(page.locator("#s0, #s1, #s4, #s6")).toHaveCount(0);
  await expect(page.locator(".exv-scroll-progress")).toHaveCount(0);
});

test("keeps long floating text readable at phone size and uses the selected side on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 610 });
  await openScroll(page, kitchen);
  const floating = page.locator("#s1");
  const lastParagraph = floating.getByText("End of the long editorial summary.", { exact: true });
  await expect(async () => {
    await lastParagraph.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect(lastParagraph).toBeInViewport({ timeout: 1000 });
  }).toPass({ timeout: 5000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.setViewportSize({ width: 1280, height: 800 });
  await openScroll(page, edge, { params: { "toc-placement": "none" } });
  const section = page.locator("#s3");
  const title = section.getByRole("heading", { name: "Explicit top-left overlay" });
  await expect(title).toBeVisible();
  const [titleBox, sectionBox] = await Promise.all([title.boundingBox(), section.boundingBox()]);
  expect(titleBox!.x - sectionBox!.x).toBeLessThan(sectionBox!.width / 2);
});

test("fits the pin tour overview and lets visitors scroll through it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openScroll(page, kitchen);
  const tour = page.locator("#s9");
  const pin = tour.getByRole("button", { name: "Open tour stop 1" });
  await tour.evaluate((section) => section.scrollIntoView({ behavior: "instant" }));
  await expect(pin).toBeInViewport();

  const overviewPosition = () =>
    pin.evaluate((button) => {
      const marker = button.getBoundingClientRect();
      const canvas = button.closest("#s9")!.querySelector("canvas")!.getBoundingClientRect();
      return Math.hypot(
        marker.left + marker.width / 2 - canvas.left - 288,
        marker.top + marker.height / 2 - canvas.top - 304
      );
    });
  // The first region is centered at (180, 165) on the 800 × 450 canvas.
  await expect.poll(overviewPosition).toBeLessThan(4);

  const start = await page.evaluate(() => scrollY);
  await page.mouse.move(1120, 520);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(start + 300);

  await tour.evaluate((section) => section.scrollIntoView({ behavior: "instant" }));
  await pin.click();
  await expect(tour.getByRole("complementary")).toContainText("First pin");
  await tour.getByRole("button", { name: "Exit", exact: true }).click();
  await expect(tour.getByRole("complementary")).toHaveCount(0);
  await expect.poll(overviewPosition).toBeLessThan(4);
  await page.mouse.move(1120, 520);
  await page.mouse.wheel(0, 820);
  await expect(page.locator("#s10")).toBeInViewport({ ratio: 0.5 });
});

test("gently snaps to audio slides and lets visitors continue scrolling", async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await openScroll(page, kitchen);
    const audio = page.locator("#s10");
    await expect(audio).toBeAttached();
    await audio.evaluate((section) => {
      window.scrollTo({ top: section.getBoundingClientRect().top + scrollY - 400, behavior: "instant" });
    });

    const distanceFromSnap = () =>
      audio.evaluate((section) => {
        const top = section.getBoundingClientRect().top;
        return Math.abs(top - parseFloat(getComputedStyle(section).scrollMarginTop));
      });
    await page.mouse.move(width - 90, 500);
    await page.mouse.wheel(0, 320);
    await expect.poll(distanceFromSnap).toBeLessThan(2);
    await expect
      .poll(() => audio.evaluate((section) => section.getBoundingClientRect().bottom - innerHeight))
      .toBeLessThan(2);
    await expect(audio.getByRole("button", { name: /play scroll audio/i })).toBeInViewport();

    await page.mouse.wheel(0, 850);
    await expect(page.locator("#s11")).toBeInViewport({ ratio: 0.5 });
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveCSS("scroll-snap-type", "none");
});

test("plays local audio and video and opens and closes the YouTube embed", async ({ page }) => {
  await page.route("https://www.youtube.com/embed/**", (route) => route.fulfill({ body: "YouTube test embed" }));
  await openScroll(page, kitchen);
  const audio = page.locator("#s10");
  await audio.scrollIntoViewIfNeeded();
  await audio.getByRole("button", { name: "Play Scroll audio with artwork" }).click();
  await expect
    .poll(async () => Number(await audio.getByRole("slider", { name: "Seek" }).inputValue()))
    .toBeGreaterThan(0);

  await page.locator("#s11").getByRole("button", { name: "Play media" }).click();
  const player = page.getByRole("dialog", { name: "Media player" });
  const video = player.locator("video");
  await expect.poll(() => video.evaluate((element) => element.videoWidth)).toBe(320);
  await video.evaluate((element) => element.play());
  await expect.poll(() => video.evaluate((element) => element.currentTime)).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect(video).toHaveCount(0);

  await page.locator("#s12").getByRole("button", { name: "Play media" }).click();
  await expect(player.getByTitle("YouTube video player")).toHaveAttribute("src", /\/embed\/aqz-KE-bpKQ/);
  await page.getByRole("button", { name: "Close media" }).click();
  await expect(player).toHaveCount(0);
});

async function importFixture(page: Page, fixture: string, route = "/exhibition") {
  const formatChooser = page.getByRole("dialog").filter({
    has: page.getByRole("heading", { name: "Choose exhibition format" }),
  });
  const hint = page.locator("body").filter({ hasNot: formatChooser }).getByRole("alertdialog", {
    name: "You can change the exhibition format again from this preview menu.",
  });
  await page.addLocatorHandler(hint, async () => hint.getByRole("button", { name: "Dismiss", exact: true }).click());
  await page.goto("/");
  const importer = page.getByRole("dialog", { name: "Open a Manifest from a URL" });
  await expect(async () => {
    if (!(await importer.isVisible())) await page.getByRole("button", { name: "Open manifest URL" }).click();
    await expect(importer).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 5000 });
  await importer.getByPlaceholder("Paste Manifest URL", { exact: true }).fill(`${viewer}${fixtures}/${fixture}`);
  await importer.getByRole("button", { name: "Open", exact: true }).click();
  await page.waitForURL(/\/editor\/[^/]+$/);
  await page.goto(`${new URL(page.url()).pathname}${route}`);
}

test("imports a scrolling exhibition, edits the fixed cover and exports the changes", async ({ page }, testInfo) => {
  await importFixture(page, kitchen);
  const heading = page.getByText("Fixed opening cover", { exact: true }).first();
  await expect(heading).toBeVisible();
  await page.getByRole("article").filter({ hasText: "Fixed opening cover" }).getByRole("button").first().click();
  await page.getByRole("tab", { name: "Layout", exact: true }).click();
  const fixed = page.getByRole("checkbox", { name: "Keep image fixed while scrolling" });
  await expect(fixed).toBeChecked();
  await fixed.uncheck();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download manifest", exact: true }).click();
  const path = testInfo.outputPath("scroll-round-trip.json");
  await (await downloading).saveAs(path);
  const exported = JSON.parse(await readFile(path, "utf8"));
  expect(exported.behavior).toContain("template-leeds-exhibition-scroll");
  expect(exported.items[0].behavior).toContain("splash");
  expect(exported.items[0].behavior).not.toContain("fixed");
  expect(exported.items[6].annotations).toHaveLength(2);
  expect(exported.items[10].accompanyingCanvas.type).toBe("Canvas");
});

test("shows the compiled scroll preview and applies saved settings from the editor", async ({ page }) => {
  await importFixture(page, edge);
  const format = page.getByRole("button", { name: "Use Scrolling story format", exact: true });
  await expect(async () => {
    if (!(await format.isVisible())) {
      await page.getByRole("button", { name: "Choose preview" }).click({ timeout: 1000 });
      await page.getByRole("menuitem", { name: "Change exhibition format" }).click({ timeout: 1000 });
    }
    await expect(format).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 5000 });
  await format.click();
  await page
    .getByRole("navigation", { name: "Editor panels" })
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  const iframe = page.locator('iframe[title="Exhibition preview"]').first();
  await expect(iframe).toHaveAttribute("src", /\/preview\/delft\/scroll/);
  const frame = iframe.contentFrame();
  await expect(frame.locator(".exv-scroll")).toBeVisible();
  await expect(frame.getByRole("heading", { level: 1 })).toHaveCount(0);
  await expect(frame.locator(".exv-scroll-progress")).toHaveCount(0);
  const src = await iframe.getAttribute("src");
  await page
    .getByRole("button", { name: /Preview.*Scroll/ })
    .first()
    .click();
  const progress = page.getByRole("checkbox", { name: "Show progress bar", exact: true });
  await expect(progress).not.toBeChecked();
  await progress.check();
  await expect(frame.locator(".exv-scroll-progress")).toBeVisible();
  await expect(iframe).toHaveAttribute("src", src!);
});

test("opens the live viewer from the dedicated scroll editor route", async ({ page }) => {
  await importFixture(page, kitchen, "/exhibition/scroll");
  await page
    .getByRole("navigation", { name: "Editor panels" })
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  const iframe = page.locator('iframe[title="Exhibition preview"]').first();
  await expect(iframe).toHaveAttribute("src", /\/preview\/leeds\/scroll/);
  await expect(iframe.contentFrame().locator("#s0")).toContainText("Scrolling exhibition kitchen sink");
});

test("opens header contents, updates progress, and returns to the top", async ({ page }) => {
  await openScroll(page, kitchen, { route: "delft/scroll" });
  await page.locator(".exv-scroll-progress").getByRole("button").click();
  const contents = page.getByRole("dialog", { name: "Table of contents" });
  await contents.getByRole("link", { name: "Long text section", exact: true }).click();
  await expect(contents).toBeHidden();
  await expect(page.locator("#s5")).toBeInViewport();
  const progress = page.locator(".exv-scroll-progress div[style*='scaleX']");
  await expect
    .poll(() => progress.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a))
    .toBeGreaterThan(0);
  await page.getByRole("link", { name: "Scroll to top" }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5);
});

test("keeps panel information buttons behind the scroll header", async ({ page }) => {
  await openScroll(page, kitchen, { route: "delft/scroll", hash: "#s1" });
  const header = page.locator(".exv-scroll-progress");
  const info = page.getByRole("button", { name: "Show information about Long floating editorial" });
  await expect(info).toBeVisible();

  const headerBox = (await header.boundingBox())!;
  await info.evaluate(
    (button, headerCenter) => {
      const { top, height } = button.getBoundingClientRect();
      window.scrollBy({ top: top + height / 2 - headerCenter, behavior: "instant" });
    },
    headerBox.y + headerBox.height / 2
  );

  await expect
    .poll(() =>
      info.evaluate((button) => {
        const { left, top, width, height } = button.getBoundingClientRect();
        const hit = document.elementFromPoint(left + width / 2, top + height / 2);
        return Boolean(hit?.closest(".exv-scroll-progress"));
      })
    )
    .toBe(true);

  await page.evaluate(() => window.scrollBy({ top: -64, behavior: "instant" }));
  await info.click();
  await expect(page.getByRole("dialog", { name: "Information about Long floating editorial" })).toContainText(
    "Long editorial and metadata"
  );
});

test("keeps the tour highlight clear of captions on both sides", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openScroll(page, kitchen, {
    hash: "#s6",
    params: { "tour-caption-clearance": "true" },
  });
  const tour = page.locator("#s6");
  await expect(tour.locator("canvas").first()).toBeVisible();

  for (const { index, side } of [
    { index: 1, side: "right" },
    { index: 2, side: "left" },
  ]) {
    const caption = tour.locator("[data-scroll-tour-caption]").nth(index);
    await expect(caption).toHaveAttribute("data-scroll-tour-caption", side);
    await tour.evaluate((element, step) => {
      const top = element.getBoundingClientRect().top + scrollY + (step + 0.95) * innerHeight;
      window.scrollTo({ top, behavior: "instant" });
    }, index);
    await expect
      .poll(() =>
        caption.evaluate((element, captionSide) => {
          // Atlas positions the region highlight as an HTML overlay.
          const highlights = element
            .closest("#s6")
            ?.querySelectorAll<HTMLElement>(".image div[style*='transform: translate']");
          const highlight = Array.from(highlights ?? []).find((box) => Number(box.style.opacity) > 0.95);
          if (!highlight) return 0;
          const region = highlight.getBoundingClientRect();
          const panel = element.getBoundingClientRect();
          return captionSide === "right" ? panel.left - region.right : region.left - panel.right;
        }, side)
      )
      .toBeGreaterThan(12);
  }
});

test("caption clearance caches caption sizes during scrolling", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const metrics = { captionObservations: 0, captionRectReads: 0 };
    Object.assign(window, { scrollTourMetrics: metrics });

    const measure = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function () {
      if (this.hasAttribute("data-scroll-tour-caption")) metrics.captionRectReads++;
      return measure.call(this);
    };
    const observe = ResizeObserver.prototype.observe;
    ResizeObserver.prototype.observe = function (element, options) {
      if (element.hasAttribute("data-scroll-tour-caption")) metrics.captionObservations++;
      return observe.call(this, element, options);
    };
  });

  const samples = [];
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: width === 1280 ? 800 : 610 });
    for (const enabled of [false, true]) {
      await openScroll(page, kitchen, {
        params: { "tour-caption-clearance": String(enabled) },
      });
      const tour = page.locator("#s6");
      await tour.scrollIntoViewIfNeeded();
      await expect(tour.locator("canvas").first()).toBeVisible();
      const sample = await tour.evaluate(async (element) => {
        const metrics = (
          window as Window & {
            scrollTourMetrics: { captionObservations: number; captionRectReads: number };
          }
        ).scrollTourMetrics;
        const start = element.getBoundingClientRect().top + scrollY;
        const span = element.clientHeight - innerHeight;
        const intervals: number[] = [];
        await new Promise<void>((resolve) => {
          let first = 0;
          let previous = 0;
          function frame(now: number) {
            if (!first) first = now;
            if (previous) intervals.push(now - previous);
            previous = now;
            const progress = Math.min(1, (now - first) / 1500);
            window.scrollTo({ top: start + progress * span, behavior: "instant" });
            if (progress < 1) requestAnimationFrame(frame);
            else resolve();
          }
          requestAnimationFrame(frame);
        });
        const sorted = intervals.slice().sort((a, b) => a - b);
        return {
          frames: intervals.length,
          p95ms: Number(sorted[Math.floor((sorted.length - 1) * 0.95)]?.toFixed(1)),
          framesOver32ms: intervals.filter((interval) => interval > 32).length,
          ...metrics,
        };
      });
      expect(sample.captionRectReads).toBe(0);
      if (enabled) expect(sample.captionObservations).toBe(await tour.locator("[data-scroll-tour-caption]").count());
      else expect(sample.captionObservations).toBe(0);
      samples.push({ width, enabled, ...sample });
    }
  }
  console.log("Scroll tour frame samples", JSON.stringify(samples));
  await testInfo.attach("Scroll tour frame samples", {
    body: JSON.stringify(samples, null, 2),
    contentType: "application/json",
  });
});
