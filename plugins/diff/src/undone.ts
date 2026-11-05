import type { ManifestDiff, ResourceChange } from "@iiif/helpers/diff";

/**
 * An undone change, kept so it can be redone. It carries the slice of the diff it was undone from, so redo goes
 * through the same precondition checks as undo and refuses to overwrite anything edited since.
 */
export interface UndoneEntry {
  id: string;
  sourceUrl: string;
  at: number;
  /** The change the user clicked. */
  change: ResourceChange;
  /** Everything undone with it, including this change. */
  changeIds: string[];
  diff: ManifestDiff;
}

const MAX_ENTRIES = 50;
const storageKey = (root: string) => `manifest-editor:diff:undone:${root}`;

export function loadUndone(root: string): UndoneEntry[] {
  try {
    const parsed = JSON.parse(globalThis.localStorage?.getItem(storageKey(root)) || "[]");
    return Array.isArray(parsed) ? parsed.filter((entry) => entry?.id && entry.diff && entry.change) : [];
  } catch {
    return [];
  }
}

export function saveUndone(root: string, entries: UndoneEntry[]) {
  try {
    const key = storageKey(root);
    if (entries.length === 0) globalThis.localStorage?.removeItem(key);
    else globalThis.localStorage?.setItem(key, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // Private mode or a full quota: redo still works for this session, it just will not survive a reload.
  }
}

export function createUndoneEntry(
  sourceUrl: string,
  diff: ManifestDiff,
  change: ResourceChange,
  changeIds: string[]
): UndoneEntry {
  const changes = diff.changes.filter((candidate) => changeIds.includes(candidate.id));
  const resources = new Set(changes.map((candidate) => candidate.resource.id));
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    sourceUrl,
    at: Date.now(),
    change,
    changeIds,
    diff: { ...diff, changes, mappings: diff.mappings.filter((mapping) => resources.has(mapping.id)) },
  };
}
