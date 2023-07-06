import { IIIFBuilder } from "iiif-builder";
import { CanvasNormalized } from "@iiif/presentation-3-normalized";
import { ExternalWebResource } from "@iiif/presentation-3";
import { v4 } from "uuid";

export function createCanvasFromImage(
  builder: IIIFBuilder,
  manifestId: string,
  image: ExternalWebResource & { width?: number; height?: number },
  options?: { newCanvasId?: string }
) {
  const newCanvasID = options?.newCanvasId || `https://example.org/canvas/${v4()}`;

  builder.editManifest(manifestId, (manifest: any) => {
    manifest.createCanvas(newCanvasID, (canvas: any) => {
      canvas.entity.id = newCanvasID;
      canvas.height = image.height;
      canvas.width = image.width;
      canvas.createAnnotation(`${newCanvasID}/painting`, {
        id: `${newCanvasID}/painting`,
        type: "Annotation",
        motivation: "painting",
        body: {
          id: image.id,
          type: "Image",
          format: image.format,
          height: image.height,
          width: image.width,
        },
      });
    });
  });

  return builder.vault.get<CanvasNormalized>(newCanvasID);
}
