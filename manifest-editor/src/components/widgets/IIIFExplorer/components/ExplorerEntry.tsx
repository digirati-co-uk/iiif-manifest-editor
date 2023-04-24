import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { useStore } from "zustand";
import { ResourceNavigation } from "@/components/widgets/IIIFExplorer/components/ResourceNavigation";
import { IIIFExplorerProps } from "@/components/widgets/IIIFExplorer/IIIFExplorer";
import { ExplorerInput } from "@/components/widgets/IIIFExplorer/components/ExplorerInput";
import * as $ from "@/components/widgets/IIIFExplorer/styles/ExplorerEntry.styles";
import { HomepageCollection } from "@/components/widgets/IIIFExplorer/components/HomepageCollection";

export function ExplorerEntry({
  entry,
  canReset,
  homepageCollection,
  clearHomepageCollection,
  onBack,
}: {
  entry?: IIIFExplorerProps["entry"];
  canReset: boolean;
  homepageCollection?: string;
  clearHomepageCollection?: () => void;
  onBack?: () => void;
}) {
  const store = useExplorerStore();
  const history = useStore(store, (s) => s.history);
  const selected = useStore(store, (s) => s.selected);

  if (history.length === 0 && !selected) {
    if (!entry) {
      return <div>Unknown?</div>;
    }

    if (homepageCollection) {
      return (
        <>
          <div className={$.UrlContainer}>
            <label className={$.UrlLabel} htmlFor="url">
              Browse existing manifest or collection
            </label>
            <ExplorerInput />
          </div>
          <HomepageCollection id={homepageCollection} clearCollection={clearHomepageCollection} />
        </>
      );
    }

    if (entry.type === "Text") {
      return <ExplorerInput />;
    }

    if (!canReset) {
      // Otherwise we select the entry and reset.
      store.getState().select(entry, true);
    }

    return <ExplorerInput />;
  }

  return <ResourceNavigation canReset={canReset} onBack={onBack} />;
}
