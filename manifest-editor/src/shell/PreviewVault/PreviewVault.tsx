import { createContext, useContext, useEffect, useMemo } from "react";
import { Vault } from "@iiif/vault";
import { VaultProvider } from "react-iiif-vault";
import { actionListFromResource } from "@iiif/vault/utility";
import {
  batchActions,
  modifyEntityField,
  reorderEntityField,
  requestResource,
  addReference,
} from "@iiif/vault/actions";

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

export function createPreviewVault() {
  const vault = new Vault();

  // 1st - ensure that our "default" collection exists OR import one.
  const previewCollection = window.localStorage.getItem("preview-vault-collection");
  let didImport = false;
  if (previewCollection) {
    try {
      const previewState = JSON.parse(previewCollection);
      if (previewState.id && previewState.id === HOMEPAGE_COLLECTION) {
        vault.dispatch(requestResource({ id: previewState.id }));
        const toDispatch = actionListFromResource(previewState.id, previewState);
        vault.dispatch(batchActions({ actions: toDispatch }));
        didImport = true;
      }
    } catch (e) {
      //
    }
  }

  if (!didImport) {
    const toDispatch = actionListFromResource(HOMEPAGE_COLLECTION, {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: HOMEPAGE_COLLECTION,
      type: "Collection",
      label: { en: ["Recent items"] },
      items: [],
    });
    vault.dispatch(requestResource({ id: HOMEPAGE_COLLECTION }));
    vault.dispatch(batchActions({ actions: toDispatch }));
  }

  const clearHistory = () => {
    vault.dispatch(modifyEntityField({ id: HOMEPAGE_COLLECTION, type: "Collection", key: "items", value: [] }));
    window.localStorage.setItem(
      "preview-vault-collection",
      JSON.stringify(vault.toPresentation3({ id: HOMEPAGE_COLLECTION, type: "Collection" }))
    );
  };

  const addHistory = (id: string, type: string) => {
    const state = vault.getState();
    if (id && type && (type === "Collection" || type === "Manifest")) {
      const existingCollection = state.iiif.entities.Collection[HOMEPAGE_COLLECTION];
      // This shouldn't happen... but it could.
      if (existingCollection) {
        const alreadyExists = existingCollection.items.findIndex((t) => t.id === id);
        if (alreadyExists === -1) {
          vault.dispatch(
            addReference({
              id: HOMEPAGE_COLLECTION,
              type: "Collection",
              reference: { id, type },
              key: "items",
              index: 0,
            })
          );
        } else {
          vault.dispatch(
            reorderEntityField({
              id: HOMEPAGE_COLLECTION,
              type: "Collection",
              key: "items",
              startIndex: alreadyExists,
              endIndex: 0,
            })
          );
        }

        window.localStorage.setItem(
          "preview-vault-collection",
          JSON.stringify(vault.toPresentation3({ id: HOMEPAGE_COLLECTION, type: "Collection" }))
        );
      }
    }
  };

  const unsubscribe2 = vault.on("after:@iiif/REMOVE_REFERENCE", (ctx) => {
    if (ctx.action.payload.id === HOMEPAGE_COLLECTION) {
      window.localStorage.setItem(
        "preview-vault-collection",
        JSON.stringify(vault.toPresentation3({ id: HOMEPAGE_COLLECTION, type: "Collection" }))
      );
    }
  });

  const unsubscribe = () => {
    // This isn't working, because React.
    // unsubscribe1();
    // unsubscribe2();
  };

  return { vault, unsubscribe, addHistory, clearHistory } as const;
}

export function PreviewVaultContext(props: { children: any }) {
  const { vault, unsubscribe, addHistory, clearHistory } = useMemo(() => {
    return createPreviewVault();
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
