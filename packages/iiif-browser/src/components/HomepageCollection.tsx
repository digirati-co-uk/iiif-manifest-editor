import { useCollection, useVault } from "react-iiif-vault";
import { useStore } from "zustand";
import $ from "../styles/ExplorerEntry.module.css";
import { useExplorerStore } from "../IIIFExplorer.store";
import $2 from "../styles/CollectionListing.module.css";
import { CollectionListingStandalone } from "./CollectionListing";

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

      <div className={$2.collectionListingContainer}>
        <CollectionListingStandalone collection={collection} select={(item) => select(item)} />
      </div>
    </>
  );
}
