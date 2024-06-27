import { createContext, useContext, useEffect, useMemo } from "react";
import { Vault } from "@iiif/helpers/vault";
import { VaultProvider } from "react-iiif-vault";
import { createPreviewVault } from "./create-preview-vault";

export function usePreviewVault() {
  return useContext(PreviewVaultReactContext);
}

const PreviewVaultReactContext = createContext<Vault>(new Vault());

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
