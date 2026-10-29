#!/usr/bin/env node
/** Inventory candidates, not an automatic extractor or a translation-completeness check. */
import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { parseSync } from "oxc-parser";

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const textField =
  /^(?:label|title|description|summary|placeholder|alt|tooltip|helpText|emptyLabel|emptyMessage|message|text|heading|content|children|(?:open|dismiss|primary|cancel|confirm|submit|button|loading|error|success)Label|aria-label|aria-description|.*AriaLabel)$/i;
const messageCall =
  /^(?:alert|confirm|prompt|toast|notify|notification|setError|setMessage|setLabel|setStatus|log|error|warn|success|info|addToast|showToast)$/;
const translatedCall = /^(?:t|translate|formatMessage|defineMessage|defineMessages|msg|\$t)$/;
const ignoredDirectories = new Set([
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
  "fixtures",
  "__fixtures__",
  ".next",
  ".turbo",
]);
const normalise = (value) => value.replace(/\s+/g, " ").trim();
const name = (node) => node?.name ?? node?.value ?? "";
const callName = (node) => name(node?.property ?? node);
const functionNode = (node) => /Function/.test(node.type) || node.type === "MethodDefinition";

function readable(value) {
  return (
    /\p{L}/u.test(value) &&
    !/^(?:https?:|urn:|@|[./#])/.test(value) &&
    !/^\S+\.(?:png|svg|jpg|json|css|mp4)$/i.test(value)
  );
}

export function analyseSource(file, source) {
  const result = parseSync(file, source);
  const candidates = [];
  const risks = [];
  const lines = [0];
  for (let i = 0; i < source.length; i++) if (source[i] === "\n") lines.push(i + 1);
  const location = (offset) => {
    let low = 0;
    let high = lines.length;
    while (low + 1 < high) {
      const middle = (low + high) >>> 1;
      if (lines[middle] <= offset) low = middle;
      else high = middle;
    }
    return { line: low + 1, column: offset - lines[low] + 1 };
  };
  const risk = (node, kind) =>
    risks.push({
      file,
      ...location(node.start),
      kind,
      code: normalise(source.slice(node.start, node.end)).slice(0, 200),
    });

  function visit(node, ancestors = []) {
    if (!node || typeof node.type !== "string") return;
    // Imports, type declarations and translation declarations are not untranslated UI.
    if (/^(?:Import|ExportAll|TSType|TSInterface)/.test(node.type)) return;
    if (node.type === "CallExpression" && translatedCall.test(callName(node.callee))) return;
    if (node.type === "TaggedTemplateExpression" && translatedCall.test(callName(node.tag))) return;
    if (node.type === "JSXElement" && ["Trans", "FormattedMessage"].includes(name(node.openingElement.name))) return;

    if (node.type === "CallExpression" || node.type === "NewExpression") {
      const callee = normalise(source.slice(node.callee.start, node.callee.end));
      if (/\b(?:toLocaleString|toLocaleDateString|toLocaleTimeString|toFixed)$/.test(callee) || /^Intl\./.test(callee))
        risk(node, "formatting-review");
    }
    if (
      node.type === "Property" &&
      ["defaultLanguage", "availableLanguages", "advancedLanguageMode"].includes(name(node.key))
    )
      risk(node, "content-language-config");

    const string = node.type === "Literal" && typeof node.value === "string";
    const template = node.type === "TemplateLiteral";
    if (node.type === "JSXText" || string || template) {
      const value = normalise(
        template
          ? node.quasis
              .map(
                (part, i) =>
                  (part.value.cooked ?? part.value.raw) + (i < node.expressions.length ? `{{expression${i + 1}}}` : "")
              )
              .join("")
          : node.value
      );
      const parent = ancestors.at(-1);
      const attribute = ancestors.findLast((entry) => entry.type === "JSXAttribute");
      const property = ancestors.findLast((entry) => entry.type === "Property");
      const call = ancestors.findLast((entry) => entry.type === "CallExpression" || entry.type === "NewExpression");
      const jsx = ancestors.findLast((entry) => entry.type === "JSXElement" || entry.type === "JSXFragment");
      // Limit context to the current expression: an outer label/call must not classify nested code.
      const after = (entry) => (entry ? ancestors.slice(ancestors.indexOf(entry) + 1) : []);
      const inControlExpression = ancestors.some((item, index) => {
        const child = ancestors[index + 1] || node;
        return (
          (item.type === "ConditionalExpression" && item.test === child) ||
          (item.type === "LogicalExpression" && item.left === child) ||
          (item.type === "BinaryExpression" && item.operator !== "+")
        );
      });
      const safeContext = (entry) =>
        !inControlExpression &&
        !after(entry).some(
          (item) =>
            functionNode(item) ||
            item.type === "ObjectExpression" ||
            item.type === "ArrayExpression" ||
            item.type === "CallExpression" ||
            item.type === "NewExpression" ||
            item.type === "JSXElement"
        );
      let kind;
      if (node.type === "JSXText") kind = "jsx-text";
      else if (attribute && textField.test(name(attribute.name)) && safeContext(attribute)) kind = "jsx-attribute";
      else if (
        property &&
        property.value !== undefined &&
        textField.test(name(property.key)) &&
        safeContext(property)
      ) {
        if (!(parent === property && property.key === node)) kind = "object-field";
      } else if (
        call &&
        safeContext(call) &&
        (messageCall.test(callName(call.callee)) ||
          (call.type === "NewExpression" && callName(call.callee) === "Error"))
      ) {
        // Console output is developer text; persisted task logs still need human review.
        if (!/^console\./.test(source.slice(call.callee.start, call.callee.end))) kind = "message-call";
      } else if (
        jsx &&
        !inControlExpression &&
        parent?.type !== "JSXAttribute" &&
        !after(jsx).some(
          (entry) =>
            entry.type === "JSXAttribute" ||
            entry.type === "CallExpression" ||
            entry.type === "Property" ||
            functionNode(entry)
        )
      )
        kind = "jsx-expression";
      if (kind && readable(value)) {
        const flags = [];
        if (template && node.expressions.length) flags.push("interpolation");
        if (ancestors.some((entry) => entry.type === "BinaryExpression" && entry.operator === "+"))
          flags.push("concatenation");
        if (kind === "object-field" && !ancestors.some(functionNode)) flags.push("module-definition");
        if (
          kind.startsWith("jsx") &&
          jsx?.children?.some((child) => child.type === "JSXElement" || child.type === "JSXExpressionContainer")
        )
          flags.push("mixed-jsx");
        if (/\b(?:canvas|canvases|manifest|range|ranges|slide|slides|collection|collections)\b/i.test(value))
          flags.push("terminology");
        if (kind === "message-call") flags.push("user-or-developer-message-review");
        candidates.push({ file, ...location(node.start), kind, text: value, flags });
      }
      // Template contents are represented by this single candidate.
      if (template) return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === "comments") continue;
      if (Array.isArray(value)) for (const child of value) visit(child, [...ancestors, node]);
      else if (value && typeof value === "object") visit(value, [...ancestors, node]);
    }
  }
  visit(result.program);
  return {
    candidates,
    risks,
    errors: result.errors
      .filter((error) => error.severity === "Error")
      .map((error) => ({ file, message: error.message })),
  };
}

function countBy(items, key) {
  const counts = new Map();
  for (const item of items) counts.set(key(item), (counts.get(key(item)) || 0) + 1);
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

async function filesBelow(root, path) {
  const files = [];
  for (const entry of await readdir(resolve(root, path), { withFileTypes: true })) {
    if (entry.name.startsWith(".") || ignoredDirectories.has(entry.name)) continue;
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) files.push(...(await filesBelow(root, child)));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

export async function audit({
  root = repository,
  scopes = ["apps/web/src", "packages", "presets", "plugins"],
  includeTests = false,
  includeDocs = false,
} = {}) {
  let files = [];
  const missingScopes = [];
  for (const scope of scopes) {
    try {
      files.push(...(await filesBelow(root, scope)));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      missingScopes.push(scope);
    }
  }
  files = [...new Set(files)].filter(
    (file) =>
      /\.(?:[cm]?[jt]sx?)$/.test(file) &&
      !/\.d\.[cm]?ts$/.test(file) &&
      !/(?:^|\/)(?:[^/]+\.)?config\.[^/]+$/.test(file)
  );
  if (!includeTests)
    files = files.filter(
      (file) => !/(?:\.(?:test|spec|stories)\.[^/]+$|\/(?:__tests__|tests|playwright|storybook)\/)/.test(file)
    );
  if (!includeDocs) files = files.filter((file) => !/(?:^|\/)(?:docs|tutorials|examples)\//.test(file));
  files.sort();
  const candidates = [];
  const risks = [];
  const errors = [];
  let lines = 0;
  for (const file of files) {
    const source = await readFile(resolve(root, file), "utf8");
    lines += source.split("\n").length;
    const result = analyseSource(file, source);
    candidates.push(...result.candidates);
    risks.push(...result.risks);
    errors.push(...result.errors);
  }
  const area = (file) => file.split("/").slice(0, 2).join("/");
  const legacy = (file) => /(?:^|\/)LegacyManifestEditor\//.test(file);
  let revision = null;
  try {
    revision = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    /* Fixtures need not be git repositories. */
  }
  return {
    schemaVersion: 1,
    revision,
    scope: { scopes, includeTests, includeDocs, missingScopes },
    summary: {
      filesScanned: files.length,
      linesScanned: lines,
      candidateOccurrences: candidates.length,
      distinctCandidateTexts: new Set(candidates.map((item) => item.text)).size,
      filesWithCandidates: new Set(candidates.map((item) => item.file)).size,
      legacyOccurrences: candidates.filter((item) => legacy(item.file)).length,
      nonLegacyOccurrences: candidates.filter((item) => !legacy(item.file)).length,
      parseErrors: errors.length,
    },
    byArea: countBy(candidates, (item) => area(item.file)),
    byKind: countBy(candidates, (item) => item.kind),
    byFlag: countBy(
      candidates.flatMap((item) => item.flags),
      (flag) => flag
    ),
    byFile: countBy(candidates, (item) => item.file),
    repeatedTexts: countBy(candidates, (item) => item.text).filter((item) => item.count > 1),
    riskSummary: countBy(risks, (item) => item.kind),
    candidates,
    risks,
    errors,
  };
}

export function markdown(report, top = 20) {
  const table = (rows) =>
    [
      "| Item | Count |",
      "| --- | ---: |",
      ...rows.map((row) => `| ${row.name.replace(/\|/g, "\\|").replace(/\n/g, " ")} | ${row.count} |`),
    ].join("\n");
  return [
    "# Internationalisation scope audit",
    "",
    `Revision: ${report.revision || "unversioned"}. Scopes: ${report.scope.scopes.join(", ")}. Tests: ${report.scope.includeTests}. Docs/tutorials/examples: ${report.scope.includeDocs}.`,
    "",
    "Candidates require review. Occurrences are edit sites, distinct texts are not final message IDs, and flags overlap. This is a syntactic inventory, not a proof of UI reachability or translation completeness.",
    "",
    table(Object.entries(report.summary).map(([name, count]) => ({ name, count }))),
    "",
    "## Candidates by workspace",
    "",
    table(report.byArea),
    "",
    "## Candidate kinds",
    "",
    table(report.byKind),
    "",
    "## Complexity flags",
    "",
    table(report.byFlag),
    "",
    "## Other review points",
    "",
    table(report.riskSummary),
    "",
    `## Top ${top} files`,
    "",
    table(report.byFile.slice(0, top)),
    "",
    `## Top ${top} repeated texts`,
    "",
    table(report.repeatedTexts.slice(0, top)),
    "",
    "## Limits",
    "",
    "Finds JSX text, selected display attributes/object fields, and selected message calls. Excludes comments, imports, types, known translation calls/components, build output, fixtures, and (by default) tests, Storybook, Playwright and tutorial/example files. LegacyManifestEditor is counted separately, but other dormant code may remain. Object labels can contain authored IIIF defaults, protocol values or developer errors. Review these before extracting; do not translate persisted identifiers or existing content. Strings in arbitrary variables, arrays, Markdown/MDX, JSON, CSS generated content, indirect calls and dependency UI can be missed. Mixed JSX and concatenation can produce multiple fragments of one future message. A language switch cannot be inferred from this inventory.",
    "",
    ...(report.scope.missingScopes.length ? [`Missing scopes: ${report.scope.missingScopes.join(", ")}.`, ""] : []),
    ...(report.errors.length
      ? ["## Parse errors", "", ...report.errors.map((error) => `- ${error.file}: ${error.message}`), ""]
      : []),
  ].join("\n");
}

async function main() {
  const { values } = parseArgs({
    options: {
      root: { type: "string" },
      scope: { type: "string", multiple: true },
      json: { type: "string" },
      markdown: { type: "string" },
      top: { type: "string", default: "20" },
      "include-tests": { type: "boolean" },
      "include-docs": { type: "boolean" },
      help: { type: "boolean" },
    },
  });
  if (values.help) {
    console.log(
      "Usage: node scripts/audit-i18n.mjs [--root DIR] [--scope RELATIVE_DIR ...] [--json FILE|-] [--markdown FILE] [--top N] [--include-tests] [--include-docs]\nDefaults: apps/web/src, packages, presets, plugins. With --include-docs, apps/docs is also scanned (JS/TS only). Paths for output are relative to cwd. No output files are written unless requested."
    );
    return;
  }
  const top = Number(values.top);
  if (!Number.isInteger(top) || top < 1) throw new Error("--top must be a positive integer");
  const report = await audit({
    root: resolve(values.root || repository),
    scopes:
      values.scope ||
      (values["include-docs"] ? ["apps/web/src", "apps/docs", "packages", "presets", "plugins"] : undefined),
    includeTests: values["include-tests"],
    includeDocs: values["include-docs"],
  });
  const save = async (path, contents) => {
    await mkdir(dirname(resolve(path)), { recursive: true });
    await writeFile(path, contents);
  };
  if (values.json && values.json !== "-") await save(values.json, JSON.stringify(report, null, 2) + "\n");
  if (values.markdown) await save(values.markdown, markdown(report, top));
  console.log(values.json === "-" ? JSON.stringify(report, null, 2) : markdown(report, top));
  if (report.errors.length || report.scope.missingScopes.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
