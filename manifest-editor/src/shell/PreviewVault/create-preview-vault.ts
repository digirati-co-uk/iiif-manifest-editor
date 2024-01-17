import { Vault } from "@iiif/helpers/vault";
import {
  addReference,
  batchActions,
  modifyEntityField,
  reorderEntityField,
  requestResource,
} from "@iiif/helpers/vault/actions";
import { actionListFromResource } from "@iiif/vault/utility";

export function createPreviewVault(homepageCollectionId = "vault://homepage-collection.json") {
  const vault = new Vault();

  // 1st - ensure that our "default" collection exists OR import one.
  const previewCollection = window.localStorage.getItem("preview-vault-collection");
  let didImport = false;
  if (previewCollection) {
    try {
      const previewState = JSON.parse(previewCollection);
      if (previewState.id && previewState.id === homepageCollectionId) {
        vault.dispatch(requestResource({ id: previewState.id }));
        const toDispatch: any = actionListFromResource(previewState.id, previewState);
        vault.dispatch(batchActions({ actions: toDispatch }));
        didImport = true;
      }
    } catch (e) {
      //
    }
  }

  if (!didImport) {
    const toDispatch: any = actionListFromResource(homepageCollectionId, {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: homepageCollectionId,
      type: "Collection",
      label: { en: ["Recent items"] },
      items: [],
    });
    vault.dispatch(requestResource({ id: homepageCollectionId }));
    vault.dispatch(batchActions({ actions: toDispatch }));
  }

  const clearHistory = () => {
    vault.dispatch(modifyEntityField({ id: homepageCollectionId, type: "Collection", key: "items", value: [] }));
    window.localStorage.setItem(
      "preview-vault-collection",
      JSON.stringify(vault.toPresentation3({ id: homepageCollectionId, type: "Collection" }))
    );
  };

  const addHistory = (id: string, type: string) => {
    const state = vault.getState();
    if (id && type && (type === "Collection" || type === "Manifest")) {
      const existingCollection = state.iiif.entities.Collection[homepageCollectionId];
      // This shouldn't happen... but it could.
      if (existingCollection) {
        const alreadyExists = existingCollection.items.findIndex((t) => t.id === id);
        if (alreadyExists === -1) {
          vault.dispatch(
            addReference({
              id: homepageCollectionId,
              type: "Collection",
              reference: { id, type },
              key: "items",
              index: 0,
            })
          );
        } else {
          vault.dispatch(
            reorderEntityField({
              id: homepageCollectionId,
              type: "Collection",
              key: "items",
              startIndex: alreadyExists,
              endIndex: 0,
            })
          );
        }

        window.localStorage.setItem(
          "preview-vault-collection",
          JSON.stringify(vault.toPresentation3({ id: homepageCollectionId, type: "Collection" }))
        );
      }
    }
  };

  const unsubscribe2 = vault.on("after:@iiif/REMOVE_REFERENCE", (ctx) => {
    if (ctx.action.payload.id === homepageCollectionId) {
      window.localStorage.setItem(
        "preview-vault-collection",
        JSON.stringify(vault.toPresentation3({ id: homepageCollectionId, type: "Collection" }))
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
