import assert from "node:assert/strict";
import test from "node:test";
import { catalog as editors } from "../src/locales/en-GB/editors.ts";
import { builtinNamespaces, createBuiltinRegistry, prepareBuiltinResources } from "../src/catalogs.ts";
import { createCatalogContract, validateCatalog, catalogCoverage, resourceCoverage } from "../src/validation.ts";
import { composeResources } from "../src/composition.ts";
import { createPseudoCatalog } from "../src/pseudo.ts";
import { createMessageReference, message } from "../src/messages.ts";
import { flattenCatalog } from "../src/schema.ts";

const source = {
  action: "Add canvas",
  selected_one: "{{count}} canvas selected",
  selected_other: "{{count}} canvases selected",
};
const contract = createCatalogContract(source);

test("every seed catalog and all built-in overlay combinations validate", async () => {
  for (const profile of ["standard", "plain"])
    for (const preset of ["manifest", "collection", "exhibition"]) {
      const result = await prepareBuiltinResources({ namespaces: builtinNamespaces, profile, preset });
      for (const [namespace, catalog] of Object.entries(result.resources["en-GB"])) {
        assert.deepEqual(validateCatalog(catalog, result.contracts[namespace], { locale: "en-GB" }), [], namespace);
      }
      assert.equal(result.coverage, "seed");
    }
});

test("requested namespaces alone are registered", async () => {
  const registry = await createBuiltinRegistry(["editors"]);
  assert.deepEqual(registry.namespaces(), ["editors"]);
});

test("partial overlays inherit, complete catalogs report missing keys", () => {
  assert.deepEqual(validateCatalog({ action: "Add page" }, contract, { locale: "en-GB", complete: false }), []);
  assert.equal(catalogCoverage({ action: "Add page" }, contract, "en-GB").complete, false);
});

test("required-namespace coverage does not count fallback English as translated text", () => {
  const resources = { "en-GB": { demo: source }, fr: { demo: { action: "Ajouter" } } };
  assert.equal(resourceCoverage(resources, { demo: contract }, "fr", ["demo"]).complete, false);
  assert.equal(resourceCoverage(resources, { demo: contract }, "en-GB", ["demo"]).complete, true);
  assert.equal(resourceCoverage(resources, { demo: contract }, "en-GB", ["unknown"]).complete, false);
});

test("locales validate their own plural categories rather than the English shape", () => {
  const arabic = {
    action: "إضافة",
    ...Object.fromEntries(
      new Intl.PluralRules("ar")
        .resolvedOptions()
        .pluralCategories.map((category) => [`selected_${category}`, "{{count}} عنصر"])
    ),
  };
  assert.deepEqual(validateCatalog(arabic, contract, { locale: "ar" }), []);
  delete arabic.selected_few;
  assert.ok(
    validateCatalog(arabic, contract, { locale: "ar" }).some(
      (issue) => issue.code === "missing-plural" && issue.path === "selected_few"
    )
  );
});

test("unexpected keys, placeholders, empty values and bad interpolation are rejected", () => {
  assert.ok(
    validateCatalog({ typo: "Value" }, contract, { locale: "en-GB", complete: false }).some(
      (issue) => issue.code === "unknown-key"
    )
  );
  assert.ok(
    validateCatalog({ selected_other: "{{total}} items" }, contract, { locale: "en-GB", complete: false }).some(
      (issue) => issue.code === "placeholders"
    )
  );
  assert.ok(
    validateCatalog({ action: " " }, contract, { locale: "en-GB", complete: false }).some(
      (issue) => issue.code === "empty"
    )
  );
  assert.ok(
    validateCatalog({ action: "Hello {{" }, contract, { locale: "en-GB", complete: false }).some(
      (issue) => issue.code === "syntax"
    )
  );
  assert.ok(
    validateCatalog({ action: "Hello $t(other)" }, contract, { locale: "en-GB", complete: false }).some(
      (issue) => issue.code === "syntax"
    )
  );
});

test("rich messages require declared, balanced tags without HTML attributes", () => {
  assert.throws(() => createCatalogContract({ help: "Read <link>this</link>" }), /Invalid source/);
  const rich = createCatalogContract({ help: "Read <link>{{title}}</link>" }, { richText: ["help"] });
  assert.deepEqual(validateCatalog({ help: "<link>{{title}}</link> lesen" }, rich, { locale: "de" }), []);
  for (const help of [
    '<link href="javascript:bad">{{title}}</link>',
    "<link>{{title}}</strong>",
    "<strong>{{title}}</strong>",
    '<0 href="https://evil.example">{{title}}</0>',
    "<0>{{title}}</0>",
    "<i18nvalue0>{{title}}</i18nvalue0>",
    '<link href="https://evil.example/<link>">{{title}}</link>',
    "<link>{{title}}</link><unfinished",
    "<{{title}}",
  ]) {
    assert.ok(validateCatalog({ help }, rich, { locale: "de" }).length > 0);
  }
});

