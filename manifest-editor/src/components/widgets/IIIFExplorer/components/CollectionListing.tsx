import * as $ from "@/components/widgets/IIIFExplorer/styles/CollectionListing.styles";
import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { useStore } from "zustand";
import { useResources, useVaultSelector } from "react-iiif-vault";
import { CollectionNormalized } from "@iiif/presentation-3";
import { ExplorerSnippet } from "@/components/widgets/IIIFExplorer/components/ExplorerSnippet";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useKeyboardListNavigation } from "@/hooks/use-keyboard-list-navigation";

export function CollectionListing() {
  const store = useExplorerStore();
  const selected = useStore(store, (s) => s.selected);
  const select = useStore(store, (s) => s.select);
  const setScrollCache = useStore(store, (s) => s.setScrollCache);
  const scrollCache = useStore(store, (s) => s.scrollRestoreCache);
  const collection = useVaultSelector<CollectionNormalized | null>(
    (state, vault) => (selected ? vault.get(selected, { skipSelfReturn: false }) : null),
    [selected]
  );
  const container = useKeyboardListNavigation<HTMLDivElement>("data-collection-list-index");

  useLayoutEffect(() => {
    const cached = collection ? scrollCache[collection.id] : 0;
    if (cached && container.ref.current) {
      container.ref.current.scrollTop = cached;
    }
  }, [scrollCache, collection, container.ref]);

  if (!selected || !collection || (collection && collection.type !== "Collection") || !collection.items) {
    return null;
  }

  return (
    <div className={$.collectionListingContainer} {...container}>
      {collection?.items.map((item, n) => (
        <ExplorerSnippet
          key={item.id + n}
          index={n}
          resource={item}
          onClick={() => {
            if (container.ref.current) {
              setScrollCache(collection.id, container.ref.current.scrollTop);
            }
            select(item.id);
          }}
        />
      ))}
    </div>
  );
}
