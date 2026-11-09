import { assertNamespace, assertRecord, canonicalLocale, freezeCatalog } from "./schema.ts";
import type { Catalog, CatalogContract, ResourceStore } from "./schema.ts";
import { assertValidCatalog } from "./validation.ts";

export interface CatalogRegistration {
  readonly owner: string;
  readonly namespace: string;
  readonly sourceLocale: string;
  readonly contract: CatalogContract;
  readonly loaders: Readonly<Record<string, () => Promise<Catalog>>>;
}

export interface CatalogRegistry {
  register(registration: CatalogRegistration): void;
  load(locales: readonly string[], namespaces: readonly string[]): Promise<ResourceStore>;
  namespaces(): string[];
  contracts(): Readonly<Record<string, CatalogContract>>;
  /** Stage registrations without changing the committed registry or its cache. */
  clone(): CatalogRegistry;
}

/** Each editor gets its own registry. Failed loads are evicted so a retry can recover. */
export function createCatalogRegistry(): CatalogRegistry {
  return createRegistry(new Map(), new Map());
}

function createRegistry(
  registrations: Map<string, CatalogRegistration>,
  cache: Map<string, Promise<Catalog>>
): CatalogRegistry {
  function register(registration: CatalogRegistration): void {
    assertNamespace(registration.namespace);
    if (!registration.owner.trim()) throw new TypeError("A catalog owner is required");
    if (registrations.has(registration.namespace))
      throw new TypeError(`Namespace already registered: ${registration.namespace}`);
    assertRecord(registration.loaders, "loaders");
    for (const [locale, loader] of Object.entries(registration.loaders)) {
      if (canonicalLocale(locale) !== locale || typeof loader !== "function")
        throw new TypeError(`Invalid loader: ${locale}`);
    }
    if (!Object.hasOwn(registration.loaders, registration.sourceLocale))
      throw new TypeError("A source-locale loader is required");
    registrations.set(
      registration.namespace,
      Object.freeze({ ...registration, loaders: Object.freeze({ ...registration.loaders }) })
    );
  }
  async function load(locales: readonly string[], namespaces: readonly string[]): Promise<ResourceStore> {
    const resources: Record<string, Record<string, Catalog>> = {};
    await Promise.all(
      [...new Set(namespaces)].flatMap((namespace) => {
        const registration = registrations.get(namespace);
        if (!registration) throw new TypeError(`Unregistered namespace: ${namespace}`);
        return [...new Set(locales.map(canonicalLocale))].map(async (locale) => {
          const loader = registration.loaders[locale];
          if (!loader) return;
          const key = `${namespace}:${locale}`;
          let pending = cache.get(key);
          if (!pending) {
            pending = Promise.resolve()
              .then(loader)
              .then((catalog) => {
                assertValidCatalog(catalog, registration.contract, {
                  locale,
                  complete: locale === registration.sourceLocale,
                });
                return freezeCatalog(catalog);
              });
            cache.set(key, pending);
            void pending.catch(() => {
              if (cache.get(key) === pending) cache.delete(key);
            });
          }
          try {
            const catalog = await pending;
            resources[locale] ||= {};
            resources[locale][namespace] = catalog;
          } catch (error) {
            // A clone can share an in-flight promise; evict failures from its own cache too.
            if (cache.get(key) === pending) cache.delete(key);
            throw error;
          }
        });
      })
    );
    return Object.freeze(
      Object.fromEntries(Object.entries(resources).map(([locale, catalogs]) => [locale, Object.freeze(catalogs)]))
    );
  }
  return Object.freeze({
    register,
    load,
    clone: () => createRegistry(new Map(registrations), new Map(cache)),
    namespaces: () => [...registrations.keys()],
    contracts: () =>
      Object.freeze(
        Object.fromEntries([...registrations].map(([namespace, registration]) => [namespace, registration.contract]))
      ),
  });
}

/** Stages work and commits only the latest successful request, retaining the previous value on failure. */
export function createLatestLoader<Request, Value>(prepare: (request: Request) => Promise<Value>) {
  let generation = 0;
  let current: Value | undefined;
  let loading = false;
  return Object.freeze({
    current: () => current,
    isLoading: () => loading,
    async load(
      request: Request
    ): Promise<{ readonly status: "committed"; readonly value: Value } | { readonly status: "superseded" }> {
      const requestId = ++generation;
      loading = true;
      try {
        const value = await prepare(request);
        if (requestId !== generation) return { status: "superseded" };
        current = value;
        return { status: "committed", value };
      } catch (error) {
        if (requestId !== generation) return { status: "superseded" };
        throw error;
      } finally {
        if (requestId === generation) loading = false;
      }
    },
  });
}
