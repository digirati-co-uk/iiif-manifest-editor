import type { IIIFStore } from "@iiif/helpers/vault";
import { EDITOR_HISTORY_METADATA } from "./editor-vault";

function equal(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    (!Array.isArray(a) || a.length === b.length) &&
    keys.every((key) => Object.hasOwn(b, key) && equal(a[key], b[key]))
  );
}

/** Requests and operational metadata do not dirty a document. Semantic no-ops do not save. */
export function vaultDocumentChanged(
  before: IIIFStore,
  after: IIIFStore,
  metadata: readonly string[] = EDITOR_HISTORY_METADATA
): boolean {
  if (!equal(before.iiif.entities, after.iiif.entities) || !equal(before.iiif.mapping, after.iiif.mapping)) return true;
  for (const id of new Set([...Object.keys(before.iiif.meta), ...Object.keys(after.iiif.meta)])) {
    if (metadata.some((key) => !equal(before.iiif.meta[id]?.[key], after.iiif.meta[id]?.[key]))) return true;
  }
  return false;
}
