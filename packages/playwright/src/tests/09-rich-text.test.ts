import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const originalHtml = '<p lang="en">Original <strong>bold</strong> &amp; <a href="https://example.org/">link</a></p>';

async function openManifest(page: Page, overrides: Record<string, unknown> = {}) {
  await page.route("https://rich-text.test/manifest", (route) =>
    route.fulfill({
      json: {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id: "https://rich-text.test/manifest",
        type: "Manifest",
        label: { en: ["Plain title"], fr: ["Titre français"] },
        summary: { en: [originalHtml] },
        items: [],
        ...overrides,
      },
    })
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Open manifest URL", exact: true }).click();
  await page.getByRole("textbox").fill("https://rich-text.test/manifest");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.waitForURL(/editor\//);
  await page.getByRole("tab", { name: "Descriptive", exact: true }).click();
}

async function downloadManifest(page: Page, path: string) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download manifest", exact: true }).click();
  await (await pending).saveAs(path);
  return JSON.parse(await readFile(path, "utf8"));
}

test("untouched plain text and HTML survive focus, source preview, and export", async ({ page }, testInfo) => {
  await openManifest(page);
  const label = page.getByRole("textbox", { name: "Label (en)", exact: true });
  await expect(label).toHaveValue("Plain title");
  await label.focus();
  await label.blur();
  const summary = page.getByRole("textbox", { name: "Summary (en)", exact: true });
  await summary.focus();
  await summary.blur();
  await summary.focus();
  await page.getByRole("button", { name: "HTML source", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Summary (en) HTML source", exact: true })).toHaveValue(originalHtml);
  await page.getByRole("button", { name: "HTML source", exact: true }).click();
  const manifest = await downloadManifest(page, testInfo.outputPath("untouched.json"));
  expect(manifest.label).toEqual({ en: ["Plain title"], fr: ["Titre français"] });
  expect(manifest.summary.en).toEqual([originalHtml]);
});

test("plain text saves immediately when leaving the field and survives reload", async ({ page }, testInfo) => {
  await openManifest(page);
  const title = "A & B < C";
  await page.getByRole("textbox", { name: "Label (en)", exact: true }).fill(title);
  await page.getByRole("tab", { name: "Technical", exact: true }).click();
  const manifest = await downloadManifest(page, testInfo.outputPath("plain-text.json"));
  expect(manifest.label.en).toEqual([title]);
  expect(manifest.label.fr).toEqual(["Titre français"]);
  await page.reload();
  await page.getByRole("tab", { name: "Descriptive", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Label (en)", exact: true })).toHaveValue(title);
});

test("rich formatting, source editing, and removing HTML preserve text", async ({ page }, testInfo) => {
  await openManifest(page);
  const summary = page.getByRole("textbox", { name: "Summary (en)", exact: true });
  await summary.fill("Formatted & literal");
  await summary.press("ControlOrMeta+a");
  await summary.press("ControlOrMeta+b");
  await page.getByRole("button", { name: "HTML source", exact: true }).click();
  const source = page.getByRole("textbox", { name: "Summary (en) HTML source", exact: true });
  await expect(source).toHaveValue(/<strong>Formatted &amp; literal<\/strong>/);
  await source.fill("<p>New &amp; <em>edited</em><br>second line</p><script>alert(1)</script>");
  await page.getByRole("button", { name: "HTML source", exact: true }).click();
  await expect(summary).toContainText("New & edited");
  const manifest = await downloadManifest(page, testInfo.outputPath("rich-text.json"));
  expect(manifest.summary.en[0]).toBe("<p>New &amp; <em>edited</em><br>second line</p>");
  // Switching to plain text drops formatting, so the user is asked to confirm.
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Summary (en) options", exact: true }).click();
  await page.getByRole("group", { name: "Value format" }).getByRole("button", { name: "Text", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Summary (en)", exact: true })).toHaveValue(
    "New & edited\nsecond line"
  );
  const plain = await downloadManifest(page, testInfo.outputPath("removed-html.json"));
  expect(plain.summary.en).toEqual(["New & edited\nsecond line"]);
});

test("explicit conversion escapes plain text and supports keyboard-accessible formatting", async ({
  page,
}, testInfo) => {
  await openManifest(page, { summary: { en: ["Plain summary"] } });
  const fields = page.locator("[id='container_https://rich-text.test/manifest_Manifest_summary']");
  const summary = fields.getByRole("textbox", { name: "Summary (en)", exact: true });
  await summary.fill("A & B < C");
  await fields.getByRole("button", { name: "Summary (en) options", exact: true }).first().click();
  const format = fields.getByRole("group", { name: "Value format" });
  await format.getByRole("button", { name: "HTML", exact: true }).click();
  await expect(summary).toHaveText("A & B < C");
  const toolbar = fields.getByRole("toolbar", { name: "Text formatting", exact: true });
  await expect(toolbar.getByRole("button", { name: "Bold", exact: true })).toBeVisible();
  await summary.press("ControlOrMeta+a");
  await toolbar.getByRole("button", { name: "Bold", exact: true }).focus();
  await page.keyboard.press("Enter");
  await fields.getByRole("button", { name: "HTML source", exact: true }).click();
  await expect(fields.getByRole("textbox", { name: "Summary (en) HTML source", exact: true })).toHaveValue(
    "<p><strong>A &amp; B &lt; C</strong></p>"
  );
  page.once("dialog", (dialog) => dialog.accept());
  await format.getByRole("button", { name: "Text", exact: true }).click();
  await expect(summary).toHaveValue("A & B < C");
  const manifest = await downloadManifest(page, testInfo.outputPath("converted.json"));
  expect(manifest.summary.en).toEqual(["A & B < C"]);
});

test("HTML without formatting is saved as plain text while editing stays in HTML mode", async ({ page }, testInfo) => {
  await openManifest(page, { summary: { en: ["Plain summary"] } });
  const fields = page.locator("[id='container_https://rich-text.test/manifest_Manifest_summary']");
  await fields.getByRole("button", { name: "Summary (en) options", exact: true }).first().click();
  await fields.getByRole("group", { name: "Value format" }).getByRole("button", { name: "HTML", exact: true }).click();
  const summary = fields.getByRole("textbox", { name: "Summary (en)", exact: true });
  await summary.press("End");
  await summary.pressSequentially(" & more");
  await summary.blur();
  await expect(fields.getByRole("toolbar", { name: "Text formatting", exact: true })).toBeVisible();
  await expect(summary).toHaveText("Plain summary & more");
  const manifest = await downloadManifest(page, testInfo.outputPath("collapsed-html.json"));
  expect(manifest.summary.en).toEqual(["Plain summary & more"]);
});

test("plain labels have no HTML gate while summaries and required-statement values allow HTML", async ({ page }) => {
  await openManifest(page, {
    label: { en: ["<3"], fr: ["Titre français"] },
    summary: { en: ["Plain summary"] },
    requiredStatement: { label: { en: ["Attribution"] }, value: { en: ["Provided by Example"] } },
  });
  const labels = page.locator("[id='container_https://rich-text.test/manifest_Manifest_label']");
  await expect(labels.getByRole("textbox", { name: "Label (en)", exact: true })).toHaveValue("<3");
  await labels.getByRole("button", { name: "Label (en) options", exact: true }).click();
  await expect(labels.getByRole("group", { name: "Value format" })).toHaveCount(0);

  const summary = page.locator("[id='container_https://rich-text.test/manifest_Manifest_summary']");
  await summary.getByRole("button", { name: "Summary (en) options", exact: true }).click();
  await expect(
    summary.getByRole("group", { name: "Value format" }).getByRole("button", { name: "HTML", exact: true })
  ).toBeVisible();

  const statement = page.locator("[id='container_https://rich-text.test/manifest_Manifest_requiredStatement']");
  await statement.getByRole("button", { name: "Label (en) options", exact: true }).click();
  await expect(statement.getByRole("group", { name: "Value format" })).toHaveCount(0);
  await statement.getByRole("button", { name: "Value (en) options", exact: true }).click();
  await expect(
    statement.getByRole("group", { name: "Value format" }).getByRole("button", { name: "HTML", exact: true })
  ).toBeVisible();
  await expect(page.getByText("IIIF expects plain text in this field.", { exact: true })).toHaveCount(0);
});

test("existing HTML labels remain editable per value and return to plain-text gates after removal", async ({
  page,
}, testInfo) => {
  await openManifest(page, { label: { en: [originalHtml], fr: ["Titre français"] } });
  const labels = page.locator("[id='container_https://rich-text.test/manifest_Manifest_label']");
  const htmlLabel = labels.getByRole("textbox", { name: "Label (en)", exact: true });
  await expect(htmlLabel).toContainText("Original bold & link");
  await expect(labels.getByText("IIIF expects plain text in this field.", { exact: true })).toBeVisible();

  await labels.getByRole("button", { name: "Label (fr) options", exact: true }).click();
  await expect(labels.getByRole("group", { name: "Value format" })).toHaveCount(0);
  await htmlLabel.focus();
  await labels.getByRole("button", { name: "HTML source", exact: true }).click();
  const source = labels.getByRole("textbox", { name: "Label (en) HTML source", exact: true });
  await expect(source).toHaveValue(originalHtml);
  const untouched = await downloadManifest(page, testInfo.outputPath("imported-html-label.json"));
  expect(untouched.label.en).toEqual([originalHtml]);
  await source.fill("<p>Updated <b>label</b></p>");
  await labels.getByRole("button", { name: "HTML source", exact: true }).click();
  await expect(htmlLabel).toContainText("Updated label");
  const edited = await downloadManifest(page, testInfo.outputPath("edited-html-label.json"));
  expect(edited.label.en[0]).toContain("Updated");
  expect(edited.label.fr).toEqual(["Titre français"]);

  await labels.getByRole("button", { name: "Label (en) options", exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await labels.getByRole("group", { name: "Value format" }).getByRole("button", { name: "Text", exact: true }).click();
  await expect(labels.getByRole("textbox", { name: "Label (en)", exact: true })).toHaveValue("Updated label");
  await expect(labels.getByRole("group", { name: "Value format" })).toHaveCount(0);
  await expect(labels.getByText("IIIF expects plain text in this field.", { exact: true })).toHaveCount(0);
  const plain = await downloadManifest(page, testInfo.outputPath("plain-label.json"));
  expect(plain.label.en).toEqual(["Updated label"]);
});

test("metadata values allow HTML and imported HTML metadata labels retain the compatibility editor", async ({
  page,
}, testInfo) => {
  await openManifest(page, {
    metadata: [
      { label: { en: ["Creator"] }, value: { en: ["Example creator"] } },
      { label: { en: [originalHtml], fr: ["Titre français"] }, value: { en: ["Example value"] } },
    ],
  });
  await page.getByRole("tab", { name: "Metadata", exact: true }).click();
  await page.getByRole("button", { name: "Edit metadata item 1", exact: true }).click();
  const first = page
    .locator("fieldset")
    .filter({ has: page.getByRole("button", { name: "Done editing metadata item 1", exact: true }) });
  await first.getByRole("button", { name: "Label (en) options", exact: true }).click();
  await expect(first.getByRole("group", { name: "Value format" })).toHaveCount(0);
  await first.getByRole("button", { name: "Value (en) options", exact: true }).click();
  await first.getByRole("group", { name: "Value format" }).getByRole("button", { name: "HTML", exact: true }).click();
  const value = first.getByRole("textbox", { name: "Value (en)", exact: true });
  await value.press("ControlOrMeta+a");
  await value.press("ControlOrMeta+b");
  await page.getByRole("button", { name: "Done editing metadata item 1", exact: true }).click();

  await page.getByRole("button", { name: "Edit metadata item 2", exact: true }).click();
  const second = page
    .locator("fieldset")
    .filter({ has: page.getByRole("button", { name: "Done editing metadata item 2", exact: true }) });
  await expect(second.getByRole("textbox", { name: "Label (en)", exact: true })).toContainText("Original bold & link");
  await expect(second.getByText("IIIF expects plain text in this field.", { exact: true })).toBeVisible();
  await second.getByRole("button", { name: "Label (fr) options", exact: true }).click();
  await expect(second.getByRole("group", { name: "Value format" })).toHaveCount(0);
  const manifest = await downloadManifest(page, testInfo.outputPath("metadata-gates.json"));
  expect(manifest.metadata[0].value.en[0]).toContain("<strong>Example creator</strong>");
  expect(manifest.metadata[1].label).toEqual({ en: [originalHtml], fr: ["Titre français"] });
});

test("inline editing preserves imported HTML, cancels safely, and allows formatting summaries", async ({
  page,
}, testInfo) => {
  await openManifest(page, {
    label: { en: [originalHtml], fr: ["Titre français"] },
    summary: { en: ["Inline summary"] },
  });
  await page.getByRole("heading", { level: 2 }).filter({ hasText: "Original" }).click();
  const title = page.getByRole("textbox", { name: "Edit Add an exhibition title", exact: true });
  await expect(title).toContainText("Original bold & link");
  await title.fill("Cancelled edit");
  await title.press("Escape");
  await expect(title).toHaveCount(0);
  const cancelled = await downloadManifest(page, testInfo.outputPath("cancelled-inline.json"));
  expect(cancelled.label.en).toEqual([originalHtml]);

  await page.getByRole("heading", { level: 2 }).filter({ hasText: "Original" }).click();
  await title.fill("Inline label");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(title).toHaveCount(0);
  const edited = await downloadManifest(page, testInfo.outputPath("edited-inline.json"));
  expect(edited.label).toEqual({ en: ["Inline label"], fr: ["Titre français"] });

  await page
    .getByRole("paragraph")
    .filter({ hasText: /^Inline summary$/ })
    .click();
  const summary = page.getByRole("textbox", { name: "Edit Add an exhibition summary", exact: true });
  await page.getByRole("button", { name: "Edit Add an exhibition summary options", exact: true }).click();
  await page.getByRole("group", { name: "Value format" }).getByRole("button", { name: "HTML", exact: true }).click();
  await summary.fill("Inline rich summary");
  await summary.press("ControlOrMeta+a");
  await summary.press("ControlOrMeta+b");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  const formatted = await downloadManifest(page, testInfo.outputPath("formatted-inline.json"));
  expect(formatted.summary.en[0]).toContain("<strong>Inline rich summary</strong>");
});

test("language values can be added, changed, and removed without losing other languages", async ({
  page,
}, testInfo) => {
  await openManifest(page);
  const fields = page.locator("[id='container_https://rich-text.test/manifest_Manifest_label']");
  await fields.getByRole("textbox", { name: "Label (en)", exact: true }).focus();
  await fields.getByRole("button", { name: "create new", exact: true }).click();
  await fields.getByRole("textbox", { name: "Label (en)", exact: true }).last().fill("Welsh title");
  await fields.getByRole("button", { name: "Label (en) options", exact: true }).last().click();
  await fields.getByRole("combobox", { name: "Label (en) language", exact: true }).last().selectOption("cy");
  await expect(fields.getByRole("textbox", { name: "Label (cy)", exact: true })).toHaveValue("Welsh title");
  await fields.getByRole("button", { name: "remove", exact: true }).click();
  await fields.getByTitle("delete", { exact: true }).nth(1).click();
  const manifest = await downloadManifest(page, testInfo.outputPath("languages.json"));
  expect(manifest.label).toEqual({ en: ["Plain title"], cy: ["Welsh title"] });
});
