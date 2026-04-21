import { expect, test } from "@playwright/test";
import { Homepage } from "../pom/homepage";
import { ManifestPresetPage } from "../pom/manifest-preset-page";

test.describe("Plugin Manager", () => {
  test("can disable and reset a workspace plugin", async ({ page }) => {
    const homepage = new Homepage(page);

    await homepage.goto();
    await homepage.createNewManifestButton.click();

    const manifestPage = new ManifestPresetPage(page);
    await manifestPage.waitForPage();
    await expect(manifestPage.manifestHeading).toBeVisible();

    await page.getByRole("button", { name: "Config" }).click();
    await expect(page.getByRole("heading", { name: "Plugins" })).toBeVisible();

    const qualityPlugin = page.getByRole("article").filter({ hasText: "Manifest Quality Checks" });
    await expect(qualityPlugin).toContainText("Enabled");
    await expect(page.getByRole("button", { name: "Quality" })).toBeVisible();

    await qualityPlugin.getByRole("button", { name: "Disable workspace" }).click();
    await expect(qualityPlugin).toContainText("Disabled");
    await expect(page.getByRole("button", { name: "Quality" })).toHaveCount(0);

    await page.waitForTimeout(500);
    await page.reload();
    await manifestPage.waitForPage();
    await page.getByRole("button", { name: "Config" }).click();

    const reloadedQualityPlugin = page.getByRole("article").filter({ hasText: "Manifest Quality Checks" });
    await expect(reloadedQualityPlugin).toContainText("Disabled");

    await reloadedQualityPlugin.getByRole("button", { name: "Reset workspace" }).click();
    await expect(reloadedQualityPlugin).toContainText("Enabled");
    await expect(page.getByRole("button", { name: "Quality" })).toBeVisible();
  });
});
