import { useCollection, useVault } from "react-iiif-vault";
import { ResourceNavigationItem } from "@/components/widgets/IIIFExplorer/components/ResourceNavigationItem";
import { useStore } from "zustand";
import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { collectionListingContainer } from "@/components/widgets/IIIFExplorer/styles/CollectionListing.styles";
import * as $ from "@/components/widgets/IIIFExplorer/styles/ExplorerEntry.styles";

export function HomepageCollection({ id, clearCollection }: { id: string; clearCollection?: () => void }) {
  const collection = useCollection({ id });
  const store = useExplorerStore();
  const selected = useStore(store, (s) => s.selected);
  const select = useStore(store, (s) => s.select);
  const vault = useVault();

  if (!collection) {
    return <div />;
  }

  return (
    <>
      <div className={$.Section}>
        <div className={$.SectionLabel}>Recent items</div>
        {clearCollection ? (
          <button className={$.SectionAction} onClick={() => clearCollection()}>
            Clear
          </button>
        ) : null}
      </div>

      <div className={collectionListingContainer}>
        {collection.items?.map((item, idx) => {
          const isSelected = item.id === selected?.id;

          return (
            <ResourceNavigationItem
              key={item.id}
              id={item.id}
              isSelected={isSelected}
              index={idx}
              select={() => {
                select(item);
                // setIsOpen(false);
              }}
              item={vault.get(item as any)}
            />
          );
        })}
      </div>
    </>
  );
}
