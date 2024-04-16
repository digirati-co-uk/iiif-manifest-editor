import $ from "../styles/CollectionListing.module.css";
import { useStore } from "zustand";
import { useVaultSelector } from "react-iiif-vault";
import { CollectionNormalized, NormalizedCollectionItemSchemas } from "@iiif/presentation-3-normalized";
import { useLayoutEffect } from "react";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { Spinner } from "@manifest-editor/ui/madoc/components/icons/Spinner";
import { useExplorerStore } from "../IIIFExplorer.store";
import { useKeyboardListNavigation } from "../utils";
import { ExplorerSnippet } from "./ExplorerSnippet";
import { useFilter } from "./ItemFilter";

export function CollectionListingStandalone({
  collection,
  select,
}: {
  collection?: CollectionNormalized;
  select: (item: NormalizedCollectionItemSchemas) => void;
}) {
  const store = useExplorerStore();
  const container = useKeyboardListNavigation<HTMLDivElement>("data-collection-list-index");
  const setScrollCache = useStore(store, (s) => s.setScrollCache);

  return (
    <div className={$.collectionListingContainer} {...container}>
      {collection?.items.map((item, n) => (
        <LazyLoadComponent
          key={item.id}
          visibleByDefault={n < 40}
          placeholder={
            <div data-collection-list-index={n} className={$.collectionItem} style={{ aspectRatio: "1/1" }} />
          }
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

  return <CollectionListingStandalone collection={collection} select={(item) => select(item)} />;
}
