import { createContext, useContext, useEffect, useMemo } from "react";
import { Vault4 } from "@iiif/helpers/vault-4";
import { VaultProvider } from "react-iiif-vault/presentation-4";
import { createPreviewVault } from "./create-preview-vault";

export function usePreviewVault() {
  return useContext(PreviewVaultReactContext);
}

const PreviewVaultReactContext = createContext<Vault4>(new Vault4());

const PreviewVaultAddHistory = createContext({
  addHistory: (id: string, type: string) => {},
  clearHistory: () => {},
});

export const HOMEPAGE_COLLECTION = "manifest-editor://homepage-collection.json";

export function usePreviewHistory() {
  return useContext(PreviewVaultAddHistory);
}

export function PreviewVaultContext(props: { children: any }) {
  const { vault, unsubscribe, addHistory, clearHistory } = useMemo(() => {
    return createPreviewVault(HOMEPAGE_COLLECTION);
  }, []);

  useEffect(() => {
    return unsubscribe;
  }, []);

  return (
    <PreviewVaultAddHistory.Provider value={{ addHistory, clearHistory }}>
      <PreviewVaultReactContext.Provider value={vault}>{props.children}</PreviewVaultReactContext.Provider>
    </PreviewVaultAddHistory.Provider>
  );
}

export function PreviewVaultBoundary({ children }: { children: any }) {
  const vault = usePreviewVault();

  return <VaultProvider vault={vault}>{children}</VaultProvider>;
}
