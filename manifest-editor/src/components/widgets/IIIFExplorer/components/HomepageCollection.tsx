import { useCollection, useVault } from "react-iiif-vault";
import { ResourceNavigationItem } from "@/components/widgets/IIIFExplorer/components/ResourceNavigationItem";
import { useStore } from "zustand";
import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { collectionListingContainer } from "@/components/widgets/IIIFExplorer/styles/CollectionListing.styles";
import * as $ from "@/components/widgets/IIIFExplorer/styles/ExplorerEntry.styles";
import { CollectionListingStandalone } from "@/components/widgets/IIIFExplorer/components/CollectionListing";

export function HomepageCollection({ id, clearCollection }: { id: string; clearCollection?: () => void }) {
  const collection = useCollection({ id });
  const store = useExplorerStore();
  const select = useStore(store, (s) => s.select);

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
        <CollectionListingStandalone collection={collection} select={(item) => select(item)} />
      </div>
    </>
  );
}
