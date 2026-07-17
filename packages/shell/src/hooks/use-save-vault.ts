import { Vault } from "@iiif/helpers";
import { useEffect, useRef } from "react";
import { useDebounce } from "tiny-use-debounce";

export function useSaveVault(
  vault: Vault,
  saveChanges: () => void | Promise<void>,
  saveInterval: number,
  enabled = true,
) {
  const saveChangesRef = useRef(saveChanges);
  saveChangesRef.current = saveChanges;
  const debounceSaveChanges = useDebounce(saveChanges, saveInterval);

  useEffect(() => {
    if (typeof window === "undefined") {
      return () => void 0;
    }
    const save = () => void saveChangesRef.current();
    window.addEventListener("beforeunload", save, false);

    return () => {
      save();
      window.removeEventListener("beforeunload", save);
    };
  }, []);

  useEffect(() => {
    if (vault && enabled) {
      return vault.subscribe(debounceSaveChanges, true);
    }
  }, [debounceSaveChanges, vault, enabled]);
}
