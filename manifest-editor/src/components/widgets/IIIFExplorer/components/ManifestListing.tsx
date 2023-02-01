import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { useStore } from "zustand";
import {
  useManifest,
  useVaultSelector,
  ManifestContext,
  useCanvasSequence,
  CanvasContext,
  useVault,
} from "react-iiif-vault";
import { CanvasNormalized, ManifestNormalized } from "@iiif/presentation-3";
import { useKeyboardListNavigation } from "@/hooks/use-keyboard-list-navigation";
import { LazyCanvasThumbnail } from "@/components/widgets/IIIFExplorer/components/LazyCanvasThumbnail";
import React, { useMemo } from "react";
import invariant from "tiny-invariant";
import * as $ from "@/components/widgets/IIIFExplorer/styles/ManifestListing.styles";
import { CanvasSnippet } from "@/components/widgets/IIIFExplorer/components/CanvasSnippet";

function useBestCanvasRatio() {
  const manifest = useManifest();
  const vault = useVault();

  invariant(manifest);

  return useMemo(() => {
    if (!manifest || !manifest.items.length) {
      return { ratio: 1 };
    }
    const toSample = vault.get<CanvasNormalized>(manifest.items.slice(0, 20));
    const len = toSample.length;
    const state = { height: 0, width: 0 };
    if (!len) {
      return { ratio: 1 };
    }

    for (const canvas of toSample) {
      state.height += canvas.height || 0;
      state.width += canvas.width || 0;
    }

    const toReturn = {
      ratio: 1,
      height: state.height / len,
      width: state.width / len,
    };

    toReturn.ratio = toReturn.width / toReturn.height;

    return toReturn;
  }, [manifest, vault]);
}

function ManifestListingInner() {
  const manifest = useManifest();
  const sequence = useCanvasSequence({ disablePaging: false });
  const container = useKeyboardListNavigation<HTMLDivElement>("data-manifest-list-index");
  const store = useExplorerStore();
  const { ratio } = useBestCanvasRatio();

  invariant(manifest);

  return (
    <div className={$.ManifestListing} {...container}>
      <div className={$.ThumbnailList} style={{ "--thumb-ratio": ratio } as any}>
        {sequence.sequence.map((ids, n) => (
          <div key={n} className={$.ThumbnailGroup} style={{ "--item-count": ids.length } as any}>
            {ids
              .map((id) => sequence.items[id])
              .map((item, k) => (
                <CanvasContext canvas={item.id} key={item.id + k}>
                  <CanvasSnippet onClick={() => store.getState().select(item.id)} />
                </CanvasContext>
              ))}
          </div>
        ))}
      </div>

      {manifest.items.map((m) => (
        <li>
          {m.id}
          <LazyCanvasThumbnail />
        </li>
      ))}
    </div>
  );
}

export function ManifestListing() {
  const store = useExplorerStore();
  const selected = useStore(store, (s) => s.selected);
  const manifest = useVaultSelector<ManifestNormalized | null>(
    (state, vault) => (selected ? vault.get(selected, { skipSelfReturn: false }) : null),
    [selected]
  );

  if (!selected || !manifest || (manifest && manifest.type !== "Manifest")) {
    return null;
  }

  return (
    <ManifestContext manifest={selected}>
      <ManifestListingInner />
    </ManifestContext>
  );
}
