import { createCatalogContract as internalContract } from "@manifest-editor/languages/validation";
import { createMessageReference as internalReference } from "@manifest-editor/languages/messages";
import type { Catalog, CatalogContract, MessageReference, MessageValues } from "./types";

/** Plugins can define/validate their source contract without depending on private packages. */
export function createCatalogContract(
  source: Catalog,
  options?: { readonly allowEmpty?: readonly string[]; readonly richText?: readonly string[] }
): CatalogContract {
  return internalContract(source, options);
}

/** An open, immutable and serialisable deferred reference; no seed-only key union. */
export function createMessageReference(
  namespace: string,
  key: string,
  options?: { readonly values?: MessageValues; readonly defaultValue?: string }
): MessageReference {
  return internalReference(namespace, key, options);
}
