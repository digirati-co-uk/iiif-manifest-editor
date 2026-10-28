import { flattenCatalog, freezeCatalog } from "./schema.ts";
import type { Catalog, CatalogContract } from "./schema.ts";
import { assertValidCatalog } from "./validation.ts";

export function exportCatalogJson(catalog: Catalog): string {
  flattenCatalog(catalog);
  return JSON.stringify(catalog, null, 2) + "\n";
}

/** Validate translator input before it can become a catalog or overwrite a source file. */
export function parseTranslationJson(
  json: string,
  contract: CatalogContract,
  options: { locale: string; complete?: boolean }
): Catalog {
  const value: unknown = JSON.parse(json);
  assertValidCatalog(value, contract, options);
  return freezeCatalog(value);
}

export function renderCatalogTypeScript(catalog: Catalog): string {
  flattenCatalog(catalog);
  return `/** Imported translation; see translator notes and review status before enabling this locale. */\nexport const catalog = ${JSON.stringify(catalog, null, 2)} as const;\n`;
}
