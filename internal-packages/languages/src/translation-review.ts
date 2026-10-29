import { canonicalLocale, flattenCatalog } from "./schema.ts";
import type { Catalog, CatalogContract, ValidationIssue } from "./schema.ts";
import { createCatalogContract, validateCatalog } from "./validation.ts";

export interface UnchangedTranslationReview {
  /** Exact source text: changing English invalidates an old review. */
  readonly source: string;
  readonly reason: string;
}

export interface TranslationReviewOptions {
  readonly locale: string;
  readonly contract?: CatalogContract;
  /** An overlay only requires its changed messages, including target-locale plural forms. */
  readonly overlay?: boolean;
  readonly baseSource?: Catalog;
  readonly unchanged?: Readonly<Record<string, UnchangedTranslationReview>>;
}

function plural(path: string) {
  const match = /^(.*)_(zero|one|two|few|many|other)$/.exec(path);
  return match ? { group: match[1]!, category: match[2]! } : undefined;
}

const normalise = (text: string) => text.replace(/\s+/g, " ").trim().toLocaleLowerCase("en");
const hasWords = (text: string) => /\p{L}/u.test(text.replace(/\{\{[^}]*\}\}|<\/?[^>]*>/g, ""));

/** Catalog evidence only: this cannot establish UI reachability or linguistic quality. */
export function reviewTranslation(source: Catalog, target: unknown, options: TranslationReviewOptions) {
  const locale = canonicalLocale(options.locale);
  const sourceFlat = flattenCatalog(source);
  const baseFlat = flattenCatalog(options.baseSource || source);
  const contract = options.contract || createCatalogContract(source);
  const issues: ValidationIssue[] = validateCatalog(target ?? {}, contract, { locale, complete: !options.overlay });
  let targetFlat: ReadonlyMap<string, string>;
  try {
    targetFlat = flattenCatalog(target ?? {});
  } catch {
    targetFlat = new Map();
  }

  const required = new Set<string>();
  const categories = new Intl.PluralRules(locale).resolvedOptions().pluralCategories;
  for (const [path] of sourceFlat) {
    const variant = plural(path);
    if (variant && Object.hasOwn(contract.plurals, variant.group)) {
      for (const category of categories) required.add(`${variant.group}_${category}`);
      if (variant.category === "zero") required.add(path);
    } else required.add(path);
  }
  if (options.overlay)
    for (const path of required) {
      if (!targetFlat.has(path))
        issues.push({
          code: "missing-overlay",
          path,
          message: "A changed profile/preset message is missing from this locale",
        });
    }

  const reviewNeeded: Array<{ path: string; source: string }> = [];
  const reviewedUnchanged: Array<{ path: string; source: string; reason: string }> = [];
  const usedReviews = new Set<string>();
  let different = 0;
  for (const [path, translated] of targetFlat) {
    const variant = plural(path);
    const original =
      sourceFlat.get(path) ??
      baseFlat.get(path) ??
      (variant ? (sourceFlat.get(`${variant.group}_other`) ?? baseFlat.get(`${variant.group}_other`)) : undefined);
    if (original === undefined) continue;
    if (normalise(translated) !== normalise(original)) {
      different++;
      continue;
    }
    if (!hasWords(original)) continue;
    const exception = options.unchanged && Object.hasOwn(options.unchanged, path) ? options.unchanged[path] : undefined;
    if (exception && exception.source === original && typeof exception.reason === "string" && exception.reason.trim()) {
      reviewedUnchanged.push({ path, source: original, reason: exception.reason });
      usedReviews.add(path);
    } else {
      reviewNeeded.push({ path, source: original });
      issues.push({
        code: "unchanged-unreviewed",
        path,
        message: "Text matches English; translate it or record an exact-source terminology review",
      });
    }
  }
  for (const path of Object.keys(options.unchanged || {})) {
    if (!usedReviews.has(path))
      issues.push({
        code: "stale-review",
        path,
        message: "Unchanged-text review is unused, has a stale source, or lacks a reason",
      });
  }
  return {
    complete: issues.length === 0,
    requiredMessages: required.size,
    presentMessages: targetFlat.size,
    differentMessages: different,
    reviewedUnchanged,
    reviewNeeded,
    missing: [...required].filter((path) => !targetFlat.has(path)),
    issues,
  };
}
