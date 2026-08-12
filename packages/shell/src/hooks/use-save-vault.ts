import type { Vault4 } from "@iiif/helpers/vault-4";
import { useEffect } from "react";
import { useDebounce } from "tiny-use-debounce";

export function useSaveVault(vault: Vault4, saveChanges: () => void, saveInterval: number, enabled = true) {
  const debounceSaveChanges = useDebounce(saveChanges, saveInterval);

  useEffect(() => {
    if (typeof window === "undefined") {
      return () => void 0;
    }
    window.addEventListener("beforeunload", saveChanges, false);

    return () => {
      saveChanges();
      window.removeEventListener("beforeunload", saveChanges);
    };
  }, [saveChanges]);

  useEffect(() => {
    if (vault && enabled) {
      return vault.subscribe(debounceSaveChanges, true);
    }
  }, [debounceSaveChanges, vault, enabled]);
}
