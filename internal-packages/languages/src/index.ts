// No locale data or engine singleton is loaded by this entry point.
export type * from "./schema.ts";
export type * from "./selection.ts";
export type * from "./loaders.ts";
export { canonicalLocale, flattenCatalog } from "./schema.ts";
export {
  createCatalogContract,
  validateCatalog,
  assertValidCatalog,
  catalogCoverage,
  resourceCoverage,
} from "./validation.ts";
export { composeResources } from "./composition.ts";
export type { ResourceLayers } from "./composition.ts";
export { resolveUiSelection, buildLocaleChain, createI18nextOptions } from "./selection.ts";
export { createCatalogRegistry, createLatestLoader } from "./loaders.ts";
export { createPseudoCatalog } from "./pseudo.ts";
export { message, createMessageReference } from "./messages.ts";
export type { MessageKey } from "./messages.ts";
export type { BuiltinNamespace, SourceCatalogs } from "./catalog-types.ts";
