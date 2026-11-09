import assert from "node:assert/strict";
import test from "node:test";
import { resolveUiSelection, buildLocaleChain, createI18nextOptions } from "../src/selection.ts";
import { createCatalogRegistry, createLatestLoader } from "../src/loaders.ts";
import { createCatalogContract } from "../src/validation.ts";

const locales = [
  { id: "en-GB", nativeName: "English", direction: "ltr" },
  { id: "fr", nativeName: "Français", direction: "ltr" },
  { id: "ar", nativeName: "العربية", direction: "rtl" },
];
const config = {
  defaultLocale: "en-GB",
  availableLocales: ["en-GB", "fr", "ar"],
  fallbackLocale: "en-GB",
  defaultProfile: "standard",
  availableProfiles: ["standard", "plain"],
};

test("controlled, persisted, browser and default selections have explicit precedence", () => {
  assert.equal(
    resolveUiSelection(config, locales, [], { locale: "ar", persistedLocale: "fr", preferredLocales: ["en-GB"] })
      .locale,
    "ar"
  );
  assert.equal(
    resolveUiSelection(config, locales, [], { persistedLocale: "fr", preferredLocales: ["ar"] }).locale,
    "fr"
  );
  assert.equal(resolveUiSelection(config, locales, [], { preferredLocales: ["fr-CA"] }).locale, "fr");
  assert.equal(resolveUiSelection(config, locales, [], { persistedLocale: "invalid_!" }).locale, "en-GB");
  assert.equal(resolveUiSelection(config, locales).profile, "standard");
  assert.equal(resolveUiSelection(config, locales, [], { locale: "ar" }).direction, "rtl");
});

test("host and inherited preset restrictions intersect and child defaults win", () => {
  const selection = resolveUiSelection(config, locales, [
    { availableLocales: ["fr", "ar"], defaultLocale: "ar" },
    { availableLocales: ["fr"], defaultProfile: "plain" },
  ]);
  assert.equal(selection.locale, "fr");
  assert.equal(selection.profile, "plain");
  assert.deepEqual(selection.availableLocales, ["fr"]);
  assert.throws(() => resolveUiSelection(config, locales, [{ availableLocales: [] }]), /empty intersection/);
  assert.throws(() => resolveUiSelection(config, locales, [{ availableProfiles: [] }]), /empty intersection/);
  assert.throws(
    () => resolveUiSelection(config, locales, [{ availableLocales: ["fr"] }], { locale: "ar" }),
    /Controlled locale/
  );
});

test("configuration errors and duplicate locale metadata fail early", () => {
  assert.throws(() => resolveUiSelection({ ...config, defaultProfile: "unknown" }, locales), /Default profile/);
  assert.throws(() => resolveUiSelection({ ...config, fallbackLocale: "de" }, locales), /unregistered/);
  assert.throws(() => resolveUiSelection(config, [...locales, locales[0]]), /Duplicate/);
  assert.throws(() => resolveUiSelection(config, locales, [], { profile: "unknown" }), /Controlled profile/);
});

test("fallback chains can include a registered, non-selectable source locale", () => {
  const selection = resolveUiSelection({ ...config, defaultLocale: "fr", availableLocales: ["fr"] }, locales);
  assert.deepEqual(selection.localeChain, ["fr", "en-GB"]);
  assert.deepEqual(buildLocaleChain("zh-Hant-TW", "en-GB", ["zh-Hant-TW", "zh-Hant", "zh", "en-GB"]), [
    "zh-Hant-TW",
    "zh-Hant",
    "zh",
    "en-GB",
  ]);
  const options = createI18nextOptions(selection, ["common"]);
  assert.equal(options.lng, "fr");
  assert.deepEqual(options.fallbackLng, ["en-GB"]);
  assert.equal(options.load, "currentOnly");
});

const source = { open: "Open", greeting: "Hello {{name}}" };
const registration = (load = async () => source) => ({
  owner: "core",
  namespace: "demo",
  sourceLocale: "en-GB",
  contract: createCatalogContract(source),
  loaders: { "en-GB": load },
});

test("namespace ownership is local to each registry and collisions are rejected", () => {
  const registry = createCatalogRegistry();
  registry.register(registration());
  assert.throws(() => registry.register({ ...registration(), owner: "other" }), /already registered/);
  const second = createCatalogRegistry();
  second.register(registration());
  assert.deepEqual(second.namespaces(), ["demo"]);
});

test("concurrent loads are coalesced and returned catalogs are immutable", async () => {
  let calls = 0;
  const registry = createCatalogRegistry();
  registry.register(
    registration(async () => {
      calls++;
      return source;
    })
  );
  const [a, b] = await Promise.all([registry.load(["en-GB"], ["demo"]), registry.load(["en-GB"], ["demo"])]);
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
  assert.ok(Object.isFrozen(a["en-GB"].demo));
  assert.notEqual(a["en-GB"].demo, source);
});

test("failed loads can be retried without poisoning the registry", async () => {
  let calls = 0;
  const registry = createCatalogRegistry();
  registry.register(
    registration(async () => {
      if (++calls === 1) throw new Error("Offline");
      return source;
    })
  );
  await assert.rejects(registry.load(["en-GB"], ["demo"]), /Offline/);
  assert.equal((await registry.load(["en-GB"], ["demo"]))["en-GB"].demo.open, "Open");
});

test("foreign locales can be partial but source catalogs must be complete", async () => {
  const registry = createCatalogRegistry();
  registry.register({
    ...registration(),
    loaders: { "en-GB": async () => source, fr: async () => ({ open: "Ouvrir" }) },
  });
  const resources = await registry.load(["fr", "en-GB"], ["demo"]);
  assert.equal(resources.fr.demo.greeting, undefined);
  assert.equal(resources["en-GB"].demo.greeting, "Hello {{name}}");
  const bad = createCatalogRegistry();
  bad.register(registration(async () => ({ open: "Open" })));
  await assert.rejects(bad.load(["en-GB"], ["demo"]), /missing/);
});

test("invalid plugin data is rejected before becoming resources", async () => {
  const registry = createCatalogRegistry();
  registry.register(registration(async () => ({ ...source, greeting: "Hello {{wrong}}" })));
  await assert.rejects(registry.load(["en-GB"], ["demo"]), /placeholders/);
  await assert.rejects(registry.load(["en-GB"], ["unknown"]), /Unregistered/);
  assert.throws(() => createCatalogRegistry().register({ ...registration(), loaders: {} }), /source-locale/);
});

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

test("a slower old selection cannot overwrite the latest successful selection", async () => {
  const slow = deferred();
  const fast = deferred();
  const loader = createLatestLoader((name) => (name === "slow" ? slow.promise : fast.promise));
  const oldRequest = loader.load("slow");
  const newRequest = loader.load("fast");
  fast.resolve("French");
  assert.equal((await newRequest).status, "committed");
  slow.resolve("English");
  assert.equal((await oldRequest).status, "superseded");
  assert.equal(loader.current(), "French");
  assert.equal(loader.isLoading(), false);
});

test("current failures preserve the last snapshot; stale failures do not surface", async () => {
  const stale = deferred();
  const loader = createLatestLoader(async (value) => {
    if (value === "stale") return stale.promise;
    if (value === "bad") throw new Error("Offline");
    return value;
  });
  await loader.load("English");
  await assert.rejects(loader.load("bad"), /Offline/);
  assert.equal(loader.current(), "English");
  const old = loader.load("stale");
  await loader.load("French");
  stale.reject(new Error("Old failure"));
  assert.equal((await old).status, "superseded");
});
