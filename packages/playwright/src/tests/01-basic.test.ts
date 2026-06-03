import { expect, test } from "@playwright/test";
import { Homepage } from "../pom/homepage";
import { ManifestPresetPage } from "../pom/manifest-preset-page";

test.describe("Basic Manifest Editor actions", async () => {
  test(
    "Can create empty Manifest",
    { tag: "@baseline" },
    async ({ page: page }) => {
      const homepage = new Homepage(page);

      await homepage.goto();
      await homepage.createNewManifestButton.click();

      const manifestPage = new ManifestPresetPage(page);
      await manifestPage.waitForPage();

      // Having some problems with loading the Manifest Page.
      await expect(manifestPage.manifestHeading).toBeVisible();

      // Blank Manifest ID is "https://example.org/".
      await manifestPage.waitForIdentifier();

      const manifestIdentifier = page.getByRole("textbox", {
        name: "Identifier",
      });
      await expect(manifestIdentifier).toHaveValue(/https:\/\/example.org\/.*/);

      // Update the label.
      const labelContainer = manifestPage.resolveContainer("Manifest", "label");
      const $label = labelContainer.getByRole("textbox", { name: "Label" });
      $label.focus();
      $label.fill("My Test Manifest");
      $label.blur();

      await expect(page.getByRole("heading", { level: 2 })).toHaveText(
        "My Test Manifest",
        { timeout: 1000 },
      );

      // Now add metadata.
      await page.getByRole("tab", { name: "Metadata" }).click();

      // Add first
      await manifestPage.addMetadataButton.click();
      const $fieldset1 = manifestPage.getMetadataFieldsetByIndex(0);
      await expect(
        $fieldset1.getByRole("textbox", { name: "Label" }),
      ).toBeVisible();
      await $fieldset1
        .getByRole("textbox", { name: "Label" })
        .fill("A test label");
      await $fieldset1
        .getByRole("textbox", { name: "Value" })
        .fill("A test value");

      // add second.
      await manifestPage.addMetadataButton.click();
      await expect(
        $fieldset1.getByRole("textbox", { name: "Label" }),
      ).toHaveCount(0);
      await expect($fieldset1).toContainText("A test label");
      await expect($fieldset1).toContainText("A test value");

      const $fieldset2 = manifestPage.getMetadataFieldsetByIndex(1);
      await expect(
        $fieldset2.getByRole("textbox", { name: "Label" }),
      ).toBeVisible();
      await $fieldset2
        .getByRole("textbox", { name: "Label" })
        .fill("Another test label");
      await $fieldset2
        .getByRole("textbox", { name: "Value" })
        .fill("Another test value");

      await manifestPage.getMetadataEditButtonByIndex(0).click();
      await expect(
        $fieldset1.getByRole("textbox", { name: "Label" }),
      ).toBeVisible();
      await expect(
        $fieldset2.getByRole("textbox", { name: "Label" }),
      ).toHaveCount(0);

      const firstHandle = await manifestPage
        .getMetadataDragHandleByIndex(0)
        .boundingBox();
      const secondRow = await $fieldset2.boundingBox();
      if (!firstHandle || !secondRow) {
        throw new Error(
          "Could not resolve metadata row positions for drag reorder",
        );
      }

      await page.mouse.move(
        firstHandle.x + firstHandle.width / 2,
        firstHandle.y + firstHandle.height / 2,
      );
      await page.mouse.down();
      await page.mouse.move(
        secondRow.x + secondRow.width / 2,
        secondRow.y + secondRow.height / 2,
        { steps: 10 },
      );
      await page.mouse.up();

      await expect(manifestPage.getMetadataFieldsetByIndex(0)).toContainText(
        "Another test label",
      );
      await expect(manifestPage.getMetadataFieldsetByIndex(1)).toContainText(
        "A test label",
      );
      await expect(manifestPage.getMetadataDoneButtonByIndex(1)).toBeVisible();

      await manifestPage.getMetadataActionMenuByIndex(1).click();
      await page.getByRole("button", { name: "Delete" }).click();
      await expect(manifestPage.getMetadataFieldsetByIndex(1)).toHaveCount(0);
      await expect(manifestPage.getMetadataFieldsetByIndex(0)).toContainText(
        "Another test label",
      );

      // For now, need to wait for change to finish manually.
      await page.waitForTimeout(1000);

      const previewPromise = page.waitForEvent("popup");
      await page.getByRole("button", { name: "Preview" }).click();

      // Wait for popup - still a bit janky.
      await page.waitForTimeout(1000);

      // Check the changes are visible in the preview.
      const previewPage = await previewPromise;
      await previewPage.waitForLoadState("networkidle");
      await previewPage.close();

      await page.screenshot();
    },
  );
});
