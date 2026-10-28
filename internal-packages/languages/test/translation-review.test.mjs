import assert from "node:assert/strict";
import test from "node:test";
import { reviewTranslation } from "../src/translation-review.ts";
import { createCatalogContract } from "../src/validation.ts";

test("full fallback-shaped English cannot pass as a target translation", () => {
  const source = { save: "Save", title: "Title" };
  const report = reviewTranslation(source, { ...source }, { locale: "nl" });
  assert.equal(report.complete, false);
  assert.equal(report.reviewNeeded.length, 2);
  assert.equal(report.missing.length, 0);
});

test("borrowed terminology requires an exact-source review and a reason", () => {
  const source = { metadata: "Metadata", save: "Save" };
  const target = { metadata: "Metadata", save: "Opslaan" };
  const report = reviewTranslation(source, target, {
    locale: "nl",
    unchanged: { metadata: { source: "Metadata", reason: "Metadata is the same standard Dutch noun." } },
  });
  assert.equal(report.complete, true);
  assert.equal(report.reviewedUnchanged.length, 1);
  assert.equal(report.differentMessages, 1);
  assert.equal(
    reviewTranslation(source, target, {
      locale: "nl",
      unchanged: { metadata: { source: "Old wording", reason: "Previously reviewed" } },
    }).complete,
    false
  );
  assert.equal(
    reviewTranslation(source, target, { locale: "nl", unchanged: { metadata: { source: "Metadata", reason: "" } } })
      .complete,
    false
  );
});

test("required messages and placeholders are validated independently of fallback", () => {
  const source = { greeting: "Hello {{name}}", save: "Save" };
  const report = reviewTranslation(source, { greeting: "Hallo {{person}}" }, { locale: "nl" });
  assert.equal(report.complete, false);
  assert.deepEqual(report.missing, ["save"]);
  assert.ok(report.issues.some((entry) => entry.code === "placeholders"));
});

test("an overlay must translate its changed messages instead of inheriting standard wording", () => {
  const base = { label: "Label", add: "Add canvas" };
  const contract = createCatalogContract(base);
  const report = reviewTranslation({ label: "Title" }, {}, { locale: "nl", contract, baseSource: base, overlay: true });
  assert.equal(report.complete, false);
  assert.deepEqual(report.missing, ["label"]);
  assert.equal(
    reviewTranslation(
      { label: "Title" },
      { label: "Titel" },
      { locale: "nl", contract, baseSource: base, overlay: true }
    ).complete,
    true
  );
});

test("target-locale plural categories are required, not the English category set", () => {
  const source = { items_one: "{{count}} item", items_other: "{{count}} items" };
  const japanese = { items_other: "{{count}}件" };
  const report = reviewTranslation(source, japanese, { locale: "ja" });
  assert.equal(report.complete, true);
  assert.equal(report.requiredMessages, 1);
  assert.deepEqual(report.missing, []);
});

test("neutral interpolation-only text needs no terminology exemption, but stale exemptions fail", () => {
  const source = { progress: "{{current}} / {{total}}" };
  assert.equal(reviewTranslation(source, source, { locale: "nl" }).complete, true);
  assert.equal(
    reviewTranslation(source, source, {
      locale: "nl",
      unchanged: { progress: { source: source.progress, reason: "Old exception" } },
    }).complete,
    false
  );
});

test("capitalisation changes alone do not count as translation", () => {
  assert.equal(reviewTranslation({ save: "Save" }, { save: "save" }, { locale: "nl" }).complete, false);
});
