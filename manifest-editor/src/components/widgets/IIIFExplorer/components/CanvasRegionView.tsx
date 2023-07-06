import { useStore } from "zustand";
import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";

export function CanvasRegionView() {
  const store = useExplorerStore();
  const selected = useStore(store, (s) => s.selected);

  if (selected?.type !== "CanvasRegion") {
    return null;
  }

  return (
    <div>
      Canvas region <pre>{JSON.stringify(selected, null, 2)}</pre>
    </div>
  );
}
