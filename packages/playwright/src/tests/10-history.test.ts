import { expect, test, type Page } from "@playwright/test";

async function open(page: Page) {
  await page.route("https://history.test/manifest", (route) =>
    route.fulfill({
      json: {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id: "https://history.test/manifest",
        type: "Manifest",
        label: { en: ["Original title"] },
        items: [],
      },
    })
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Open manifest URL", exact: true }).click();
  await page.getByRole("textbox").fill("https://history.test/manifest");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.waitForURL(/editor\//);
  await page.getByRole("tab", { name: "Descriptive", exact: true }).click();
}

test("one field session undoes and redoes across debounced saves", async ({ page }) => {
  await open(page);
  const label = page.getByRole("textbox", { name: "Label (English)", exact: true });
  await label.fill("First title");
  // The field's first debounce has completed before its second save.
  await expect.poll(() => label.inputValue()).toBe("First title");
  await label.press("End");
  await label.pressSequentially(" extended", { delay: 120 });
  await label.blur();
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  await expect(undo).toBeEnabled();
  await undo.click();
  await expect(label).toHaveValue("Original title");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(label).toHaveValue("First title extended");
});

test("keyboard history outside a text field targets the current editor", async ({ page }) => {
  await open(page);
  const label = page.getByRole("textbox", { name: "Label (English)", exact: true });
  await label.fill("Changed title");
  await label.blur();
  const tab = page.getByRole("tab", { name: "Descriptive", exact: true });
  await tab.focus();
  await tab.press("ControlOrMeta+z");
  await expect(label).toHaveValue("Original title");
  await tab.press("ControlOrMeta+Shift+z");
  await expect(label).toHaveValue("Changed title");
});

test("browser project retains undo and redo after reload", async ({ page }) => {
  await open(page);
  const label = page.getByRole("textbox", { name: "Label (English)", exact: true });
  await label.fill("Saved title");
  await label.blur();
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open("manifest-editor-projects-v2");
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          try {
            const projects = await new Promise<any[]>((resolve, reject) => {
              const request = db
                .transaction("manifest-editor-project-store")
                .objectStore("manifest-editor-project-store")
                .getAll();
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            });
            return projects.some(
              (project) => project.resource.id === "https://history.test/manifest" && !!project.historySnapshot
            );
          } finally {
            db.close();
          }
        }),
      { timeout: 15000 }
    )
    .toBe(true);
  await page.reload();
  await page.getByRole("tab", { name: "Descriptive", exact: true }).click();
  await expect(label).toHaveValue("Saved title");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(label).toHaveValue("Original title");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(label).toHaveValue("Saved title");
});
