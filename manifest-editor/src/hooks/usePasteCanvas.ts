import { createCanvasFromImage } from "../iiif-builder-extensions/create-canvas-from-image";
import { createCanvasFromImageService } from "../iiif-builder-extensions/create-canvas-from-image-service";
import { useResourceContext, useVault } from "react-iiif-vault";
import { useMemo } from "react";
import { IIIFBuilder } from "iiif-builder";
import { CanvasNormalized, ManifestNormalized } from "@iiif/presentation-3-normalized";
import { unstable_batchedUpdates } from "react-dom";
import { reorderEntityField } from "@iiif/helpers/vault/actions";

export function usePasteCanvas(onComplete?: (canvas: CanvasNormalized) => void) {
  const ctx = useResourceContext();
  const vault = useVault();
  const builder = useMemo(() => new IIIFBuilder(vault), [vault]);

  return function onPaste(result: any) {
    if (ctx.manifest && result.type === "Image") {
      return createCanvasFromImage(builder, ctx.manifest, result);
    }
    if (ctx.manifest && result.type.startsWith("ImageService")) {
      return createCanvasFromImageService(builder, ctx.manifest, result);
    }
  };
}

export function usePasteAfterCanvas() {
  const vault = useVault();
  const ctx = useResourceContext();
  const pasteCanvas = usePasteCanvas();
  return (canvasId: string) => (data: any) => {
    const newCanvas = pasteCanvas(data);
    if (!ctx.manifest || !newCanvas) {
      return;
    }
    const manifest = vault.get<ManifestNormalized>(ctx.manifest);
    const fromPosition = manifest.items.findIndex((r) => r.id === newCanvas.id);
    const toPosition = manifest.items.findIndex((r) => r.id === canvasId);
    if (fromPosition + 1 === toPosition) {
      return;
    }

    unstable_batchedUpdates(() => {
      vault.dispatch(
        reorderEntityField({
          id: manifest.id,
          type: "Manifest",
          endIndex: toPosition + 1,
          startIndex: fromPosition,
          key: "items",
        })
      );
    });
  };
}
