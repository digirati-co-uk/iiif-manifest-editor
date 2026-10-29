/** Catalog data only. Formatting and React context belong to the future public runtime. */
export type Catalog = { readonly [key: string]: string | Catalog };
export type CatalogShape<T> = { readonly [K in keyof T]: T[K] extends string ? string : CatalogShape<T[K]> };
export type CatalogOverlay<T> = { readonly [K in keyof T]?: T[K] extends string ? string : CatalogOverlay<T[K]> };
export type NamespaceCatalogs = Readonly<Record<string, Catalog>>;
export type ResourceStore = Readonly<Record<string, NamespaceCatalogs>>;
export type MessageValue = string | number | boolean | null;
export interface MessageReference<N extends string = string, K extends string = string> {
  readonly namespace: N;
  readonly key: K;
  readonly values?: Readonly<Record<string, MessageValue>>;
  readonly defaultValue?: string;
}
export interface MessageContract {
  readonly placeholders: readonly string[];
  readonly tags: readonly string[];
  readonly allowEmpty: boolean;
}
export interface CatalogContract {
  readonly messages: Readonly<Record<string, MessageContract>>;
  readonly plurals: Readonly<Record<string, MessageContract>>;
}
export interface ValidationIssue {
  readonly code: string;
  readonly path: string;
  readonly message: string;
}
export const pluralCategories = ["zero", "one", "two", "few", "many", "other"] as const;
const forbiddenKeys = new Set(["__proto__", "prototype", "constructor"]);

export function assertRecord(value: unknown, path = "catalog"): asserts value is Record<string, unknown> {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value))
  ) {
    throw new TypeError(`${path} must be a plain object`);
  }
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (forbiddenKeys.has(key) || key.includes(".") || key.includes(":"))
      throw new TypeError(`Unsafe key at ${path}.${key}`);
    if (descriptor.get || descriptor.set) throw new TypeError(`Accessors are not catalog data: ${path}.${key}`);
  }
}

export function flattenCatalog(value: unknown): ReadonlyMap<string, string> {
  const entries = new Map<string, string>();
  const seen = new Set<object>();
  function visit(branch: unknown, path: string) {
    assertRecord(branch, path || "catalog");
    if (seen.has(branch)) throw new TypeError(`Circular catalog at ${path}`);
    seen.add(branch);
    for (const [key, child] of Object.entries(branch)) {
      const next = path ? `${path}.${key}` : key;
      if (!key.trim()) throw new TypeError(`Empty catalog key at ${path}`);
      if (child === undefined) continue;
      if (typeof child === "string") entries.set(next, child);
      else visit(child, next);
    }
    seen.delete(branch);
  }
  visit(value, "");
  return entries;
}

export function freezeCatalog(catalog: Catalog): Catalog {
  const copy: Record<string, string | Catalog> = {};
  for (const [key, value] of Object.entries(catalog)) {
    if (value !== undefined) copy[key] = typeof value === "string" ? value : freezeCatalog(value);
  }
  return Object.freeze(copy);
}

export function canonicalLocale(value: string): string {
  const canonical = Intl.getCanonicalLocales(value)[0];
  if (!canonical) throw new RangeError("A locale is required");
  return canonical;
}

export function assertNamespace(value: string): void {
  if (!/^[a-z][a-z0-9-]*$/.test(value) || forbiddenKeys.has(value)) throw new TypeError(`Invalid namespace: ${value}`);
}
