import { RangeContext, useManifest, useVault } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { ViewRange } from "./components/ViewRange";
import { EmptyCanvasState } from "../../components/organisms/EmptyCanvasState/EmptyCanvasState";
import { EmptyState } from "../../madoc/components/EmptyState";
import { RangeNavigationStyles as S } from "./RangeNavigation.styles";
import { findManifestSelectedRange, findSelectedRange } from "./components/ViewRange.helpers";
import { useAppState } from "../../shell/AppContext/AppContext";
import { getValue } from "@iiif/vault-helpers";
import { useLayoutEffect } from "react";

export function RangeNavigation() {
  const manifest = useManifest();
  const vault = useVault();
  const appState = useAppState();

  invariant(manifest);

  const selected = findManifestSelectedRange(vault, manifest, appState.state.canvasId);

  useLayoutEffect(() => {
    if (selected) {
      const found = document.querySelector(`[data-range-id="${selected.id}"]`);
      if (found) {
        found.scrollIntoView({
          block: "nearest",
          behavior: "auto",
        });
      }
    }
  }, [selected]);

  if (!manifest.structures.length) {
    return <EmptyState>No structure information</EmptyState>;
  }

  return (
    <S.Container>
      {selected ? <S.CurrentRange>{getValue(selected.label)}</S.CurrentRange> : null}

      {manifest.structures.map((range) => (
        <RangeContext key={range.id} range={range.id}>
          <ViewRange />
        </RangeContext>
      ))}
    </S.Container>
  );
}
