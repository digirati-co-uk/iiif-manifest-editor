import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import recipe from "../fixtures/cookbook/0024-book-4-toc/manifest.json";
import info1 from "../fixtures/cookbook/0024-book-4-toc/info-1.json";
import info2 from "../fixtures/cookbook/0024-book-4-toc/info-2.json";
import info3 from "../fixtures/cookbook/0024-book-4-toc/info-3.json";
import info4 from "../fixtures/cookbook/0024-book-4-toc/info-4.json";
import info5 from "../fixtures/cookbook/0024-book-4-toc/info-5.json";
import info6 from "../fixtures/cookbook/0024-book-4-toc/info-6.json";
import { normalizeCookbookManifest } from "../pom/compare-cookbook";
import { Homepage } from "../pom/homepage";
import { ManifestPresetPage } from "../pom/manifest-preset-page";

const services = [info1, info2, info3, info4, info5, info6];
const toc = recipe.structures[0];
const [firstWork, secondWork] = toc.items;

test("Cookbook comparison preserves range nesting, labels and canvas membership", () => {
  const renamed = JSON.parse(
    JSON.stringify(recipe).replaceAll("https://iiif.io/api/cookbook/recipe/0024-book-4-toc/", "https://editor.test/")
  );
  const expected = normalizeCookbookManifest(recipe);
  expect(normalizeCookbookManifest(renamed)).toEqual(expected);

  const firstRange = renamed.structures[0].items[0];
  firstRange.items.reverse();
  expect(normalizeCookbookManifest(renamed)).not.toEqual(expected);
  firstRange.items.reverse();
  firstRange.label = { en: firstRange.label.gez };
  expect(normalizeCookbookManifest(renamed)).not.toEqual(expected);
  firstRange.label = recipe.structures[0].items[0].label;
  const secondRange = renamed.structures[0].items[1];
  secondRange.items = secondRange.items.flatMap((range: { items: unknown[] }) => range.items);
  expect(normalizeCookbookManifest(renamed)).not.toEqual(expected);
});

test(
  "0024: build a book table of contents from image services using range splitting",
  { tag: "@cookbook" },
  async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    testInfo.annotations.push({ type: "recipe", description: "https://iiif.io/api/cookbook/recipe/0024-book-4-toc/" });
    // Only the bare ImageService responses enter the editor; the recipe is the export oracle.
    for (const info of services) {
      await page.route(`${info.id}/info.json`, (route) => route.fulfill({ json: info }));
    }

    const homepage = new Homepage(page);
    await homepage.goto();
    await homepage.createNewManifestButton.click();
    const manifestPage = new ManifestPresetPage(page);
    await manifestPage.waitForPage();

    await page.getByRole("button", { name: "Settings", exact: true }).click();
    const settings = page.getByRole("dialog", { name: "Settings", exact: true });
    await settings.getByRole("textbox", { name: "Available languages", exact: true }).fill("en, gez");
    await settings.getByRole("textbox", { name: "Available languages", exact: true }).blur();
    await settings.getByRole("button", { name: "IIIF Options", exact: true }).click();
    await settings.getByRole("combobox", { name: "Compact services", exact: true }).selectOption("compact");
    await settings.getByRole("button", { name: "Close", exact: true }).click();
    await page.reload();
    await manifestPage.waitForPage();
    await page.getByRole("tab", { name: "Descriptive", exact: true }).click();
    await page.getByRole("textbox", { name: "Label (en)", exact: true }).fill(recipe.label.en[0]);
    await page.getByRole("textbox", { name: "Label (en)", exact: true }).blur();
    await expect(manifestPage.manifestHeading).toHaveText(recipe.label.en[0]);

    const openCanvases = async () => {
      const heading = page.getByRole("heading", { name: "Canvases", exact: true });
      if (!(await heading.isVisible())) {
        await page.getByRole("button", { name: "Canvases", exact: true }).click();
      }
      await expect(heading).toBeVisible();
    };
    for (const [index, info] of services.entries()) {
      if (index === 0) {
        await page.getByRole("button", { name: "Start adding content", exact: true }).click();
      } else {
        await openCanvases();
        await page.getByRole("button", { name: "Add new canvas", exact: true }).click();
      }
      await page.getByRole("button", { name: "Choose a content type instead", exact: true }).click();
      await page.getByRole("option", { name: "IIIF image", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Add content", exact: true });
      const serviceUrl = dialog.getByRole("textbox", { name: "Link to image service", exact: true });
      await serviceUrl.fill(info.id);
      await serviceUrl.blur();
      await dialog.getByRole("button", { name: "Create", exact: true }).click();
      await expect(dialog).toBeHidden();
      await page.getByRole("tab", { name: "Descriptive", exact: true }).click();
      const label = page.getByRole("textbox", { name: "Label (en)", exact: true });
      await expect(label).toHaveValue("Untitled canvas");
      await label.fill(recipe.items[index].label.en[0]);
      await label.blur();
      await openCanvases();
      await expect(page.getByRole("button", { name: recipe.items[index].label.en[0], exact: true })).toBeVisible();
    }

    await page.getByRole("button", { name: "Ranges", exact: true }).click();
    await page.getByRole("button", { name: "Create new range", exact: true }).click();
    await page.getByRole("button", { name: "Skip", exact: true }).click();
    const workbench = page.locator("#range-workbench-scroll");
    const renameRange = async (action: string, label: string, language = "en") => {
      await workbench.getByRole("button", { name: action, exact: true }).click();
      await page.getByRole("menuitem", { name: "Edit range label", exact: true }).click();
      const form = workbench.locator("form");
      await form.getByRole("textbox").fill(label);
      await form.getByRole("combobox").selectOption(language);
      await form.getByRole("button", { name: "Save", exact: true }).click();
      await expect(form).toHaveCount(0);
    };

    await renameRange("Range actions", toc.label.en[0]);
    await workbench.getByRole("button", { name: "Split range", exact: true }).click();
    await workbench.getByRole("button", { name: "Preview f. 2r", exact: true }).click();
    await expect(workbench.getByRole("button", { name: "Actions for Range 2", exact: true })).toBeVisible();
    await workbench.getByRole("button", { name: "Exit splitting mode", exact: true }).click();
    await renameRange("Actions for Range 1", firstWork.label.gez![0], "gez");
    await renameRange("Actions for Range 2", secondWork.label.gez![0], "gez");

    // Open the second work, nest its canvases, then split that sequence into its two sections.
    await workbench
      .getByRole("button", { name: `Actions for ${secondWork.label.gez![0]}`, exact: true })
      .locator("..")
      .getByRole("button", { name: "View range item", exact: true })
      .click();
    await workbench.getByRole("button", { name: "Move into new sub-range", exact: true }).click();
    await expect(workbench.getByRole("button", { name: "Actions for Range 1", exact: true })).toBeVisible();
    await workbench.getByRole("button", { name: "Split range", exact: true }).click();
    await workbench.getByRole("button", { name: "Preview f. 3r", exact: true }).click();
    await expect(workbench.getByRole("button", { name: "Actions for Range 2", exact: true })).toBeVisible();
    await workbench.getByRole("button", { name: "Exit splitting mode", exact: true }).click();
    await renameRange("Actions for Range 1", secondWork.items[0].label!.en![0]);
    await renameRange("Actions for Range 2", secondWork.items[1].label!.en![0]);

    // Compare the complete exported object, including every canvas reference in the range tree.
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
