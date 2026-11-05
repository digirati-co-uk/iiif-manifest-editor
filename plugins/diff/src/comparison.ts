import {
  diffNormalized,
  diffToUnifiedDiff,
  diffToVaultActions,
  type DiffState,
  type ManifestDiff,
  type ResourceChange,
  type ResourceIdentity,
} from "@iiif/helpers/diff";
import { normalize } from "@iiif/parser";

/** Normalize exported documents independently: never compare a whole editor Vault. */
export function normalizeDocument(document: unknown) {
  if (!document || typeof document !== "object") throw new Error("The source must be a IIIF JSON resource.");
  const state = normalize(structuredClone(document) as Parameters<typeof normalize>[0]);
  const resource = state.resource as ResourceIdentity;
  if (!resource?.id || !["Manifest", "Collection", "Canvas"].includes(resource.type)) {
    throw new Error("The source must be a IIIF Manifest, Collection or Canvas.");
  }
  return { state: { entities: state.entities, mapping: state.mapping } as DiffState, resource, document };
}

export function compareDocuments(
  source: DiffState,
  currentDocument: unknown,
  resource: ResourceIdentity,
  ignoreOrder = false
) {
  const current = normalizeDocument(currentDocument);
  const diff = diffNormalized(source, current.state, { arrayOrder: ignoreOrder ? "unordered" : "ordered" });
  // With different root IDs a patch against either root would omit the other document.
  const sameRoot = !!source.entities[resource.type]?.[resource.id];
  const patch = sameRoot ? diffToUnifiedDiff(source, diff, resource) : null;
  return { diff, patch, sameRoot, current: current.state };
}

export async function fetchSource(url: string, signal: AbortSignal) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Enter an HTTP or HTTPS URL.");
  const response = await fetch(parsed.href, { signal, headers: { Accept: "application/ld+json, application/json" } });
  if (!response.ok) throw new Error(`Unable to load source: HTTP ${response.status}.`);
  return normalizeDocument(await response.json());
}

/**
 * Undoing the addition or removal of a whole resource must also undo the parent reference to it, otherwise the
 * editor is left pointing at a resource that no longer exists (or missing one that should be there).
 */
export function changesToUndo(changes: ResourceChange[], change: ResourceChange) {
  const ids = [change.id];
  if (change.path.length === 0) {
    const resource = change.resource;
    for (const other of changes) {
      if (other === change || other.path.length === 0) continue;
      const mentions = (value: ResourceChange["before"]) =>
        value.exists && JSON.stringify(value.value).includes(JSON.stringify(resource.id));
      // Only when membership of the resource differs, not any other reference to it.
      if (mentions(other.before) !== mentions(other.after)) ids.push(other.id);
    }
  }
  return ids;
}

/** Vault actions that return `current` to the source for the given change. Throws on stale edits. */
export function undoActions(current: DiffState, diff: ManifestDiff, changes: ResourceChange[], change: ResourceChange) {
  return diffToVaultActions(current, diff, {
    direction: "reverse",
    changeIds: changesToUndo(changes, change),
  });
}

/** Vault actions that put an undone change back. Throws if the editor no longer holds the source value. */
export function redoActions(current: DiffState, entry: { diff: ManifestDiff; changeIds: string[] }) {
  return diffToVaultActions(current, entry.diff, { direction: "forward", changeIds: entry.changeIds });
}
