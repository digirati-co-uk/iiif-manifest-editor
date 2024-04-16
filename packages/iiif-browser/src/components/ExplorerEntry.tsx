import { useStore } from "zustand";
import $ from "../styles/ExplorerEntry.module.css";
import { IIIFExplorerProps } from "..";
import { useExplorerStore } from "../IIIFExplorer.store";
import { ExplorerInput } from "./ExplorerInput";
import { HomepageCollection } from "./HomepageCollection";
import { ResourceNavigation } from "./ResourceNavigation";

export function ExplorerEntry({
  entry,
  canReset,
  homepageCollection,
  clearHomepageCollection,
  onBack,
  hideBack,
}: {
  entry?: IIIFExplorerProps["entry"];
  canReset: boolean;
  homepageCollection?: string;
  clearHomepageCollection?: () => void;
  onBack?: () => void;
  hideBack?: boolean;
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

  return <ResourceNavigation hideBack={hideBack} canReset={canReset} onBack={onBack} />;
}
