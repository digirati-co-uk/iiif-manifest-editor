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
import React, { useLayoutEffect, useMemo } from "react";
import invariant from "tiny-invariant";
import * as $ from "@/components/widgets/IIIFExplorer/styles/ManifestListing.styles";
import { CanvasSnippet } from "@/components/widgets/IIIFExplorer/components/CanvasSnippet";
import { Spinner } from "../../../../madoc/components/icons/Spinner";

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
  const select = useStore(store, (s) => s.select);
  const { ratio } = useBestCanvasRatio();

  const setScrollCache = useStore(store, (s) => s.setScrollCache);
  const scrollCache = useStore(store, (s) => s.scrollRestoreCache);
  useLayoutEffect(() => {
    const cached = manifest ? scrollCache[manifest.id] : 0;
    if (cached && container.ref.current) {
      container.ref.current.scrollTop = cached;
    }
  }, [scrollCache, manifest, container.ref]);

  invariant(manifest);

  const single = sequence.sequence.length === 1;

  return (
    <div className={$.ManifestListing} {...container}>
      <div className={$.ThumbnailList} data-single={single} style={{ "--thumb-ratio": ratio } as any}>
        {sequence.sequence.map((ids, n) => (
          <div key={n} className={$.ThumbnailGroup} style={{ "--item-count": ids.length } as any}>
            {ids
              .map((id) => sequence.items[id])
              .map((item, k) => (
                <CanvasContext canvas={item.id} key={item.id + k}>
                  <CanvasSnippet
                    onClick={() => {
                      if (container.ref.current) {
                        setScrollCache(manifest.id, container.ref.current.scrollTop);
                      }
                      select(item);
                    }}
                  />
                </CanvasContext>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ManifestListing() {
  const store = useExplorerStore();
  const selected = useStore(store, (s) => s.selected);
  const manifestStatus = useVaultSelector(
    (state, vault) =>
      selected && (selected.type === "Manifest" || selected.type === "unknown")
        ? vault.requestStatus(selected.id)
        : null,
    [selected]
  );

  if (!selected || selected.type !== "Manifest" || !manifestStatus) {
    return null;
  }

  if (manifestStatus.loadingState === "RESOURCE_LOADING") {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (manifestStatus.loadingState === "RESOURCE_ERROR") {
    return <div>Error loading manifest: {manifestStatus.error}</div>;
  }

  console.log('selected manifest -> ', selected);

  return (
    <ManifestContext manifest={selected.id}>
      <ManifestListingInner />
    </ManifestContext>
  );
}
