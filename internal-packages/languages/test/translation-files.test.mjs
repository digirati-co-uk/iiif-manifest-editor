import assert from "node:assert/strict";
import test from "node:test";
import { createCatalogContract } from "../src/validation.ts";
import { exportCatalogJson, parseTranslationJson, renderCatalogTypeScript } from "../src/translation-files.ts";

const source = { greeting: "Hello {{name}}", quote: 'A "quoted" title' };
const contract = createCatalogContract(source);

test("JSON exchange preserves message syntax and immutable data", () => {
  const catalog = parseTranslationJson(exportCatalogJson(source), contract, { locale: "fr" });
  assert.deepEqual(catalog, source);
  assert.ok(Object.isFrozen(catalog));
});

test("invalid translator input is rejected before source generation", () => {
  assert.throws(
    () => parseTranslationJson('{"greeting":"Bonjour {{wrong}}","quote":"Titre"}', contract, { locale: "fr" }),
    /placeholders/
  );
  assert.throws(() => parseTranslationJson('{"greeting":"Bonjour {{name}}"}', contract, { locale: "fr" }), /missing/);
  assert.throws(() => parseTranslationJson('{"__proto__":{"polluted":"yes"}}', contract, { locale: "fr" }), /Unsafe/);
});

test("source generation emits string data, including code-looking text", () => {
  const catalog = { text: 'Literal `text` ${process.exit()} </script> "quoted"' };
  const rendered = renderCatalogTypeScript(catalog);
  assert.ok(rendered.includes(JSON.stringify(catalog.text)));
  assert.ok(rendered.endsWith(" as const;\n"));
});
