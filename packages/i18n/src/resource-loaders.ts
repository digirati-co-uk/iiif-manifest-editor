import { composeResources } from "@manifest-editor/languages/composition";
import { assertRecord, canonicalLocale } from "@manifest-editor/languages/schema";
import type { CatalogContract, EditorI18nResources, LocaleResourceLoader, ResourceStore } from "./types";

/** Cache data per runtime, independently of the currently committed selection. */
export function createResourceLoader(loaders: readonly LocaleResourceLoader[] = []) {
  const entries = [...new Set(loaders)].map(({ locale, load }) => {
    if (canonicalLocale(locale) !== locale || typeof load !== "function")
      throw new TypeError(`Invalid locale resource loader: ${locale}`);
    return Object.freeze({ locale, load });
  });
  const cache = new Map<LocaleResourceLoader, Promise<EditorI18nResources>>();
  return async (locales: readonly string[], contracts: Readonly<Record<string, CatalogContract>>) =>
    Promise.all(
      entries
        .filter(({ locale }) => locales.includes(locale))
        .map((loader) => {
          let pending = cache.get(loader);
          if (!pending) {
            pending = Promise.resolve()
              .then(loader.load)
              .then((resources) => {
                assertRecord(resources as unknown, "locale resources");
                for (const key of Object.keys(resources))
                  if (!["catalogs", "presets", "profiles", "presetProfiles"].includes(key))
                    throw new TypeError(`Unknown locale resource layer: ${key}`);
                const store = (value: ResourceStore = {}) => {
                  assertRecord(value, "locale resources");
                  if (Object.keys(value).some((locale) => locale !== loader.locale))
                    throw new TypeError(`Locale loader may only supply ${loader.locale}`);
                  return composeResources({ base: value }, contracts);
                };
                const profiles = (value: Readonly<Record<string, ResourceStore>> = {}) => {
                  assertRecord(value, "profiles");
                  return Object.freeze(
                    Object.fromEntries(Object.entries(value).map(([id, data]) => [id, store(data)]))
                  );
                };
                if (resources.presets !== undefined && !Array.isArray(resources.presets))
                  throw new TypeError("Locale presets must be an array");
                return Object.freeze({
                  catalogs: store(resources.catalogs),
                  presets: Object.freeze((resources.presets || []).map(store)),
                  profiles: profiles(resources.profiles),
                  presetProfiles: profiles(resources.presetProfiles),
                });
              });
            cache.set(loader, pending);
            void pending.catch(() => {
              if (cache.get(loader) === pending) cache.delete(loader);
            });
          }
          return pending;
        })
    );
}
