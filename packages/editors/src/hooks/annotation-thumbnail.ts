import { imageServiceRequestToString, parseImageServiceRequest } from "@iiif/parser/image-3";

export function constrainCroppedThumbnail(id: string, width = 256) {
  try {
    const request = parseImageServiceRequest(id);
    if (request.type !== "image" || request.region.full) return id;

    return imageServiceRequestToString({
      ...request,
      size: { max: false, confined: false, upscaled: false, width },
    });
  } catch {
    return id;
  }
}

export function getAnnotationThumbnailCacheKey(annotationId: string, resource: any) {
  const resourceId = typeof resource === "string" ? resource : resource?.id;
  const resourceType = typeof resource === "object" ? resource?.type : undefined;
  const bodies = Array.isArray(resource?.body) ? resource.body : resource?.body ? [resource.body] : [];
  const bodyKey = bodies
    .map((body: any) =>
      [body?.id, body?.source?.id, body?.selector?.region, body?.selector?.rotation].filter(Boolean).join("/"),
    )
    .join("|");

  return ["Annotation", annotationId, resourceType, resourceId, bodyKey].filter(Boolean).join("|");
}
