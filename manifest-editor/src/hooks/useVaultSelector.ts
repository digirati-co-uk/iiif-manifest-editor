import { useSyncExternalStore } from "use-sync-external-store/shim";
import { useVault } from "react-iiif-vault";
import { IIIFStore, Vault } from "@iiif/vault";

export function useVaultSelector<T>(selector: (state: IIIFStore, vault: Vault) => T): T {
  const vault = useVault();
  const store = vault.getStore();
  return useSyncExternalStore(store.subscribe, () => selector(store.getState(), vault));
}
