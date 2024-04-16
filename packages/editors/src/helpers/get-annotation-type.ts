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

export function getAnnotationType(strategy: RenderingStrategy): [SupportedAnnotationTypes, string] {
  const unsupported: [SupportedAnnotationTypes, string] = ["unsupported", "Unsupported strategy"];
  if (strategy.type === "unknown") {
    return unsupported;
  }
  if (strategy.type === "images") {
    if (strategy.images.length > 1) {
      return ["unsupported", "Unsupported multiple images"];
    }

    if (strategy.image.service) {
      return ["image-with-service", "Image with service"];
    }

    const imageId = strategy.image.id;
    try {
      const resp = parseImageServiceRequest(imageId);
      if (resp.type === "image") {
        // we have an image FROM a service.
        return ["image-from-service", "Image from service"];
      }
    } catch (e) {
      // Let this fall-through.
    }
    return ["image", "Image"];
  }
  if (strategy.type === "textual-content") {
    return ["textual-body", "Textual content"];
  }
  if (strategy.type === "media") {
    return ["av-resource", "AV Resource"];
  }

  if (strategy.type === "3d-model") {
    return ["3d-model", "3D Model"];
  }

  return unsupported;
}
