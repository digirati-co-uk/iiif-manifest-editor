import type { CatalogContract, CatalogRegistration } from "@manifest-editor/i18n/core";

function contractSignature(contract: CatalogContract): string {
  const group = (messages: CatalogContract["messages"]) =>
    Object.entries(messages)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, value.allowEmpty, [...value.placeholders].sort(), [...value.tags].sort()]);
  return JSON.stringify([group(contract.messages), group(contract.plurals)]);
}

/** Only coalesce identical loader capabilities; a namespace name alone never establishes equivalence. */
export function samePluginCatalog(a: CatalogRegistration, b: CatalogRegistration): boolean {
  if (a === b) return true;
  if (a.owner !== b.owner || a.namespace !== b.namespace || a.sourceLocale !== b.sourceLocale) return false;
  const locales = Object.keys(a.loaders);
  return (
    locales.length === Object.keys(b.loaders).length &&
    locales.every((locale) => a.loaders[locale] === b.loaders[locale]) &&
    contractSignature(a.contract) === contractSignature(b.contract)
  );
}

export function mergePluginCatalogs(...groups: ReadonlyArray<readonly CatalogRegistration[]>): CatalogRegistration[] {
  const registrations: CatalogRegistration[] = [];
  for (const registration of groups.flat()) {
    if (!registrations.some((existing) => samePluginCatalog(existing, registration))) registrations.push(registration);
  }
  return registrations;
}
