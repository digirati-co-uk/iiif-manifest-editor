import assert from "node:assert/strict";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { composeResources } from "../internal-packages/languages/src/composition.ts";
import { flattenCatalog } from "../internal-packages/languages/src/schema.ts";
import { createCatalogContract, resourceCoverage } from "../internal-packages/languages/src/validation.ts";

const sourceRoot = new URL("../internal-packages/languages/src/", import.meta.url);
const destination = new URL("../apps/web/src/i18n/coverage.json", import.meta.url);
const locales = (await readdir(new URL("locales/", sourceRoot))).sort();
async function catalogs(path) {
  const files = (await readdir(new URL(path, sourceRoot))).filter((file) => file.endsWith(".ts")).sort();
  return Object.fromEntries(
    await Promise.all(
      files.map(async (file) => [file.slice(0, -3), (await import(new URL(`${path}/${file}`, sourceRoot))).catalog])
    )
  );
}
const source = await catalogs("locales/en-GB");
const contracts = Object.fromEntries(
  Object.entries(source).map(([namespace, catalog]) => [
    namespace,
    createCatalogContract(catalog, {
      richText: [...flattenCatalog(catalog)].filter(([, text]) => /<[A-Za-z]/.test(text)).map(([key]) => key),
    }),
  ])
);
const namespaces = Object.keys(source);
const coverage = {};
for (const locale of locales) {
  const base = { [locale]: await catalogs(`locales/${locale}`) };
  const plain = { [locale]: await catalogs(`profiles/plain/${locale}`) };
  const exhibition = { [locale]: await catalogs(`presets/exhibition/${locale}`) };
  const exhibitionPlain = { [locale]: await catalogs(`presets/exhibition/plain/${locale}`) };
  coverage[locale] = {};
  for (const profile of ["standard", "plain"]) {
    const layers = { base, ...(profile === "plain" ? { profile: plain } : {}) };
    const resources = composeResources(layers, contracts);
    // Validate preset/intersection data too, even though base coverage gates the global picker.
    composeResources(
      { ...layers, presets: [exhibition], presetProfile: profile === "plain" ? exhibitionPlain : {} },
      contracts
    );
    const report = resourceCoverage(resources, contracts, locale, namespaces);
    coverage[locale][profile] = report.namespaces.flatMap((entry) => [
      ...entry.missing.map((key) => `${entry.namespace}:${key}`),
      ...entry.issues.filter((issue) => issue.code === "namespace").map(() => `${entry.namespace}:*`),
    ]);
  }
}
const output = `${JSON.stringify({ namespaces, coverage }, null, 2)}\n`;
if (process.argv.includes("--write")) await writeFile(destination, output);
else
  assert.equal(
    await readFile(destination, "utf8"),
    output,
    "Web locale coverage is stale. Run pnpm i18n:coverage:write"
  );
console.log(`Web i18n coverage: ${locales.length} locales × 2 profiles; all preset layers validated`);
