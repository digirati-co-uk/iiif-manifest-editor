import { isImageService } from "@iiif/parser/image-3";
import type { ImageService, SpecificResource } from "@iiif/presentation-3";
import type { CreatorSideEffect } from "@manifest-editor/creator-api";
import { croppedRegion } from "../ContentResource/IIIFBrowserCreator/iiif-browser-creator";

export const updateCanvasThumbnailFromCrop: CreatorSideEffect = {
  canvasInteraction: true,
  spatial: true,
  async run(result, { vault, options }) {
    if (
      !(
        result &&
        result.type === "Annotation" &&
        options.targetType === "Annotation"
      )
    ) {
      return;
    }

    const fullAnno = vault.get<any>(result);
    const target = fullAnno.target as SpecificResource;
    if (!(target && target.source?.type === "Canvas")) {
      return;
    }

    const bodyRef = Array.isArray(fullAnno.body)
      ? fullAnno.body[0]
      : fullAnno.body;
    const selector = bodyRef?.selector;
    if (
      !(
        selector &&
        (selector.type === "iiif:ImageApiSelector" ||
          selector.type === "ImageApiSelector") &&
        selector.region
      )
    ) {
      return;
    }

    const [x, y, width, height] = selector.region.split(",").map(Number);
    if (
      ![x, y, width, height].every(Number.isFinite) ||
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    const [body] = vault.get(fullAnno.body);
    const imageService = (body?.service || []).find((s: any) =>
      isImageService(s),
    ) as ImageService | undefined;
    const serviceId = imageService?.id || imageService?.["@id"];
    if (!serviceId) {
      return;
    }

    const thumbnailId = croppedRegion(serviceId, { x, y, width, height }, "512,");
    vault.loadSync(thumbnailId, {
      id: thumbnailId,
      type: "Image",
      format: "image/jpeg",
      width: 512,
      height: Math.round((height / width) * 512),
      service: [imageService],
    });
    vault.modifyEntityField(target.source, "thumbnail", [
      { id: thumbnailId, type: "ContentResource" },
    ]);
  },
};
