import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { builtinLoaders } from "../src/catalogs.ts";
import { canonicalLocale } from "../src/schema.ts";
import { createCatalogContract } from "../src/validation.ts";
import { parseTranslationJson, renderCatalogTypeScript } from "../src/translation-files.ts";

const { values } = parseArgs({
  options: {
    input: { type: "string" },
    locale: { type: "string" },
    namespace: { type: "string" },
    partial: { type: "boolean" },
    replace: { type: "boolean" },
    help: { type: "boolean" },
  },
});
if (values.help) {
  console.log(
    "Usage: npm run translations:import -- --input FILE --locale fr --namespace editors [--partial] [--replace]\nValidates before writing src/locales/<locale>/<namespace>.ts inside this package. Does not enable/register a locale. Source English cannot be overwritten."
  );
} else {
  if (!values.input || !values.locale || !values.namespace)
    throw new Error("--input, --locale and --namespace are required");
  const locale = canonicalLocale(values.locale);
  if (locale === "en-GB")
    throw new Error("Edit source English directly; importing over the source locale is not allowed");
  if (!Object.hasOwn(builtinLoaders, values.namespace)) throw new Error("Unknown namespace");
  const source = await builtinLoaders[values.namespace]();
  const json = await readFile(values.input, "utf8");
  const catalog = parseTranslationJson(json, createCatalogContract(source), { locale, complete: !values.partial });
  const directory = new URL(`../src/locales/${locale}/`, import.meta.url);
  const output = new URL(`${values.namespace}.ts`, directory);
  let exists = false;
  try {
    await access(output);
    exists = true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (exists && !values.replace)
    throw new Error("Translation already exists; review the input and use --replace to overwrite");
  await mkdir(directory, { recursive: true });
  await writeFile(output, renderCatalogTypeScript(catalog));
  console.log(
    `Wrote ${locale}/${values.namespace}.ts. Complete linguistic review and add explicit exports/loaders/coverage policy before enabling this locale.`
  );
}
