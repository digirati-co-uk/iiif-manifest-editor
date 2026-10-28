import { canonicalLocale, flattenCatalog, pluralCategories } from "./schema.ts";
import type { Catalog, CatalogContract, MessageContract, ResourceStore, ValidationIssue } from "./schema.ts";

function syntax(value: string): { placeholders: string[]; tags: string[]; issues: ValidationIssue[] } {
  const placeholders: string[] = [];
  const tags: string[] = [];
  const issues: ValidationIssue[] = [];
  const remaining = value.replace(/\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*\}\}/g, (_, variable: string) => {
    placeholders.push(variable);
    return "";
  });
  if (/\{\{|\}\}|\$t\(/.test(remaining))
    issues.push({
      code: "syntax",
      path: "",
      message: "Use named {{variables}}; nesting and formatter syntax are not supported by this contract yet",
    });
  const stack: string[] = [];
  // Trans also recognises numeric tags; every markup token must pass this contract.
  for (const match of value.matchAll(/<[^<>]*>/g)) {
    const parsed = /^<(\/)?([A-Za-z][A-Za-z0-9]*)(\s*\/)?\s*>$/.exec(match[0]);
    if (!parsed) {
      issues.push({ code: "rich-text", path: "", message: "Rich tags may not contain attributes" });
      continue;
    }
    const tag = parsed[2]!;
    if (tag.toLowerCase().startsWith("i18nvalue")) {
      issues.push({
        code: "rich-text",
        path: "",
        message: "Rich tag uses the interpolation renderer's reserved prefix",
      });
      continue;
    }
    tags.push(tag);
    if (parsed[1]) {
      if (stack.pop() !== tag) issues.push({ code: "rich-text", path: "", message: `Unbalanced rich tag: ${tag}` });
    } else if (!parsed[3]) stack.push(tag);
  }
  if (stack.length) issues.push({ code: "rich-text", path: "", message: "Unclosed rich tags" });
  return { placeholders: [...new Set(placeholders)].sort(), tags: [...new Set(tags)].sort(), issues };
}

const equal = (left: readonly string[], right: readonly string[]) => JSON.stringify(left) === JSON.stringify(right);
function pluralKey(path: string): { group: string; category: string } | undefined {
  const match = /^(.*)_(zero|one|two|few|many|other)$/.exec(path);
  return match ? { group: match[1]!, category: match[2]! } : undefined;
}

export function createCatalogContract(
  source: Catalog,
  options: { allowEmpty?: readonly string[]; richText?: readonly string[] } = {}
): CatalogContract {
  const messages: Record<string, MessageContract> = {};
  const plurals: Record<string, MessageContract> = {};
  const flat = flattenCatalog(source);
  for (const [path, value] of flat) {
    const parsed = syntax(value);
    if (parsed.issues.length || (parsed.tags.length && !options.richText?.includes(path)))
      throw new TypeError(`Invalid source message: ${path}`);
    if (!value.trim() && !options.allowEmpty?.includes(path)) throw new TypeError(`Empty source message: ${path}`);
    messages[path] = Object.freeze({
      placeholders: Object.freeze(parsed.placeholders),
      tags: Object.freeze(parsed.tags),
      allowEmpty: options.allowEmpty?.includes(path) || false,
    });
  }
  for (const [path, contract] of Object.entries(messages)) {
    const plural = pluralKey(path);
    if (plural && flat.has(`${plural.group}_other`)) {
      const other = messages[`${plural.group}_other`]!;
      if (!equal(other.placeholders, contract.placeholders) || !equal(other.tags, contract.tags))
        throw new TypeError(`Plural variants need the same placeholders and rich tags: ${plural.group}`);
      plurals[plural.group] = other;
    }
  }
  return Object.freeze({ messages: Object.freeze(messages), plurals: Object.freeze(plurals) });
}

