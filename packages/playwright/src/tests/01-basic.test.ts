import { expect, test } from "@playwright/test";
import { Homepage } from "../pom/homepage";
import { ManifestPresetPage } from "../pom/manifest-preset-page";


test.describe("Basic Manifest Editor actions", async () => {
  test("Can create empty Manifest", { tag: "@baseline" }, async ({ page: page }) => {
    const homepage = new Homepage(page);

    await homepage.goto();
    await homepage.createNewManifestButton.click();


    const manifestPage = new ManifestPresetPage(page);
    await manifestPage.waitForPage();

    // Having some problems with loading the Manifest Page.
    const heading = manifestPage.manifestHeading;
    await heading.waitFor({ state: "visible" });

    expect(heading).toBeVisible();

    // Blank Manifest ID is "https://example.org/".
    await manifestPage.waitForIdentifier();

    const manifestIdentifier = page.getByRole("textbox", { name: "Identifier" });
    expect(manifestIdentifier).toHaveValue(/https:\/\/example.org\/.*/);

    // Update the label.
    const labelContainer = manifestPage.resolveContainer('Manifest', 'label');
    const $label = labelContainer.getByRole("textbox", { name: "Label" });
    $label.focus();
    $label.fill("My Test Manifest");
    $label.blur();


    expect(page.getByRole("heading", { level: 2 })).toHaveText("My Test Manifest", { timeout: 1000 });

    // Now add metadata.
    await page.getByRole("tab", { name: "Metadata" }).click();

    // Add first
    await manifestPage.addMetadataButton.click();
    const $fieldset1 = manifestPage.getMetadataFieldsetByIndex(0);
    await $fieldset1.getByRole("textbox", { name: "Label" }).fill("A test label");
    await $fieldset1.getByRole("textbox", { name: "Value" }).fill("A test value");

    // add second.
    await manifestPage.addMetadataButton.click();
    const $fieldset2 = manifestPage.getMetadataFieldsetByIndex(1);
    await $fieldset2.getByRole("textbox", { name: "Label" }).fill("Another test label");
    await $fieldset2.getByRole("textbox", { name: "Value" }).fill("Another test value");

    // @todo switch Manifest metadata to be a dl list instead of a table + then check it.
    // For now, need to wait for change to finish manually.
    await page.waitForTimeout(1000);

    const previewPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: "Preview" }).click();

    // Wait for popup - still a bit janky.
    await page.waitForTimeout(1000);

    // Check the changes are visible in the preview.
    const previewPage = await previewPromise;
    await previewPage.waitForLoadState('networkidle');
    await previewPage.close();

    await page.screenshot();
  });
});