test("non-data values, unsafe keys, accessors and circular catalogs are rejected", () => {
  const circular = {};
  circular.self = circular;
  const getter = {};
  Object.defineProperty(getter, "label", {
    enumerable: true,
    get() {
      throw new Error("Must not execute");
    },
  });
  for (const invalid of [
    null,
    [],
    { action: 3 },
    { action: ["Text"] },
    JSON.parse('{"__proto__":{"polluted":"yes"}}'),
    { "bad.key": "Text" },
    circular,
    getter,
  ]) {
    assert.ok(validateCatalog(invalid, contract, { locale: "en-GB" }).some((issue) => issue.code === "shape"));
  }
  assert.equal({}.polluted, undefined);
});

test("source plural variants must agree on interpolation contracts", () => {
  assert.throws(() => createCatalogContract({ n_one: "One", n_other: "{{count}} items" }), /same placeholders/);
});

test("all overlay layers have deterministic priority and never mutate base data", () => {
  const layer = (action) => ({ "en-GB": { demo: { action } } });
  const base = { "en-GB": { demo: source } };
  const result = composeResources(
    {
      base,
      presets: [layer("Parent"), layer("Child")],
      profile: layer("Plain"),
      presetProfile: layer("Plain exhibition"),
      host: layer("Museum"),
    },
    { demo: contract }
  );
  assert.equal(result["en-GB"].demo.action, "Museum");
  assert.equal(source.action, "Add canvas");
  assert.ok(Object.isFrozen(result["en-GB"].demo));
  assert.equal(
    composeResources({ base, presets: [layer("Parent"), layer("Child")], profile: layer("Plain") }, { demo: contract })[
      "en-GB"
    ].demo.action,
    "Plain"
  );
});

test("fallback languages stay separate and a new profile cannot retain old overrides", async () => {
  const resources = composeResources(
    { base: { "en-GB": { demo: source }, fr: { demo: { action: "Ajouter" } } } },
    { demo: contract }
  );
  assert.equal(resources.fr.demo.selected_one, undefined);
  const plain = await prepareBuiltinResources({ namespaces: ["editors"], profile: "plain" });
  const standard = await prepareBuiltinResources({ namespaces: ["editors"], profile: "standard" });
  assert.equal(plain.resources["en-GB"].editors.canvas.add, "Add page");
  assert.equal(standard.resources["en-GB"].editors.canvas.add, "Add canvas");
});

test("exhibition and plain wording combine through their intersection overlay", async () => {
  const result = await prepareBuiltinResources({ namespaces: ["editors"], profile: "plain", preset: "exhibition" });
  assert.equal(result.resources["en-GB"].editors.canvas.add, "Add slide");
  assert.equal(result.resources["en-GB"].editors.fields.label, "Title");
});

test("composition rejects undeclared namespaces, nulls, spelling errors and group replacement", () => {
  assert.throws(() => composeResources({ base: { "en-GB": { other: source } } }, { demo: contract }), /Unregistered/);
  assert.throws(() => composeResources({ base: { "en-gb": { demo: source } } }, { demo: contract }), /canonical/);
  assert.throws(
    () => composeResources({ base: { "en-GB": { demo: { action: null } } } }, { demo: contract }),
    /plain object/
  );
});

test("pseudo locale preserves placeholders and rich tags while expanding visible text", () => {
  const source = { message: "Read <link>{{name}}</link>", empty: "" };
  const result = createPseudoCatalog(source);
  assert.match(result.message, /<link>\{\{name\}\}<\/link>/);
  assert.ok(result.message.length > source.message.length);
  assert.equal(result.empty, "");
  assert.equal(source.message, "Read <link>{{name}}</link>");
  assert.throws(() => createPseudoCatalog(source, Infinity), /Expansion/);
  assert.deepEqual(
    validateCatalog(createPseudoCatalog(editors), createCatalogContract(editors), { locale: "en-XA" }),
    []
  );
});

test("message references stay serialisable and immutable", () => {
  const reference = message("editors", "canvas.count", { values: { count: 2 } });
  assert.deepEqual(JSON.parse(JSON.stringify(reference)), {
    namespace: "editors",
    key: "canvas.count",
    values: { count: 2 },
  });
  assert.ok(Object.isFrozen(reference.values));
  assert.equal(createMessageReference("plugin-museum", "actions.open").namespace, "plugin-museum");
  assert.throws(() => createMessageReference("__proto__", "x"), /namespace/);
  assert.throws(() => createMessageReference("demo", "__proto__.x"), /key/);
  assert.throws(() => createMessageReference("demo", "x", { values: { n: NaN } }), /finite/);
  assert.equal(flattenCatalog(editors).get("fields.label"), "Label");
});
