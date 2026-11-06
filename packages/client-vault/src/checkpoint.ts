import type { IIIFStore, Vault, VaultHistorySnapshot } from "@iiif/helpers/vault";
import { vaultDocumentChanged } from "./document-changes";

export type VaultCheckpoint = {
  vaultData: IIIFStore["iiif"];
  historySnapshot?: VaultHistorySnapshot;
};

/** Capture synchronously so the document and stacks belong to the same revision. */
export function captureVaultCheckpoint(vault: Vault): VaultCheckpoint {
  let historySnapshot: VaultHistorySnapshot | undefined;
  try {
    historySnapshot = vault.history?.exportSnapshot();
  } catch (error) {
    // Autosaving must not close an active field/creator interaction. Its seal schedules another save.
    if (
      !(
        error instanceof Error &&
        error.message === "Cannot snapshot Vault history during an active interaction or commit"
      )
    )
      throw error;
  }
  return { vaultData: vault.getState().iiif, historySnapshot };
}

/** Old projects and invalid/stale checkpoints recover from the document saved in the same record. */
export function restoreVaultCheckpoint(vault: Vault, checkpoint: VaultCheckpoint): boolean {
  if (checkpoint.historySnapshot && vault.history) {
    try {
      vault.history.restoreSnapshot(checkpoint.historySnapshot);
      if (!vaultDocumentChanged({ iiif: checkpoint.vaultData }, vault.getState())) return true;
    } catch {
      // Incompatible versions or metadata policies must not make a project inaccessible.
    }
  }
  vault.getStore().setState({ iiif: checkpoint.vaultData });
  return false;
}
