import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import recipe from "../fixtures/cookbook/0219-using-caption-file/manifest.json";
import { normalizeCookbookManifest } from "../pom/compare-cookbook";
import { Homepage } from "../pom/homepage";
import { ManifestPresetPage } from "../pom/manifest-preset-page";

const canvas = recipe.items[0];
const video = canvas.items[0].items[0].body;
const captions = canvas.annotations[0].items[0].body;

test(
  "0219: create a video canvas with WebVTT captions from scratch",
  { tag: "@cookbook" },
  async ({ page }, testInfo) => {
    testInfo.annotations.push({
      type: "recipe",
      description: "https://iiif.io/api/cookbook/recipe/0219-using-caption-file/",
    });
    // Create every resource through the UI; the reference Manifest is only used for the final comparison.
    const homepage = new Homepage(page);
    await homepage.goto();
    await homepage.createNewManifestButton.click();
    const manifestPage = new ManifestPresetPage(page);
    await manifestPage.waitForPage();
    await page.getByRole("tab", { name: "Descriptive", exact: true }).click();
    await page.getByRole("textbox", { name: "Label (en)", exact: true }).fill(recipe.label.en[0]);
    await page.getByRole("textbox", { name: "Label (en)", exact: true }).blur();
    await expect(manifestPage.manifestHeading).toHaveText(recipe.label.en[0]);

    await page.getByRole("button", { name: "Start adding content", exact: true }).click();
    await expect(page.getByRole("option", { name: /WebVTT captions/ })).toHaveCount(0);
    await page.getByRole("option", { name: "Video Video annotation", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Add content", exact: true });
    await dialog.getByRole("textbox", { name: "URL", exact: true }).fill(video.id);
    await expect(dialog.getByRole("spinbutton", { name: /^Duration/ })).toHaveValue(/572\.03/, { timeout: 15_000 });
    await expect(dialog.getByRole("spinbutton", { name: /^Width/ })).toHaveValue(String(video.width));
    await expect(dialog.getByRole("spinbutton", { name: /^Height/ })).toHaveValue(String(video.height));
    // The browser reports more precision than the duration published in the recipe.
    await dialog.getByRole("spinbutton", { name: /^Duration/ }).fill(String(video.duration));
    // This recipe deliberately has no Canvas label.
    await dialog.getByRole("textbox", { name: "Label (en)", exact: true }).fill("");
    await dialog.getByRole("textbox", { name: "Label (en)", exact: true }).blur();
    await dialog.getByRole("button", { name: "Add video", exact: true }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole("button", { name: "More tabs", exact: true }).click();
    await page.getByRole("menuitem", { name: "Structure", exact: true }).click();
    await page.getByRole("button", { name: "Add Annotations", exact: true }).click();
    await page.getByRole("option", { name: /WebVTT captions/ }).click();
    await expect(dialog.getByText("Link an existing WebVTT (.vtt) file", { exact: false })).toBeVisible();
    const url = dialog.getByRole("textbox", { name: "WebVTT file URL", exact: true });
    await url.fill("ftp://example.org/captions.vtt");
    await dialog.getByRole("button", { name: "Add captions", exact: true }).click();
    await expect(dialog).toBeVisible();
    expect(await url.evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false);
    await url.fill(captions.id);
    await dialog.getByRole("textbox", { name: "Label (en)", exact: true }).fill(captions.label.en[0]);
    await dialog.getByRole("textbox", { name: "Label (en)", exact: true }).blur();
    await dialog.getByRole("textbox", { name: "Language (BCP 47 code)", exact: true }).fill(captions.language);
    await dialog.getByRole("button", { name: "Add captions", exact: true }).click();
    await expect(dialog).toBeHidden();

    // Include a persistence round-trip before checking the complete exported recipe.
    await page.reload();
    await manifestPage.waitForPage();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download manifest", exact: true }).click();
    const download = await downloadPromise;
    const outputPath = testInfo.outputPath("actual.json");
    await download.saveAs(outputPath);
    const actual = JSON.parse(await readFile(outputPath, "utf8"));
    for (const [name, value] of Object.entries({
      expected: recipe,
      actual,
      "expected-normalized": normalizeCookbookManifest(recipe),
      "actual-normalized": normalizeCookbookManifest(actual),
    })) {
      await testInfo.attach(`${name}.json`, { body: JSON.stringify(value, null, 2), contentType: "application/json" });
    }
    expect(normalizeCookbookManifest(actual)).toEqual(normalizeCookbookManifest(recipe));
  }
);
