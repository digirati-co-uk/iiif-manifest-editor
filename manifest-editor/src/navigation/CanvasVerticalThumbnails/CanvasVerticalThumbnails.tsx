import { CanvasVerticalStyles as S } from "./CanvasVerticalThumbnails.styles";
import { useCanvasSubset } from "../../hooks/useCanvasSubset";
import { CanvasNormalized, ManifestNormalized, Reference } from "@iiif/presentation-3";
import { CanvasContext, useResourceContext, useVault } from "react-iiif-vault";
import { CanvasThumbnail } from "../../components/organisms/CanvasThumbnail/CanvasThumbnail";
import { getValue } from "@iiif/vault-helpers";
import { useAppState } from "../../shell/AppContext/AppContext";
import { UniversalCopyTarget } from "../../shell/Universal/UniversalCopyPaste";
import { useLayoutEffect } from "react";
import { usePasteAfterCanvas, usePasteCanvas } from "../../hooks/usePasteCanvas";
import { unstable_batchedUpdates } from "react-dom";
import { reorderEntityField } from "@iiif/vault/actions";

interface CanvasVerticalThumbnailsProps {
  ids?: Array<Reference | string>;
  onClick?: (id: string) => void;
}

export function CanvasVerticalThumbnails(props: CanvasVerticalThumbnailsProps) {
  const vault = useVault();
  const canvases = useCanvasSubset(props.ids);
  const onPasteCanvas = usePasteCanvas();
  const createPasteAfterCanvas = usePasteAfterCanvas();
  const appState = useAppState();
  const ctx = useResourceContext();

  useLayoutEffect(() => {
    if (appState.state.canvasId) {
      const found = document.querySelector(`[data-canvas-thumb-id="${appState.state.canvasId}"]`);
      if (found) {
        found.scrollIntoView({
          block: "nearest",
          behavior: "auto",
        });
      }
    }
  }, [appState.state.canvasId]);

  return (
    <UniversalCopyTarget as={S.Container} onPasteAnalysis={onPasteCanvas}>
      {canvases.map((canvasRef) => {
        const canvas = vault.get<CanvasNormalized>(canvasRef);
        return (
          <CanvasContext key={canvas.id} canvas={canvas.id}>
            <UniversalCopyTarget
              as={S.Figure}
              onPasteAnalysis={createPasteAfterCanvas(canvas.id)}
              reference={{ id: canvas.id, type: "Canvas" }}
              onClick={() => (props.onClick ? props.onClick(canvas.id) : appState.setState({ canvasId: canvas.id }))}
              style={{ aspectRatio: `${canvas.width}/${canvas.height}` }}
              $selected={appState.state.canvasId === canvas.id}
              data-canvas-thumb-id={canvas.id}
            >
              <CanvasThumbnail fluid />
              <S.Caption>{getValue(canvas.label)}</S.Caption>
            </UniversalCopyTarget>
          </CanvasContext>
        );
      })}
    </UniversalCopyTarget>
  );
}
