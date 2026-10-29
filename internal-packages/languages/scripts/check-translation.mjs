import { access, readFile, readdir } from "node:fs/promises";
import { parseArgs } from "node:util";
import { builtinLoaders, builtinNamespaces, createBuiltinRegistry } from "../src/catalogs.ts";
import { canonicalLocale } from "../src/schema.ts";
import { reviewTranslation } from "../src/translation-review.ts";

const { values } = parseArgs({ options: { locale: { type: "string", default: "nl" }, json: { type: "boolean" } } });
const locale = canonicalLocale(values.locale);
if (locale === "en-GB") throw new Error("Choose a target translation, not the English source locale");
const sourceRoot = new URL("../src/", import.meta.url);
const reviewFile = new URL(`../translations/unchanged-${locale}.json`, import.meta.url);
let exceptions = {};
try {
  exceptions = JSON.parse(await readFile(reviewFile, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (exceptions === null || typeof exceptions !== "object" || Array.isArray(exceptions))
  throw new Error("Unchanged-text reviews must be an object keyed by source file");

const contracts = (await createBuiltinRegistry(builtinNamespaces)).contracts();
const baseSources = Object.fromEntries(
  await Promise.all(Object.entries(builtinLoaders).map(async ([namespace, load]) => [namespace, await load()]))
);
const files = [];
async function collect(directory, prefix = "") {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`;
    if (entry.isDirectory()) await collect(new URL(`${entry.name}/`, directory), `${path}/`);
    else if (entry.name.endsWith(".ts") && path.split("/").includes("en-GB")) files.push(path);
  }
}
for (const folder of ["locales", "profiles", "presets"]) await collect(new URL(`${folder}/`, sourceRoot), `${folder}/`);

const reports = [];
for (const sourcePath of files.sort()) {
  const targetPath = sourcePath
    .split("/")
    .map((part) => (part === "en-GB" ? locale : part))
    .join("/");
  const namespace = sourcePath.split("/").at(-1).slice(0, -3);
  if (!Object.hasOwn(contracts, namespace)) throw new Error(`Unregistered namespace in ${sourcePath}`);
  const source = (await import(new URL(sourcePath, sourceRoot))).catalog;
  const targetUrl = new URL(targetPath, sourceRoot);
  let target;
  try {
    await access(targetUrl);
    target = (await import(targetUrl)).catalog;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const report = reviewTranslation(source, target, {
    locale,
    contract: contracts[namespace],
    baseSource: baseSources[namespace],
    overlay: !sourcePath.startsWith("locales/"),
    unchanged: exceptions[sourcePath],
  });
  reports.push({ sourcePath, targetPath, ...report });
}
const staleFiles = Object.keys(exceptions).filter((path) => !files.includes(path));
const report = {
  locale,
  complete: reports.every((entry) => entry.complete) && !staleFiles.length,
  catalogs: reports.length,
  requiredMessages: reports.reduce((sum, entry) => sum + entry.requiredMessages, 0),
  missingMessages: reports.reduce((sum, entry) => sum + entry.missing.length, 0),
  unchangedReviewNeeded: reports.reduce((sum, entry) => sum + entry.reviewNeeded.length, 0),
  staleFiles,
  reports,
};
if (values.json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(
    `${locale}: ${report.catalogs} catalog/overlay files, ${report.requiredMessages} required messages, ${report.missingMessages} missing, ${report.unchangedReviewNeeded} unchanged English messages awaiting review.`
  );
  for (const item of reports.filter((entry) => !entry.complete)) {
    console.log(`\n${item.targetPath}`);
    for (const issue of item.issues) console.log(`  ${issue.code}: ${issue.path} — ${issue.message}`);
  }
  for (const path of staleFiles) console.log(`Stale terminology review file: ${path}`);
  console.log(
    "This is catalog evidence only. Whole-UI completion also requires migrated callers and integration acceptance."
  );
}
if (!report.complete) process.exitCode = 1;
