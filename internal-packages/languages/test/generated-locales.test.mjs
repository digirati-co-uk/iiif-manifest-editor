import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import test from "node:test";
import { flattenCatalog } from "../src/schema.ts";
import { createCatalogContract } from "../src/validation.ts";
import { reviewTranslation } from "../src/translation-review.ts";

const locales = ["fr", "de", "it", "es", "pt", "ja", "zh", "tr", "fi", "hi", "pl", "uk", "cs", "da", "ms", "ta"];
const sourceRoot = new URL("../src/", import.meta.url);
const sourceFiles = [];
async function collect(directory, prefix) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`;
    if (entry.isDirectory()) await collect(new URL(`${entry.name}/`, directory), `${path}/`);
    else if (path.includes("/en-GB/") && path.endsWith(".ts")) sourceFiles.push(path);
  }
}
for (const folder of ["locales", "profiles", "presets"]) {
  await collect(new URL(`${folder}/`, sourceRoot), `${folder}/`);
}
const sources = await Promise.all(
  sourceFiles.sort().map(async (path) => ({
    path,
    catalog: (await import(new URL(path, sourceRoot))).catalog,
  }))
);
const bases = new Map(
  sources
    .filter(({ path }) => path.startsWith("locales/"))
    .map(({ path, catalog }) => [path.split("/").at(-1), catalog])
);

for (const locale of locales) {
  test(`${locale}: generated base catalogs and wording overlays satisfy the current source contracts`, async () => {
    for (const { path, catalog: source } of sources) {
      const targetPath = path.replace("/en-GB/", `/${locale}/`);
      const target = (await import(new URL(targetPath, sourceRoot))).catalog;
      const baseSource = bases.get(path.split("/").at(-1));
      const report = reviewTranslation(source, target, {
        locale,
        contract: createCatalogContract(baseSource),
        baseSource,
        overlay: !path.startsWith("locales/"),
      });
      // Exact-source terminology reviews are a separate linguistic gate. These drafts
      // must still have complete real coverage and correct placeholders/plural forms.
      assert.deepEqual(
        report.issues.filter(({ code }) => code !== "unchanged-unreviewed"),
        [],
        targetPath
      );
      const original = flattenCatalog(source);
      for (const [key, text] of flattenCatalog(target)) {
        const sourceText = original.get(key) ?? original.get(key.replace(/_(one|few|many|other)$/, "_other"));
        if (!sourceText) continue;
        assert.ok(!/ZXQ\d|ZXENTRY|__PH_/.test(text), `${targetPath}:${key}: translation marker`);
        if (!sourceText.includes("\n")) assert.ok(!text.includes("\n"), `${targetPath}:${key}: merged messages`);
        // Joyride and CodeMirror use substitution syntax outside the i18next contract.
        for (const token of sourceText.match(/\{steps?\}|\$/g) ?? []) {
          assert.ok(text.includes(token), `${targetPath}:${key}: missing ${token}`);
        }
      }
    }
  });

  test(`${locale}: tutorial and configuration examples retain their literal data`, async () => {
    const { catalog: web } = await import(new URL(`locales/${locale}/web.ts`, sourceRoot));
    const { catalog: shell } = await import(new URL(`locales/${locale}/shell.ts`, sourceRoot));
    const { catalog: creators } = await import(new URL(`locales/${locale}/creators.ts`, sourceRoot));
    const sourceNotebook = bases.get("web.ts").tutorials.firstNotebook;
    const notebook = web.tutorials.firstNotebook;
    for (const literal of [
      "Single Image Example",
      "width: 1200",
      "height: 1800",
      "painting",
      "Simplest Manifest — Single Image File",
    ]) {
      assert.ok(notebook.includes(literal), `${locale}: tutorial lost ${literal}`);
    }
    assert.deepEqual(notebook.match(/https?:\/\/[^\s)]+/g), sourceNotebook.match(/https?:\/\/[^\s)]+/g));
    assert.equal((notebook.match(/- \[ \]/g) ?? []).length, (sourceNotebook.match(/- \[ \]/g) ?? []).length);
    assert.ok(shell.settings.dimensions.startsWith("id, type, profile, width, height ("));
    assert.ok(shell.settings.minimal.startsWith("id, type, profile ("));
    for (const tag of ["en", "fr", "pt-BR"]) {
      assert.ok(creators.form.languageCodeHelp.includes(tag), `${locale}: language code ${tag}`);
    }
  });
}
