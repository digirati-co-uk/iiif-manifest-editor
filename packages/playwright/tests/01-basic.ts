import { expect, test } from "@playwright/test";

test.describe("Basic Manifest Editor actions", async () => {
  test("Can create empty Manifest", { tag: "@baseline" }, async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Manifest Editor/);

    await page.getByRole("button", { name: "Create new manifest" }).click();
    await page.waitForURL(/editor\/(.*)/);

    const heading = page.getByRole("heading", { level: 2 });
    await heading.waitFor({ state: "visible" });

    expect(heading).toBeVisible();

    // Blank Manifest ID is "https://example.org/".
    const manifestIdentifier = page.getByRole("textbox", { name: "Identifier" });
    expect(manifestIdentifier).toHaveValue(/https:\/\/example.org\/.*/);

    // Update the label.
    const $label = page.getByRole("textbox", { name: "Label" });
    $label.focus();
    $label.fill("My Test Manifest");
    $label.blur();

    await page.waitForTimeout(1000);

    expect(page.getByRole("heading", { level: 2 })).toHaveText("My Test Manifest", { timeout: 1000 });

    // Now add metadata.
    await page.getByRole("tab", { name: "Metadata" }).click();

    // Add first
    await page.getByRole("button", { name: "Add metadata item" }).click();
    const $fieldset1 = page.getByRole("group", { name: "Metadata item 0" });
    await $fieldset1.getByRole("textbox", { name: "Label" }).fill("A test label");
    await $fieldset1.getByRole("textbox", { name: "Value" }).fill("A test value");

    // add second.
    await page.getByRole("button", { name: "Add metadata item" }).click();
    const $fieldset2 = page.getByRole("group", { name: "Metadata item 1" });
    await $fieldset2.getByRole("textbox", { name: "Label" }).fill("Another test label");
    await $fieldset2.getByRole("textbox", { name: "Value" }).fill("Another test value");

    const previewPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: "Preview" }).click();

    // Wait for change to finish.
    await page.waitForTimeout(1000);

    // Check the changes are visible in the preview.
    const previewPage = await previewPromise;
    expect(previewPage).toHaveTitle(/Theseus Viewer - My test manifest/);
    await previewPage.close();

    await page.screenshot();
  });
});
