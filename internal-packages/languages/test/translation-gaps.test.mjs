import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { findTranslationGaps, renderGapMarkdown } from "../scripts/translation-gaps.mjs";

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "translation-gaps-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sourceRoot = pathToFileURL(`${root}/src/`);
  const reviewsRoot = pathToFileURL(`${root}/reviews/`);
  for (const directory of ["src/locales", "src/profiles", "src/presets", "reviews"]) {
    await mkdir(join(root, directory), { recursive: true });
  }
  async function catalog(path, value) {
    const url = new URL(path, sourceRoot);
    await mkdir(new URL("./", url), { recursive: true });
    await writeFile(url, `export const catalog = ${JSON.stringify(value)};\n`);
  }
  return { root, sourceRoot, reviewsRoot, catalog };
}

test("reports locale-specific plurals, missing overlays and invalid placeholders independently of English matches", async (t) => {
  const f = await fixture(t);
  await f.catalog("locales/en-GB/example.ts", {
    save: "Save",
    label: "Label",
    greeting: "Hello {{name}}",
    items_one: "{{count}} item",
    items_other: "{{count}} items",
  });
  await f.catalog("profiles/plain/en-GB/example.ts", { label: "Title" });
  await f.catalog("locales/fr/example.ts", {
    save: "Enregistrer",
    label: "Label",
    greeting: "Bonjour {{person}}",
    items_one: "{{count}} élément",
    items_other: "{{count}} éléments",
  });
  await f.catalog("locales/ja/example.ts", {
    save: "保存",
    label: "ラベル",
    greeting: "こんにちは {{name}}",
    items_other: "{{count}}件",
  });
  await f.catalog("profiles/plain/ja/example.ts", { label: "タイトル" });
  const before = await readFile(new URL("locales/fr/example.ts", f.sourceRoot), "utf8");
  const report = await findTranslationGaps(f);
  assert.deepEqual(
    report.locales.map(({ locale }) => locale),
    ["fr", "ja"]
  );
  const french = report.locales[0];
  assert.equal(french.summary.required, 7); // French one/many/other, plus the overlay.
  assert.equal(french.summary.missing, 2);
  assert.equal(french.summary.validationIssues, 1);
  assert.equal(french.summary.unchangedAwaitingReview, 1);
  assert.equal(french.summary.missingFiles, 1);
  assert.deepEqual(french.files[0].missing, [{ key: "items_many", source: "{{count}} items" }]);
  assert.deepEqual(french.files[1].missing, [{ key: "label", source: "Title" }]);
  const japanese = report.locales[1];
  assert.equal(japanese.summary.required, 5); // Japanese requires only other.
  assert.equal(japanese.complete, true);
  const markdown = renderGapMarkdown(report);
  assert.match(markdown, /locales\/en-GB\/example\.ts:greeting/);
  assert.match(markdown, /items_many/);
  assert.match(markdown, /profiles\/plain\/en-GB\/example\.ts/);
  assert.equal(await readFile(new URL("locales/fr/example.ts", f.sourceRoot), "utf8"), before);
});

test("honours exact-source reviews while finding stale reviews, extra catalogs and dependency-token damage", async (t) => {
  const f = await fixture(t);
  await f.catalog("locales/en-GB/example.ts", {
    url: "URL",
    next: "Next {step} of {steps}",
    search: "Find $",
    save: "Save",
  });
  await f.catalog("locales/nl/example.ts", {
    url: "URL",
    next: "Volgende {step}",
    search: "Zoeken",
    save: "Opslaan",
    removed: "Verwijderd",
  });
  await f.catalog("locales/nl/old.ts", { old: "Oud" });
  await writeFile(
    new URL("unchanged-nl.json", f.reviewsRoot),
    JSON.stringify({
      "locales/en-GB/example.ts": {
        url: { source: "URL", reason: "Same technical abbreviation in Dutch." },
        save: { source: "Old Save", reason: "Outdated review" },
      },
      "locales/en-GB/old.ts": {},
    })
  );
  const {
    locales: [locale],
  } = await findTranslationGaps(f);
  assert.equal(locale.summary.missing, 0);
  assert.equal(locale.summary.reviewedUnchanged, 1);
  assert.equal(locale.summary.unchangedAwaitingReview, 0);
  assert.equal(locale.summary.staleReviews, 1);
  assert.deepEqual(
    locale.files[0].validationIssues.map(({ code }) => code),
    ["unknown-key", "dependency-token", "dependency-token"]
  );
  assert.deepEqual(
    locale.issues.map(({ code }) => code),
    ["stale-review-file", "extra-catalog"]
  );
  assert.equal(locale.complete, false);
});

test("continues after a broken catalog and can explicitly audit an entirely absent locale", async (t) => {
  const f = await fixture(t);
  await f.catalog("locales/en-GB/example.ts", { save: "Save" });
  await f.catalog("locales/fr/example.ts", { save: "Enregistrer" });
  await writeFile(new URL("locales/fr/example.ts", f.sourceRoot), "export const catalog = { syntax error };\n");
  await f.catalog("locales/de/example.ts", { save: "Speichern" });
  const report = await findTranslationGaps({ ...f, locales: ["fr", "de", "it"] });
  const french = report.locales.find(({ locale }) => locale === "fr");
  assert.equal(french.summary.missing, 1);
  assert.equal(french.summary.missingFiles, 0);
  assert.equal(french.files[0].validationIssues[0].code, "load-error");
  assert.equal(report.locales.find(({ locale }) => locale === "de").complete, true);
  assert.equal(report.locales.find(({ locale }) => locale === "it").summary.missingFiles, 1);
  await assert.rejects(findTranslationGaps({ ...f, locales: ["en-GB"] }), /English source/);
});
