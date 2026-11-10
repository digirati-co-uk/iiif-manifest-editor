import type { Translate } from "@manifest-editor/i18n";
import { RenderingStrategy } from "react-iiif-vault";
// @ts-ignore
import { parseImageServiceRequest } from "@atlas-viewer/iiif-image-api";

export type SupportedAnnotationTypes =
  | "image"
  | "image-from-service"
  | "image-with-service"
  | "av-resource"
  | "choice"
  | "textual-body"
  | "3d-model"
  | "unsupported";

export function getAnnotationType(strategy: RenderingStrategy, t?: Translate): [SupportedAnnotationTypes, string] {
  const unsupported: [SupportedAnnotationTypes, string] = [
    "unsupported",
    t ? t("annotationTypes.unsupported") : "Unsupported strategy",
  ];
  if (strategy.type === "unknown") {
    return unsupported;
  }
  if (strategy.type === "images") {
    if (strategy.images.length > 1) {
      return ["unsupported", t ? t("annotationTypes.multipleImagesUnsupported") : "Unsupported multiple images"];
    }

    if (strategy.image.service) {
      return ["image-with-service", t ? t("annotationTypes.imageWithService") : "Image with service"];
    }

    const imageId = strategy.image.id;
    try {
      const resp = parseImageServiceRequest(imageId);
      if (resp.type === "image") {
        // we have an image FROM a service.
        return ["image-from-service", t ? t("annotationTypes.imageFromService") : "Image from service"];
      }
    } catch (e) {
      // Let this fall-through.
    }
    return ["image", t ? t("annotationTypes.image") : "Image"];
  }
  if (strategy.type === "textual-content") {
    return ["textual-body", t ? t("annotationTypes.textualContent") : "Textual content"];
  }
  if (strategy.type === "media") {
    return ["av-resource", t ? t("annotationTypes.avResource") : "AV Resource"];
  }

  if (strategy.type === "3d-model") {
    return ["3d-model", t ? t("annotationTypes.model3d") : "3D Model"];
  }

  return unsupported;
}
