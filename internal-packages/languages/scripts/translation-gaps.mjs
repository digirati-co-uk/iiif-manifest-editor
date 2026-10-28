import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { canonicalLocale, flattenCatalog } from "../src/schema.ts";
import { createCatalogContract } from "../src/validation.ts";
import { reviewTranslation } from "../src/translation-review.ts";

const sourceLocale = "en-GB";
const missingCodes = new Set(["missing-key", "missing-plural", "missing-overlay"]);
const reviewCodes = new Set(["unchanged-unreviewed", "stale-review"]);
const plural = /_(zero|one|two|few|many|other)$/;
const sorted = (items) => [...items].sort((a, b) => a.localeCompare(b, "en"));

async function walk(root, prefix = "") {
  const files = [];
  for (const entry of await readdir(new URL(prefix, root), { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`;
    if (entry.isDirectory()) files.push(...(await walk(root, `${path}/`)));
    else if (entry.name.endsWith(".ts")) files.push(path);
  }
  return files;
}

function expectedText(source, base, key) {
  return (
    source.get(key) ??
    base.get(key) ??
    source.get(key.replace(plural, "_other")) ??
    base.get(key.replace(plural, "_other"))
  );
}

/** Read catalogs directly, without composing English fallback or changing translations. */
export async function findTranslationGaps({
  sourceRoot = new URL("../src/", import.meta.url),
  reviewsRoot = new URL("../translations/", import.meta.url),
  locales,
} = {}) {
  const allFiles = (
    await Promise.all(["locales/", "profiles/", "presets/"].map((folder) => walk(sourceRoot, folder)))
  ).flat();
  const sources = new Map();
  for (const path of sorted(allFiles.filter((file) => file.split("/").includes(sourceLocale)))) {
    const catalog = (await import(new URL(path, sourceRoot))).catalog;
    sources.set(path, { catalog, flat: flattenCatalog(catalog) });
  }
  if (!sources.size) throw new Error("No English source catalogs found");
  const bases = new Map();
  for (const [path, source] of sources) {
    if (path.startsWith("locales/")) {
      bases.set(path.split("/").at(-1), { ...source, contract: createCatalogContract(source.catalog) });
    }
  }

  // The English tree defines where locale directories belong, including future overlays.
  const prefixes = sorted(new Set([...sources.keys()].map((path) => path.split(`/${sourceLocale}/`)[0] + "/")));
  const discovered = new Map();
  for (const prefix of prefixes) {
    for (const entry of await readdir(new URL(prefix, sourceRoot), { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === sourceLocale || prefixes.includes(`${prefix}${entry.name}/`)) continue;
      let locale;
      try {
        locale = canonicalLocale(entry.name);
      } catch {
        continue;
      }
      if (locale === sourceLocale) continue;
      if (discovered.has(locale) && discovered.get(locale) !== entry.name)
        throw new Error(`Duplicate locale directories for ${locale}`);
      discovered.set(locale, entry.name);
    }
  }
  const selected = locales?.length ? sorted(new Set(locales.map(canonicalLocale))) : sorted(discovered.keys());
  if (selected.includes(sourceLocale)) throw new Error("Choose target translations, not the English source locale");
  if (!selected.length) throw new Error("No target locale directories found");
  const reports = [];
  for (const locale of selected) {
    const directory = discovered.get(locale) || locale;
    const files = [];
    const issues = [];
    let reviews = {};
    try {
      reviews = JSON.parse(await readFile(new URL(`unchanged-${locale}.json`, reviewsRoot), "utf8"));
      if (!reviews || typeof reviews !== "object" || Array.isArray(reviews))
        throw new Error("Reviews must be an object keyed by source file");
    } catch (error) {
      if (error.code !== "ENOENT")
        issues.push({ code: "review-file", path: `unchanged-${locale}.json`, message: String(error) });
      reviews = {};
    }
    for (const [sourcePath, source] of sources) {
      const targetPath = sourcePath.replace(`/${sourceLocale}/`, `/${directory}/`);
      const namespace = sourcePath.split("/").at(-1).slice(0, -3);
      const base = bases.get(`${namespace}.ts`);
      if (!base) throw new Error(`No base namespace for ${sourcePath}`);
      let target;
      let missingFile = false;
      let loadError;
      try {
        await readFile(new URL(targetPath, sourceRoot));
      } catch (error) {
        if (error.code === "ENOENT") missingFile = true;
        else loadError = String(error);
      }
      if (!missingFile && !loadError) {
        try {
          target = (await import(new URL(targetPath, sourceRoot))).catalog;
          if (target === undefined) throw new Error("Module does not export catalog");
        } catch (error) {
          loadError = String(error);
        }
      }
      const review = reviewTranslation(source.catalog, target, {
        locale,
        contract: base.contract,
        baseSource: base.catalog,
        overlay: !sourcePath.startsWith("locales/"),
        unchanged: Object.hasOwn(reviews, sourcePath) ? reviews[sourcePath] : undefined,
      });
      const validationIssues = review.issues.filter(({ code }) => !missingCodes.has(code) && !reviewCodes.has(code));
      if (loadError) validationIssues.push({ code: "load-error", path: "", message: loadError });
      // Additional substitution syntaxes used by dependency UI are outside i18next's contract.
      let targetFlat = new Map();
      try {
        targetFlat = flattenCatalog(target ?? {});
      } catch {
        /* Shape issue already recorded. */
      }
      for (const [key, text] of targetFlat) {
        const original = expectedText(source.flat, base.flat, key);
        if (original === undefined) continue;
        const tokens = original.match(/\{steps?\}|\$/g) || [];
        for (const token of new Set(tokens)) {
          if (!text.includes(token))
            validationIssues.push({
              code: "dependency-token",
              path: key,
              message: `Missing dependency substitution token: ${token}`,
            });
        }
        if (/ZXQ\d|ZXENTRY|__PH_/.test(text) && !/ZXQ\d|ZXENTRY|__PH_/.test(original)) {
          validationIssues.push({
            code: "translation-marker",
            path: key,
            message: "Unresolved machine-translation marker",
          });
        }
      }
      const terminologyIssues = review.issues.filter(({ code }) => reviewCodes.has(code));
      files.push({
        sourcePath,
        targetPath,
        namespace,
        layer: sourcePath.startsWith("locales/") ? "base" : sourcePath.split(`/${sourceLocale}/`)[0],
        missingFile,
        requiredMessages: review.requiredMessages,
        presentRequiredMessages: review.requiredMessages - review.missing.length,
        missing: review.missing.map((key) => ({ key, source: expectedText(source.flat, base.flat, key) })),
        validationIssues,
        unchanged: review.reviewNeeded,
        reviewedUnchanged: review.reviewedUnchanged,
        terminologyIssues,
      });
    }
    for (const path of Object.keys(reviews).filter((path) => !sources.has(path))) {
      issues.push({ code: "stale-review-file", path, message: "Review has no corresponding English source file" });
    }
    const expectedPaths = new Set(files.map(({ targetPath }) => targetPath));
    const extraFiles = allFiles.filter(
      (path) => prefixes.some((prefix) => path.startsWith(`${prefix}${directory}/`)) && !expectedPaths.has(path)
    );
    for (const path of sorted(extraFiles))
      issues.push({ code: "extra-catalog", path, message: "Catalog has no corresponding English source file" });
    const required = files.reduce((sum, file) => sum + file.requiredMessages, 0);
    const missing = files.reduce((sum, file) => sum + file.missing.length, 0);
    const invalid = files.reduce((sum, file) => sum + file.validationIssues.length, 0);
    const unchanged = files.reduce((sum, file) => sum + file.unchanged.length, 0);
    const terminology = files.reduce((sum, file) => sum + file.terminologyIssues.length, 0);
    reports.push({
      locale,
      language: new Intl.DisplayNames(["en"], { type: "language" }).of(locale),
      complete: missing === 0 && invalid === 0 && terminology === 0 && issues.length === 0,
      summary: {
        required,
        present: required - missing,
        missing,
        coverage: required ? Number((((required - missing) / required) * 100).toFixed(2)) : 100,
        missingFiles: files.filter((file) => file.missingFile).length,
        validationIssues: invalid,
        unchangedAwaitingReview: unchanged,
        reviewedUnchanged: files.reduce((sum, file) => sum + file.reviewedUnchanged.length, 0),
        staleReviews: terminology - unchanged,
        localeIssues: issues.length,
      },
      issues,
      files,
    });
  }
  return {
    generatedAt: new Date().toISOString(),
    sourceLocale,
    sourceCatalogs: sources.size,
    note: "Current on-disk catalogs only, without fallback. Presence does not establish linguistic quality, source freshness, UI reachability or host registration.",
    complete: reports.every((report) => report.complete),
    locales: reports,
  };
}

const cell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ").replaceAll("\r", " ");
const table = (headers, rows) =>
  [headers, headers.map(() => "---"), ...rows].map((row) => `| ${row.map(cell).join(" | ")} |`).join("\n");

export function renderGapMarkdown(report) {
  const sections = [
    "# Translation gaps",
    `Snapshot: ${report.generatedAt}. English source: ${report.sourceCatalogs} base/overlay files.`,
    report.note,
    table(
      [
        "Locale",
        "Language",
        "Present / required",
        "Key coverage",
        "Missing",
        "Invalid",
        "English matches needing review",
      ],
      report.locales.map(({ locale, language, summary: s }) => [
        locale,
        language,
        `${s.present} / ${s.required}`,
        `${s.coverage}%`,
        s.missing,
        s.validationIssues + s.localeIssues,
        s.unchangedAwaitingReview,
      ])
    ),
    "Coverage means required keys are present. Blank/invalid messages are counted separately; unchanged English may be a legitimate technical term and needs individual review. Required counts differ with each locale's plural rules. Plain/preset gaps are measured independently, even when base fallback exists.",
  ];
  const paths = sorted(new Set(report.locales.flatMap(({ files }) => files.map(({ sourcePath }) => sourcePath))));
  const gaps = paths.flatMap((path) => {
    const affected = report.locales
      .map((locale) => ({ locale: locale.locale, file: locale.files.find(({ sourcePath }) => sourcePath === path) }))
      .filter(({ file }) => file.missing.length || file.validationIssues.length);
    if (!affected.length) return [];
    const counts = affected.map(({ file }) => file.missing.length);
    const min = Math.min(...counts),
      max = Math.max(...counts);
    return [
      [
        `\`${path}\``,
        affected.map(({ locale }) => locale).join(", "),
        min === max ? min : `${min}–${max}`,
        affected.reduce((sum, { file }) => sum + file.validationIssues.length, 0),
      ],
    ];
  });
  sections.push(
    "## Gaps by catalog",
    gaps.length
      ? table(
          ["English source", "Affected locales", "Missing per affected locale", "Invalid issues across locales"],
          gaps
        )
      : "No missing messages or invalid target catalogs found."
  );
  const issueGroups = new Map();
  for (const locale of report.locales) {
    for (const file of locale.files) {
      for (const issue of file.validationIssues) {
        const key = JSON.stringify([file.sourcePath, issue.path, issue.code, issue.message]);
        if (!issueGroups.has(key))
          issueGroups.set(key, { ...issue, path: file.sourcePath + (issue.path ? `:${issue.path}` : ""), locales: [] });
        issueGroups.get(key).locales.push(locale.locale);
      }
    }
    for (const issue of locale.issues) {
      const key = JSON.stringify(issue);
      if (!issueGroups.has(key)) issueGroups.set(key, { ...issue, locales: [] });
      issueGroups.get(key).locales.push(locale.locale);
    }
  }
  if (issueGroups.size)
    sections.push(
      "## Validation and file issues",
      table(
        ["Path", "Code", "Locales", "Detail"],
        [...issueGroups.values()].map((issue) => [
          issue.path || "catalog",
          issue.code,
          issue.locales.join(", "),
          issue.message,
        ])
      )
    );
  const samples = gaps.flatMap(([path]) => {
    const sourcePath = path.slice(1, -1);
    const file = report.locales
      .flatMap(({ files }) => files)
      .find((file) => file.sourcePath === sourcePath && file.missing.length);
    return file
      ? [
          `- ${path}: ${file.missing
            .slice(0, 6)
            .map(({ key }) => `\`${key}\``)
            .join(", ")}${file.missing.length > 6 ? ", …" : ""}`,
        ]
      : [];
  });
  if (samples.length) sections.push("## Example missing keys", samples.join("\n"));
  sections.push(
    "## Re-run",
    "```sh\nnpm --prefix internal-packages/languages run translations:gaps\nnpm --prefix internal-packages/languages run translations:gaps -- --locale fr --locale de\nnpm --prefix internal-packages/languages run translations:gaps -- --format json --output translations/export/gaps.json\n```",
    "JSON includes every missing key and its current English wording, target paths, invalid contracts, exact-source terminology reviews and stale review records. Reports do not edit catalogs. Use `--check` for a nonzero exit status when gaps or outstanding reviews exist. Existing translations cannot be proven up to date after an English wording change without a stored source revision or human review. Whole-UI migration and native-speaker review remain separate checks."
  );
  return sections.join("\n\n") + "\n";
}

async function main() {
  const { values } = parseArgs({
    options: {
      locale: { type: "string", multiple: true },
      format: { type: "string", default: "markdown" },
      output: { type: "string" },
      check: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });
  if (values.help) {
    console.log(
      "Usage: node scripts/translation-gaps.mjs [--locale fr --locale de] [--format markdown|json] [--output path] [--check]\nDefaults: discover every non-English locale; print Markdown; report gaps without failing. Reads catalogs only, never fallback or translated files as a source baseline."
    );
    return;
  }
  if (!["markdown", "json"].includes(values.format)) throw new Error("--format must be markdown or json");
  const report = await findTranslationGaps({ locales: values.locale });
  const rendered = values.format === "json" ? JSON.stringify(report, null, 2) + "\n" : renderGapMarkdown(report);
  if (values.output) {
    const output = resolve(values.output);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, rendered);
    console.log(`Wrote ${output}`);
  } else process.stdout.write(rendered);
  if (values.check && !report.complete) process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
