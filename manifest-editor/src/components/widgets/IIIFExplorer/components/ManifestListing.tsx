import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { useStore } from "zustand";
import { useVaultSelector } from "react-iiif-vault";
import { CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3";
import { useKeyboardListNavigation } from "@/hooks/use-keyboard-list-navigation";

export function ManifestListing() {
  const store = useExplorerStore();
  const selected = useStore(store, (s) => s.selected);
  const manifest = useVaultSelector<ManifestNormalized | null>(
    (state, vault) => (selected ? vault.get(selected, { skipSelfReturn: false }) : null),
    [selected]
  );
  const container = useKeyboardListNavigation<HTMLDivElement>("data-manifest-list-index");

  if (!selected || !manifest || (manifest && manifest.type !== "Manifest")) {
    return null;
  }

  return (
    <div {...container}>
      {manifest.items.map((m) => (
        <li>{m.id}</li>
      ))}
    </div>
  );
}
