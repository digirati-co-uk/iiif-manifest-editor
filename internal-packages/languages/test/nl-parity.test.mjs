/**
 * Dutch (nl) catalog parity and quality tests.
 *
 * Checks:
 *   1. Every nl base catalog validates against the en-GB contract (complete=true).
 *   2. Every overlay file validates as a deep-partial of its source catalog.
 *   3. All nl plural forms are correct for the "nl" locale (one/other).
 *   4. Placeholder names in nl messages exactly match the en-GB contract.
 *   5. Apostrophe-plural strings ("pagina's", "dia's") are present and well-formed.
 *
 * These tests use Node's built-in runner (node --test) and TypeScript strip mode.
 * They must stay import-only; no builds, no side effects.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { createCatalogContract, validateCatalog } from "../src/validation.ts";
import { flattenCatalog } from "../src/schema.ts";

// ── en-GB base catalogs (source of truth for contracts) ──────────────────────
import { catalog as enCommon } from "../src/locales/en-GB/common.ts";
import { catalog as enShell } from "../src/locales/en-GB/shell.ts";
import { catalog as enEditors } from "../src/locales/en-GB/editors.ts";
import { catalog as enCreators } from "../src/locales/en-GB/creators.ts";
import { catalog as enManifest } from "../src/locales/en-GB/manifest.ts";
import { catalog as enCollection } from "../src/locales/en-GB/collection.ts";
import { catalog as enExhibition } from "../src/locales/en-GB/exhibition.ts";
import { catalog as enComponents } from "../src/locales/en-GB/components.ts";
import { catalog as enUi } from "../src/locales/en-GB/ui.ts";
import { catalog as enProjects } from "../src/locales/en-GB/projects.ts";
import { catalog as enEditorApi } from "../src/locales/en-GB/editor-api.ts";
import { catalog as enCreatorApi } from "../src/locales/en-GB/creator-api.ts";
import { catalog as enWeb } from "../src/locales/en-GB/web.ts";
import { catalog as enPluginAnnotations } from "../src/locales/en-GB/plugin-annotations.ts";
import { catalog as enPluginCanvasLabelGenerator } from "../src/locales/en-GB/plugin-canvas-label-generator.ts";
import { catalog as enPluginOcrClassification } from "../src/locales/en-GB/plugin-ocr-classification.ts";
import { catalog as enPluginOcrDocling } from "../src/locales/en-GB/plugin-ocr-docling.ts";
import { catalog as enPluginSpecifications } from "../src/locales/en-GB/plugin-specifications.ts";
import { catalog as enPluginTranslation } from "../src/locales/en-GB/plugin-translation.ts";

// ── nl base catalogs ──────────────────────────────────────────────────────────
import { catalog as nlCommon } from "../src/locales/nl/common.ts";
import { catalog as nlShell } from "../src/locales/nl/shell.ts";
import { catalog as nlEditors } from "../src/locales/nl/editors.ts";
import { catalog as nlCreators } from "../src/locales/nl/creators.ts";
import { catalog as nlManifest } from "../src/locales/nl/manifest.ts";
import { catalog as nlCollection } from "../src/locales/nl/collection.ts";
import { catalog as nlExhibition } from "../src/locales/nl/exhibition.ts";
import { catalog as nlComponents } from "../src/locales/nl/components.ts";
import { catalog as nlUi } from "../src/locales/nl/ui.ts";
import { catalog as nlProjects } from "../src/locales/nl/projects.ts";
import { catalog as nlEditorApi } from "../src/locales/nl/editor-api.ts";
import { catalog as nlCreatorApi } from "../src/locales/nl/creator-api.ts";
import { catalog as nlWeb } from "../src/locales/nl/web.ts";
import { catalog as nlPluginAnnotations } from "../src/locales/nl/plugin-annotations.ts";
import { catalog as nlPluginCanvasLabelGenerator } from "../src/locales/nl/plugin-canvas-label-generator.ts";
import { catalog as nlPluginOcrClassification } from "../src/locales/nl/plugin-ocr-classification.ts";
import { catalog as nlPluginOcrDocling } from "../src/locales/nl/plugin-ocr-docling.ts";
import { catalog as nlPluginSpecifications } from "../src/locales/nl/plugin-specifications.ts";
import { catalog as nlPluginTranslation } from "../src/locales/nl/plugin-translation.ts";

// ── nl overlay catalogs ───────────────────────────────────────────────────────
import { catalog as nlPlainEditors } from "../src/profiles/plain/nl/editors.ts";
import { catalog as nlPlainCreators } from "../src/profiles/plain/nl/creators.ts";
import { catalog as nlPlainManifest } from "../src/profiles/plain/nl/manifest.ts";
import { catalog as nlPlainExhibition } from "../src/profiles/plain/nl/exhibition.ts";
import { catalog as nlExhibitionEditors } from "../src/presets/exhibition/nl/editors.ts";
import { catalog as nlExhibitionPlainEditors } from "../src/presets/exhibition/plain/nl/editors.ts";

// ── Helpers ───────────────────────────────────────────────────────────────────

const NL_LOCALE = "nl";

function assertNoParity(nl, en, namespace) {
  const contract = createCatalogContract(en);
  const issues = validateCatalog(nl, contract, { locale: NL_LOCALE });
  assert.deepEqual(
    issues,
    [],
    `${namespace}: ${issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`
  );
}

function assertOverlayValid(overlay, en, namespace) {
  const contract = createCatalogContract(en);
  // Overlays are deep partials, so complete=false suppresses missing-key errors.
  const issues = validateCatalog(overlay, contract, { locale: NL_LOCALE, complete: false });
  assert.deepEqual(
    issues,
    [],
    `${namespace} overlay: ${issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`
  );
}

// ── Base catalog parity tests ─────────────────────────────────────────────────

test("nl/common is complete and valid against en-GB contract", () => {
  assertNoParity(nlCommon, enCommon, "common");
});

test("nl/shell is complete and valid against en-GB contract", () => {
  assertNoParity(nlShell, enShell, "shell");
});

test("nl/editors is complete and valid against en-GB contract", () => {
  assertNoParity(nlEditors, enEditors, "editors");
});

test("nl/creators is complete and valid against en-GB contract", () => {
  assertNoParity(nlCreators, enCreators, "creators");
});

test("nl/manifest is complete and valid against en-GB contract", () => {
  assertNoParity(nlManifest, enManifest, "manifest");
});

test("nl/collection is complete and valid against en-GB contract", () => {
  assertNoParity(nlCollection, enCollection, "collection");
});

test("nl/exhibition is complete and valid against en-GB contract", () => {
  assertNoParity(nlExhibition, enExhibition, "exhibition");
});

test("nl/components is complete and valid against en-GB contract", () => {
  assertNoParity(nlComponents, enComponents, "components");
});

test("nl/ui is complete and valid against en-GB contract", () => {
  assertNoParity(nlUi, enUi, "ui");
});

test("nl/projects is complete and valid against en-GB contract", () => {
  assertNoParity(nlProjects, enProjects, "projects");
});

test("nl/editor-api is complete and valid against en-GB contract", () => {
  assertNoParity(nlEditorApi, enEditorApi, "editor-api");
});

test("nl/creator-api is complete and valid against en-GB contract", () => {
  assertNoParity(nlCreatorApi, enCreatorApi, "creator-api");
});

test("nl/web is complete and valid against en-GB contract", () => {
  assertNoParity(nlWeb, enWeb, "web");
});

test("nl/plugin-annotations is complete and valid against en-GB contract", () => {
  assertNoParity(nlPluginAnnotations, enPluginAnnotations, "plugin-annotations");
});

test("nl/plugin-canvas-label-generator is complete and valid against en-GB contract", () => {
  assertNoParity(nlPluginCanvasLabelGenerator, enPluginCanvasLabelGenerator, "plugin-canvas-label-generator");
});

test("nl/plugin-ocr-classification is complete and valid against en-GB contract", () => {
  assertNoParity(nlPluginOcrClassification, enPluginOcrClassification, "plugin-ocr-classification");
});

test("nl/plugin-ocr-docling is complete and valid against en-GB contract", () => {
  assertNoParity(nlPluginOcrDocling, enPluginOcrDocling, "plugin-ocr-docling");
});

test("nl/plugin-specifications is complete and valid against en-GB contract", () => {
  assertNoParity(nlPluginSpecifications, enPluginSpecifications, "plugin-specifications");
});

test("nl/plugin-translation is complete and valid against en-GB contract", () => {
  assertNoParity(nlPluginTranslation, enPluginTranslation, "plugin-translation");
});

// ── Overlay validity tests ────────────────────────────────────────────────────

test("nl plain/editors overlay has no unknown keys or wrong placeholders", () => {
  assertOverlayValid(nlPlainEditors, enEditors, "plain/editors");
});

test("nl plain/creators overlay has no unknown keys or wrong placeholders", () => {
  assertOverlayValid(nlPlainCreators, enCreators, "plain/creators");
});

test("nl plain/manifest overlay has no unknown keys or wrong placeholders", () => {
  assertOverlayValid(nlPlainManifest, enManifest, "plain/manifest");
});

test("nl plain/exhibition overlay has no unknown keys or wrong placeholders", () => {
  assertOverlayValid(nlPlainExhibition, enExhibition, "plain/exhibition");
});

test("nl presets/exhibition/editors overlay is valid", () => {
  assertOverlayValid(nlExhibitionEditors, enEditors, "presets/exhibition/editors");
});

test("nl presets/exhibition/plain/editors overlay is valid", () => {
  assertOverlayValid(nlExhibitionPlainEditors, enEditors, "presets/exhibition/plain/editors");
});

// ── Dutch-specific quality tests ──────────────────────────────────────────────

test("nl plural categories for 'nl' locale are one/other only", () => {
  const categories = new Intl.PluralRules(NL_LOCALE).resolvedOptions().pluralCategories;
  assert.deepEqual(categories, ["one", "other"], "nl uses only one/other plural forms");
});

test("nl catalog placeholders match en-GB exactly in every namespace", () => {
  const pairs = [
    [nlCommon, enCommon, "common"],
    [nlShell, enShell, "shell"],
    [nlEditors, enEditors, "editors"],
    [nlCreators, enCreators, "creators"],
    [nlManifest, enManifest, "manifest"],
    [nlCollection, enCollection, "collection"],
    [nlExhibition, enExhibition, "exhibition"],
    [nlComponents, enComponents, "components"],
    [nlUi, enUi, "ui"],
    [nlProjects, enProjects, "projects"],
    [nlEditorApi, enEditorApi, "editor-api"],
    [nlCreatorApi, enCreatorApi, "creator-api"],
    [nlWeb, enWeb, "web"],
    [nlPluginAnnotations, enPluginAnnotations, "plugin-annotations"],
    [nlPluginCanvasLabelGenerator, enPluginCanvasLabelGenerator, "plugin-canvas-label-generator"],
    [nlPluginOcrClassification, enPluginOcrClassification, "plugin-ocr-classification"],
    [nlPluginOcrDocling, enPluginOcrDocling, "plugin-ocr-docling"],
    [nlPluginSpecifications, enPluginSpecifications, "plugin-specifications"],
    [nlPluginTranslation, enPluginTranslation, "plugin-translation"],
  ];

  const re = /\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*\}\}/g;
  const extractPlaceholders = (str) => [...str.matchAll(re)].map((m) => m[1]).sort();

  for (const [nl, en, namespace] of pairs) {
    const nlFlat = flattenCatalog(nl);
    const enFlat = flattenCatalog(en);
    for (const [path, enText] of enFlat) {
      const nlText = nlFlat.get(path);
      if (!nlText) continue; // missing-key is caught by parity tests above
      const enPlaceholders = extractPlaceholders(enText);
      const nlPlaceholders = extractPlaceholders(nlText);
      assert.deepEqual(
        nlPlaceholders,
        enPlaceholders,
        `${namespace}:${path} — placeholder mismatch: nl has [${nlPlaceholders}] vs en [${enPlaceholders}]`
      );
    }
  }
});

test("Dutch apostrophe plurals are present for pagina and dia", () => {
  const flat = flattenCatalog(nlPlainEditors);
  const paginas = flat.get("canvas.count_other");
  assert.ok(paginas?.includes("pagina's"), `Expected "pagina's" in plain/editors canvas.count_other, got: ${paginas}`);

  const diasExhibition = flattenCatalog(nlExhibitionEditors).get("canvas.count_other");
  assert.ok(diasExhibition?.includes("dia's"), `Expected "dia's" in exhibition/editors canvas.count_other, got: ${diasExhibition}`);

  const nlExhibitionFlat = flattenCatalog(nlExhibition);
  const slidePlural = nlExhibitionFlat.get("slide.count_other");
  assert.ok(slidePlural?.includes("dia's"), `Expected "dia's" in exhibition slide.count_other, got: ${slidePlural}`);
});

test("nl/web has separate interfaceLanguage and contentLanguages keys", () => {
  const flat = flattenCatalog(nlWeb);
  assert.ok(flat.has("settings.interfaceLanguage"), "interfaceLanguage key present");
  assert.ok(flat.has("settings.contentLanguages"), "contentLanguages key present");
  const iface = flat.get("settings.interfaceLanguage");
  const content = flat.get("settings.contentLanguages");
  assert.notEqual(iface, content, "interfaceLanguage and contentLanguages must be distinct translations");
});

test("nl IIIF terms are not translated in base catalogs", () => {
  // "manifest", "canvas", "range", "metadata" must appear verbatim as values
  // where they are the IIIF-term labels (not inside longer sentences).
  const manifestFlat = flattenCatalog(nlManifest);
  assert.equal(manifestFlat.get("app.title"), "Manifest Editor", "brand name preserved");

  const editorApiFlat = flattenCatalog(nlEditorApi);
  assert.equal(editorApiFlat.get("resources.canvas"), "Canvas", "canvas resource label preserved");
  assert.equal(editorApiFlat.get("resources.manifest"), "Manifest", "manifest resource label preserved");
  assert.equal(editorApiFlat.get("resources.range"), "Range", "range resource label preserved");
});
