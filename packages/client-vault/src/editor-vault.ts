import { Vault, type HistoryOptions, type VaultOptions } from "@iiif/helpers/vault";

/** Authored ME metadata. Keep this pure so browser project lists need not load the UI. */
export const EDITOR_HISTORY_METADATA = [
  "canvas-layout",
  "@manifest-editor/tags",
  "@manifest-editor/canvas-progress",
] as const;

export function createManifestEditorVault(options: Partial<VaultOptions> = {}): Vault {
  const history: HistoryOptions = typeof options.history === "object" ? options.history : {};
  return new Vault({
    ...options,
    history:
      options.history === false
        ? false
        : {
            maxGroups: 100,
            maxBytes: 10 * 1024 * 1024,
            ...history,
            metadata: [...new Set([...EDITOR_HISTORY_METADATA, ...(history.metadata || [])])],
          },
  });
}
