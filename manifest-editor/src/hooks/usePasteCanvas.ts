import { createCanvasFromImage } from "../iiif-builder-extensions/create-canvas-from-image";
import { createCanvasFromImageService } from "../iiif-builder-extensions/create-canvas-from-image-service";
import { useResourceContext, useVault } from "react-iiif-vault";
import { useMemo } from "react";
import { IIIFBuilder } from "iiif-builder";

export function usePasteCanvas() {
  const ctx = useResourceContext();
  const vault = useVault();
  const builder = useMemo(() => new IIIFBuilder(vault), [vault]);

  return function onPaste(result: any) {
    if (ctx.manifest && result.type === "Image") {
      createCanvasFromImage(builder, ctx.manifest, result);
    }
    if (ctx.manifest && result.type.startsWith("ImageService")) {
      createCanvasFromImageService(builder, ctx.manifest, result);
    }
  };
}