export function validateCatalog(
  value: unknown,
  contract: CatalogContract,
  options: { locale: string; complete?: boolean }
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  let flat: ReadonlyMap<string, string>;
  try {
    flat = flattenCatalog(value);
  } catch (error) {
    return [{ code: "shape", path: "", message: String(error) }];
  }
  let categories: readonly string[];
  try {
    categories = new Intl.PluralRules(canonicalLocale(options.locale)).resolvedOptions().pluralCategories;
  } catch (error) {
    return [{ code: "locale", path: "", message: String(error) }];
  }
  for (const [path, text] of flat) {
    const plural = pluralKey(path);
    const isPlural = plural && contract.plurals[plural.group];
    const expected = isPlural ? contract.plurals[plural.group] : contract.messages[path];
    if (!expected) {
      issues.push({ code: "unknown-key", path, message: "Message is absent from the namespace contract" });
      continue;
    }
    if (isPlural && ![...categories, "zero"].includes(plural.category))
      issues.push({ code: "plural-category", path, message: `Plural category is not used by ${options.locale}` });
    if (!text.trim() && !expected.allowEmpty)
      issues.push({ code: "empty", path, message: "Required message must not be blank" });
    const parsed = syntax(text);
    issues.push(...parsed.issues.map((issue) => ({ ...issue, path })));
    if (!equal(parsed.placeholders, expected.placeholders))
      issues.push({
        code: "placeholders",
        path,
        message: `Expected placeholders: ${expected.placeholders.join(", ") || "none"}`,
      });
    if (!equal(parsed.tags, expected.tags))
      issues.push({ code: "rich-tags", path, message: `Expected rich tags: ${expected.tags.join(", ") || "none"}` });
  }
  if (options.complete !== false) {
    for (const path of Object.keys(contract.messages)) {
      const plural = pluralKey(path);
      if (plural && contract.plurals[plural.group]) continue;
      if (!flat.has(path)) issues.push({ code: "missing-key", path, message: "Required message is missing" });
    }
    for (const group of Object.keys(contract.plurals))
      for (const category of categories) {
        const path = `${group}_${category}`;
        if (!flat.has(path))
          issues.push({ code: "missing-plural", path, message: `Required ${options.locale} plural form is missing` });
      }
  }
  return issues;
}

export function assertValidCatalog(
  value: unknown,
  contract: CatalogContract,
  options: { locale: string; complete?: boolean }
): asserts value is Catalog {
  const issues = validateCatalog(value, contract, options);
  if (issues.length)
    throw new TypeError(issues.map((issue) => `${issue.path || "catalog"}: ${issue.message}`).join("\n"));
}

export function catalogCoverage(value: unknown, contract: CatalogContract, locale: string) {
  const issues = validateCatalog(value, contract, { locale });
  const missing = issues
    .filter((issue) => issue.code === "missing-key" || issue.code === "missing-plural")
    .map((issue) => issue.path);
  return { complete: issues.length === 0, missing, issues };
}

/** Strict coverage excludes fallback text: a deployment must not advertise fallback as a translation. */
export function resourceCoverage(
  resources: ResourceStore,
  contracts: Readonly<Record<string, CatalogContract>>,
  locale: string,
  requiredNamespaces: readonly string[]
) {
  const canonical = canonicalLocale(locale);
  const namespaces = [...new Set(requiredNamespaces)].map((namespace) => {
    const contract = Object.hasOwn(contracts, namespace) ? contracts[namespace] : undefined;
    if (!contract)
      return {
        namespace,
        complete: false,
        missing: [],
        issues: [{ code: "namespace", path: namespace, message: "Namespace has no registered contract" }],
      };
    return { namespace, ...catalogCoverage(resources[canonical]?.[namespace] || {}, contract, canonical) };
  });
  return { complete: namespaces.every((entry) => entry.complete), namespaces };
}

// Exported for tooling that needs to distinguish genuine plural keys from ordinary IDs.
export { pluralCategories };
