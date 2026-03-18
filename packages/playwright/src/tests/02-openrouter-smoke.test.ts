import { expect, test } from "@playwright/test";
import { Homepage } from "../pom/homepage";
import { ManifestPresetPage } from "../pom/manifest-preset-page";

test.describe("OpenRouter assistant smoke", () => {
  test("appears in manifest and exhibition mode and keeps a mocked local session across reload", async ({
    page,
  }) => {
    const homepage = new Homepage(page);

    await homepage.goto();
    await homepage.createNewManifestButton.click();

    const manifestPage = new ManifestPresetPage(page);
    await manifestPage.waitForPage();
    await manifestPage.waitForIdentifier();

    await expect(page.getByRole("button", { name: "AI assistant" })).toBeVisible();

    await page.getByRole("button", { name: "AI assistant" }).click();
    await expect(page.getByText("Connect OpenRouter")).toBeVisible();

    await page.evaluate(() => {
      window.localStorage.setItem("manifest-editor.openrouter.apiKey", "test-openrouter-key");
      window.localStorage.setItem("manifest-editor.openrouter.model", "openrouter/auto");
    });

    const manifestEditorUrl = page.url();

    await page.reload();
    await manifestPage.waitForPage();
    await page.getByRole("button", { name: "AI assistant" }).click();

    await expect(page.getByText("Threads")).toBeVisible();
    await expect(page.getByText(/1 conversation/)).toBeVisible();
    await expect(page.getByText("Model")).toBeVisible();
    await expect(page.getByRole("button", { name: "Disconnect" })).toBeVisible();

    await page.reload();
    await manifestPage.waitForPage();
    await page.getByRole("button", { name: "AI assistant" }).click();
    await expect(page.getByText(/1 conversation/)).toBeVisible();

    await page.getByRole("button", { name: "Disconnect" }).click();
    await expect(page.getByText("Connect OpenRouter")).toBeVisible();

    await page.goto(`${manifestEditorUrl}/exhibition`);
    await expect(page.getByRole("button", { name: "AI assistant" })).toBeVisible();
    await page.getByRole("button", { name: "AI assistant" }).click();
    await expect(page.getByText("Connect OpenRouter")).toBeVisible();
  });
});
