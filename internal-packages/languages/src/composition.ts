import { assertNamespace, assertRecord, canonicalLocale, freezeCatalog } from "./schema.ts";
import type { Catalog, CatalogContract, ResourceStore } from "./schema.ts";
import { assertValidCatalog } from "./validation.ts";

export interface ResourceLayers {
  readonly base: ResourceStore;
  readonly presets?: readonly ResourceStore[];
  readonly profile?: ResourceStore;
  readonly presetProfile?: ResourceStore;
  readonly host?: ResourceStore;
}

function mergeCatalog(base: Catalog, overlay: Catalog): Catalog {
  const next: Record<string, string | Catalog> = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (value === undefined) continue;
    const previous = next[key];
    if (typeof value === "string") {
      if (previous && typeof previous !== "string") throw new TypeError(`Cannot replace a message group: ${key}`);
      next[key] = value;
    } else {
      if (typeof previous === "string") throw new TypeError(`Cannot replace a message with a group: ${key}`);
      next[key] = mergeCatalog(previous || {}, value);
    }
  }
  return next;
}

/** Returns a fresh frozen snapshot; locales are deliberately never merged with each other. */
export function composeResources(
  layers: ResourceLayers,
  contracts: Readonly<Record<string, CatalogContract>>
): ResourceStore {
  const result: Record<string, Record<string, Catalog>> = {};
  for (const layer of [layers.base, ...(layers.presets || []), layers.profile, layers.presetProfile, layers.host]) {
    if (!layer) continue;
    assertRecord(layer, "resources");
    for (const [locale, namespaces] of Object.entries(layer)) {
      if (canonicalLocale(locale) !== locale) throw new TypeError(`Use canonical locale spelling: ${locale}`);
      assertRecord(namespaces, locale);
      for (const [namespace, catalog] of Object.entries(namespaces)) {
        assertNamespace(namespace);
        const contract = Object.hasOwn(contracts, namespace) ? contracts[namespace] : undefined;
        if (!contract) throw new TypeError(`Unregistered namespace: ${namespace}`);
        assertValidCatalog(catalog, contract, { locale, complete: false });
        result[locale] ||= {};
        result[locale][namespace] = mergeCatalog(result[locale][namespace] || {}, catalog);
      }
    }
  }
  return Object.freeze(
    Object.fromEntries(
      Object.entries(result).map(([locale, namespaces]) => [
        locale,
        Object.freeze(
          Object.fromEntries(
            Object.entries(namespaces).map(([namespace, catalog]) => [namespace, freezeCatalog(catalog)])
          )
        ),
      ])
    )
  );
}
