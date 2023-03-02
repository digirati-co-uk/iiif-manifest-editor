import * as $ from "@/components/widgets/IIIFExplorer/styles/CollectionListing.styles";
import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { useStore } from "zustand";
import { useResources, useVaultSelector } from "react-iiif-vault";
import { CollectionNormalized } from "@iiif/presentation-3";
import { ExplorerSnippet } from "@/components/widgets/IIIFExplorer/components/ExplorerSnippet";
import React, { useLayoutEffect } from "react";
import { useKeyboardListNavigation } from "@/hooks/use-keyboard-list-navigation";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { collectionItem } from "@/components/widgets/IIIFExplorer/styles/CollectionListing.styles";
import { useFilter } from "@/components/widgets/IIIFExplorer/components/ItemFilter";
import { Spinner } from "../../../../madoc/components/icons/Spinner";

export function CollectionListing() {
  const store = useExplorerStore();
  const selected = useStore(store, (s) => s.selected);
  const select = useStore(store, (s) => s.select);
  const setScrollCache = useStore(store, (s) => s.setScrollCache);
  const scrollCache = useStore(store, (s) => s.scrollRestoreCache);
  const { value: filterValue } = useFilter();
  const collection = useVaultSelector<CollectionNormalized | null>(
    (state, vault) =>
      selected && (selected.type === "Collection" || selected.type === "unknown")
        ? vault.get(selected, { skipSelfReturn: false })
        : null,
    [selected]
  );
  const collectionStatus = useVaultSelector(
    (state, vault) =>
      selected && (selected.type === "Collection" || selected.type === "unknown")
        ? vault.requestStatus(selected.id)
        : undefined,
    [selected]
  );
  const container = useKeyboardListNavigation<HTMLDivElement>("data-collection-list-index");

  useLayoutEffect(() => {
    const cached = collection ? scrollCache[collection.id] : 0;
    if (cached && container.ref.current) {
      container.ref.current.scrollTop = cached;
    }
  }, [scrollCache, collection, container.ref]);

  if (collectionStatus && collectionStatus.loadingState === "RESOURCE_LOADING") {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (collectionStatus && collectionStatus.loadingState === "RESOURCE_ERROR") {
    return <div>Error loading manifest: {collectionStatus.error}</div>;
  }

  if (!selected || !collection || (collection && collection.type !== "Collection") || !collection.items) {
    return null;
  }

  return (
    <div className={$.collectionListingContainer} {...container}>
      {collection?.items.map((item, n) => (
        <LazyLoadComponent
          key={item.id}
          visibleByDefault={n < 40}
          placeholder={<div data-collection-list-index={n} className={collectionItem} style={{ aspectRatio: "1/1" }} />}
        >
          <ExplorerSnippet
            index={n}
            resource={item}
            onClick={() => {
              if (container.ref.current) {
                setScrollCache(collection.id, container.ref.current.scrollTop);
              }
              select(item);
            }}
          />
        </LazyLoadComponent>
      ))}
    </div>
  );
}
