import {
  canonicalServiceUrl,
  createImageServiceRequest,
  imageServiceRequestToString,
  parseImageServiceRequest,
} from "@iiif/parser/image-3";
import type { ImageService } from "@iiif/presentation-3";

export function serviceImageAtSize(service: ImageService, size: { width: number; height?: number }) {
  if (service["@id"]) {
    service.id = service["@id"];
  }
  if (service["@type"]) {
    service.type = service["@type"];
  }
  const request = createImageServiceRequest(service);
  return imageServiceRequestToString({
    identifier: request.identifier,
    server: request.server,
    scheme: request.scheme,
    type: "image",
    size: {
      max: false,
      confined: false,
      upscaled: false,
      width: size.width,
      height: size.height,
    },
    format: "jpg",
    // This isn't how it should be modelled, always full,
    // region: data.selector ? data.selector : { full: true },
    region: { full: true },
    rotation: { angle: 0 },
    quality: "default",
    prefix: request.prefix,
    originalPath: (request as any).originalPath,
  });
}

export function getCanonicalUrl(url: string) {
  return url.endsWith("default.jpg")
    ? imageServiceRequestToString({
        ...parseImageServiceRequest(url),
        type: "info",
      })
    : canonicalServiceUrl(url);
}
