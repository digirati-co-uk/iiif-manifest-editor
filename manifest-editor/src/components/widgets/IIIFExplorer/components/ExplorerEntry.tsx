import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { useStore } from "zustand";
import { Reference } from "@iiif/presentation-3";
import { ResourceNavigation } from "@/components/widgets/IIIFExplorer/components/ResourceNavigation";
import { IIIFExplorerProps } from "@/components/widgets/IIIFExplorer/IIIFExplorer";
import { ExplorerInput } from "@/components/widgets/IIIFExplorer/components/ExplorerInput";

export function ExplorerEntry({
  entry,
  canReset,
  onBack,
}: {
  entry?: IIIFExplorerProps["entry"];
  canReset: boolean;
  onBack?: () => void;
}) {
  const store = useExplorerStore();
  const history = useStore(store, (s) => s.history);
  const selected = useStore(store, (s) => s.selected);

  if (history.length === 0 && !selected) {
    if (!entry) {
      return <div>Unknown?</div>;
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
