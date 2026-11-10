import { vaultDocumentChanged } from "@manifest-editor/client-vault";
import { Vault } from "@iiif/helpers";
import { finishVaultEditSessions } from "@manifest-editor/editor-api";
import { useCallback, useEffect, useMemo } from "react";

export function useSaveVault(vault: Vault, saveChanges: () => void, saveInterval: number, enabled = true) {
  const latest = useMemo(() => ({ vault, save: undefined as undefined | (() => void) }), [vault]);
  latest.save = saveChanges;
  const save = useCallback(() => {
    void Promise.resolve(latest.save!()).catch((error) => console.error("Could not save project", error));
  }, [latest]);
  const debounce = useMemo(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => {
      clearTimeout(timer);
      timer = undefined;
    };
    return {
      schedule: () => {
        cancel();
        timer = setTimeout(save, saveInterval);
      },
      cancel,
    };
  }, [save, saveInterval]);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) {
      return () => void 0;
    }
    const flushAndSave = () => {
      finishVaultEditSessions(vault);
      save();
    };
    window.addEventListener("beforeunload", flushAndSave, false);

    return () => {
      flushAndSave();
      window.removeEventListener("beforeunload", flushAndSave);
    };
  }, [save, vault, enabled]);

  useEffect(() => {
    if (vault && enabled) {
      const stopCommits = vault.subscribeCommits(({ before, after }) => {
        if (vaultDocumentChanged(before, after)) debounce.schedule();
      });
      // Closing a group changes replayability without creating another document commit.
      const stopHistory = vault.history?.subscribe(() => debounce.schedule());
      return () => {
        stopCommits();
        stopHistory?.();
        debounce.cancel();
      };
    }
  }, [debounce, vault, enabled]);
}
