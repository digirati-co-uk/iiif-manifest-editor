import { expect, test } from "@playwright/test";
import { Homepage } from "../pom/homepage";
import { ManifestPresetPage } from "../pom/manifest-preset-page";

test.describe("Plugin Manager", () => {
  test("translation plugin appears and opens its sidebar", async ({ page }) => {
    const homepage = new Homepage(page);

    await homepage.goto();
    await homepage.createNewManifestButton.click();

    const manifestPage = new ManifestPresetPage(page);
    await manifestPage.waitForPage();
    await expect(manifestPage.manifestHeading).toBeVisible();

    await manifestPage.openPlugins();
    await page.getByRole("button", { name: "Enable Translations", exact: true }).click();
    await page.getByRole("button", { name: "Open Translations", exact: true }).click();
    await page.getByRole("dialog", { name: "Settings", exact: true }).getByRole("button", { name: "Close", exact: true }).click();
    await expect(page.getByText("Translations").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Translate", exact: true })).toBeVisible();
  });

  test("can disable and re-enable a workspace plugin", async ({ page }) => {
    const homepage = new Homepage(page);

    await homepage.goto();
    await homepage.createNewManifestButton.click();

    const manifestPage = new ManifestPresetPage(page);
    await manifestPage.waitForPage();
    await expect(manifestPage.manifestHeading).toBeVisible();

    await manifestPage.openPlugins();

    const translationPlugin = page.getByRole("article").filter({ hasText: "Translations" });
    await translationPlugin.getByRole("button", { name: "Enable Translations", exact: true }).click();
    await expect(translationPlugin.getByRole("button", { name: "Disable Translations", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open Translations", exact: true })).toBeVisible();

    await translationPlugin.getByRole("button", { name: "Disable Translations" }).click();
    await expect(translationPlugin.getByRole("button", { name: "Enable Translations", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open Translations", exact: true })).toHaveCount(0);

    await page.waitForTimeout(500);
    await page.reload();
    await manifestPage.waitForPage();
    await manifestPage.openPlugins();

    const reloadedTranslationPlugin = page.getByRole("article").filter({ hasText: "Translations" });
    await expect(reloadedTranslationPlugin.getByRole("button", { name: "Enable Translations", exact: true })).toBeVisible();

    await reloadedTranslationPlugin.getByRole("button", { name: "Enable Translations" }).click();
    await expect(reloadedTranslationPlugin.getByRole("button", { name: "Disable Translations", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open Translations", exact: true })).toBeVisible();
  });
});
