import { IIIFBuilder } from "iiif-builder";
import { ImageService } from "@iiif/presentation-3";
import { v4 } from "uuid";

export function createCanvasFromImageService(
  builder: IIIFBuilder,
  manifestId: string,
  imageService: ImageService & { height?: number; width?: number; format?: string },
  options?: { newCanvasId?: string; imageId?: string }
) {
  const newCanvasID = options?.newCanvasId || `https://example.org/canvas/${v4()}`;
  const imageId = options?.imageId || `https://example.org/image/${v4()}`;

  builder.editManifest(manifestId, (manifest) => {
    manifest.createCanvas(newCanvasID, (canvas: any) => {
      canvas.entity.id = newCanvasID;
      canvas.height = imageService.height;
      canvas.width = imageService.width;
      canvas.createAnnotation(`${newCanvasID}/painting`, {
        id: `${newCanvasID}/painting`,
        type: "Annotation",
        motivation: "painting",
        body: [
          {
            id: imageId,
            type: "Image",
            format: imageService.format || "image/jpg",
            height: imageService.height,
            width: imageService.width,
            service: [imageService],
          },
        ],
      });
    });
  });
}
