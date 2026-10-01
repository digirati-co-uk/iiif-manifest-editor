import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import recipe from "../fixtures/cookbook/0005-image-service/manifest.json";
import info from "../fixtures/cookbook/0005-image-service/info.json";
import { normalizeCookbookManifest } from "../pom/compare-cookbook";
import { Homepage } from "../pom/homepage";
import { ManifestPresetPage } from "../pom/manifest-preset-page";

const canvas = recipe.items[0];
const image = canvas.items[0].items[0].body;

test("Cookbook comparison ignores structural IDs but checks content, services and targets", () => {
  const renamed = structuredClone(recipe);
  renamed.id = "https://editor.test/manifest";
  renamed.items[0].id = "https://editor.test/canvas";
  renamed.items[0].items[0].id = "https://editor.test/page";
  const annotation = renamed.items[0].items[0].items[0];
  annotation.id = "https://editor.test/annotation";
  annotation.target = renamed.items[0].id;
  const expected = normalizeCookbookManifest(recipe);
  expect(normalizeCookbookManifest(renamed)).toEqual(expected);

  annotation.body.id += "?wrong-image";
  expect(normalizeCookbookManifest(renamed)).not.toEqual(expected);
  annotation.body.id = image.id;
  annotation.body.service[0].id += "/wrong-service";
  expect(normalizeCookbookManifest(renamed)).not.toEqual(expected);
  annotation.body.service[0].id = image.service[0].id;
  annotation.target = renamed.id;
  expect(normalizeCookbookManifest(renamed)).not.toEqual(expected);
  annotation.target = `${renamed.items[0].id}#xywh=0,0,10,10`;
  expect(normalizeCookbookManifest(renamed)).not.toEqual(expected);
});

test("0005: create a single image-service canvas from scratch", { tag: "@cookbook" }, async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "recipe", description: "https://iiif.io/api/cookbook/recipe/0005-image-service/" });
  // Pin the real service response. Never load the reference Manifest into the editor.
  await page.route(`${info.id}/info.json`, (route) => route.fulfill({ json: info }));

  const homepage = new Homepage(page);
  await homepage.goto();
  await homepage.createNewManifestButton.click();
  const manifestPage = new ManifestPresetPage(page);
  await manifestPage.waitForPage();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const settings = page.getByRole("dialog", { name: "Settings", exact: true });
  await settings.getByRole("button", { name: "IIIF Options", exact: true }).click();
  await expect(settings.getByRole("checkbox", { name: "Include sizes", exact: true })).not.toBeChecked();
  await expect(settings.getByRole("checkbox", { name: "Include tiles", exact: true })).not.toBeChecked();
  await settings.getByRole("combobox", { name: "Compact services", exact: true }).selectOption("compact");
  await settings.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await manifestPage.waitForPage();
  await page.getByRole("tab", { name: "Descriptive", exact: true }).click();
  await page.getByRole("textbox", { name: "Label (en)", exact: true }).fill(recipe.label.en[0]);
  await page.getByRole("textbox", { name: "Label (en)", exact: true }).blur();
  await expect(manifestPage.manifestHeading).toHaveText(recipe.label.en[0]);

  await page.getByRole("button", { name: "Start adding content", exact: true }).click();
  await page.getByRole("option", { name: "IIIF Image IIIF Image service", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add content", exact: true });
  const serviceUrl = dialog.getByRole("textbox", { name: "Link to image service", exact: true });
  await serviceUrl.fill(info.id);
  await serviceUrl.blur();
  await dialog.getByRole("button", { name: "Create", exact: true }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "Canvases", exact: true }).click();
  await page.getByRole("button", { name: "Untitled canvas", exact: true }).click();
  await page.getByRole("tab", { name: "Descriptive", exact: true }).click();
  await page.getByRole("textbox", { name: "Label (en)", exact: true }).fill(canvas.label.en[0]);
  await page.getByRole("textbox", { name: "Label (en)", exact: true }).blur();

  await expect(page.getByRole("button", { name: canvas.label.en[0], exact: true })).toBeVisible();

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
});
