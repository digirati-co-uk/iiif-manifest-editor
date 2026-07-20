import {
  getPaintingAnnotations,
  getResolvedAnnotationBody,
} from "../slideshow-content-positioning";

export function getSingleImageAnnotationToRescale(vault: any, canvas: any) {
  if (!canvas?.behavior?.includes("multi-image")) return null;

  const annotations = getPaintingAnnotations(vault, canvas);
  if (annotations.length !== 1) return null;

  const annotation = annotations[0];
  const body = Array.isArray(annotation?.body)
    ? annotation.body[0]
    : annotation?.body;
  const selector = body?.type === "SpecificResource" ? body.selector : null;
  const region = selector?.region?.split(",").map(Number);

  return annotation?.target?.selector &&
    getResolvedAnnotationBody(vault, annotation)?.type === "Image" &&
    ["ImageApiSelector", "iiif:ImageApiSelector"].includes(selector?.type) &&
    region?.length === 4 &&
    region.every(Number.isFinite) &&
    region[2] > 0 &&
    region[3] > 0
    ? annotation
    : null;
}
