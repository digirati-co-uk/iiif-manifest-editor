import {
  createImageServiceRequest,
  imageServiceRequestToString,
  isImageService,
  parseImageServiceRequest,
} from "@iiif/parser/image-3";

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EditableImageCrop {
  annotation: any;
  body: any;
  bodyRef: { id: string; type: string };
  selector: any;
  source: any;
  service: any;
}

type Resolver = (resource: any) => any;

export function getEditableImageCrop(annotation: any, resolve: Resolver = (resource) => resource): EditableImageCrop | null {
  const motivations = Array.isArray(annotation?.motivation) ? annotation.motivation : [annotation?.motivation];
  const bodyRefs = Array.isArray(annotation?.body) ? annotation.body : annotation?.body ? [annotation.body] : [];
  if (!motivations.includes("painting") || bodyRefs.length !== 1) return null;

  const bodyRef = bodyRefs[0];
  const body = resolve(bodyRef) || bodyRef;
  if (body?.type !== "SpecificResource" || !body?.id || body?.source?.type === "Choice") return null;

  const selector = body.selector;
  if (
    !selector ||
    !["ImageApiSelector", "iiif:ImageApiSelector"].includes(selector.type) ||
    !parseCropRegion(selector.region)
  ) {
    return null;
  }

  const source = resolve(body.source) || body.source;
  if (source?.type !== "Image") return null;

  const services = Array.isArray(source.service) ? source.service : source.service ? [source.service] : [];
  const service = services
    .map((item) => resolve(item) || item)
    .find((item) => isImageService(item) && (item.id || item["@id"]));
  if (!service) return null;

  return {
    annotation,
    body,
    bodyRef: { id: body.id, type: body.type },
    selector,
    source,
    service,
  };
}

export function parseCropRegion(value: unknown): CropRegion | null {
  if (typeof value !== "string") return null;
  const values = value.split(",").map(Number);
  if (values.length !== 4 || !values.every(Number.isFinite)) return null;
  const [x, y, width, height] = values;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

export function normaliseCropRegion(region: CropRegion): CropRegion {
  const normalised = {
    x: Math.max(0, Math.round(region.x)),
    y: Math.max(0, Math.round(region.y)),
    width: Math.round(region.width),
    height: Math.round(region.height),
  };
  if (normalised.width <= 0 || normalised.height <= 0) {
    throw new Error("The crop must have a positive width and height");
  }
  return normalised;
}

export function transformImageCrop(crop: EditableImageCrop, editedRegion: CropRegion) {
  const region = normaliseCropRegion(editedRegion);
  const selector = { ...crop.selector, region: serialiseCropRegion(region) };
  const sourceId = imageRequestForCrop(crop, region);
  const thumbnailId = imageRequestForCrop(crop, region, 512);

  return {
    region,
    selector,
    source: { ...crop.source, id: sourceId },
    sourceId,
    thumbnailId,
  };
}

export function shouldResizeCanvasForCrop(canvas: any, paintingAnnotationCount: number) {
  const behavior = Array.isArray(canvas?.behavior) ? canvas.behavior : canvas?.behavior ? [canvas.behavior] : [];
  return paintingAnnotationCount === 1 && !behavior.includes("multi-image");
}

export function applyImageCrop(vault: any, crop: EditableImageCrop, canvas: any, editedRegion: CropRegion) {
  const transformed = transformImageCrop(crop, editedRegion);
  const paintingAnnotationCount = countPaintingAnnotations(vault, canvas);

  vault.batch(() => {
    vault.loadSync(transformed.sourceId, transformed.source);
    vault.modifyEntityField(crop.bodyRef, "selector", transformed.selector);
    vault.modifyEntityField(crop.bodyRef, "source", {
      id: transformed.sourceId,
      type: "ContentResource",
    });

    vault.loadSync(transformed.thumbnailId, {
      id: transformed.thumbnailId,
      type: "Image",
      format: "image/jpeg",
      width: 512,
      height: Math.round((transformed.region.height / transformed.region.width) * 512),
      service: [crop.service],
    });
    vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "thumbnail", [
      { id: transformed.thumbnailId, type: "ContentResource" },
    ]);

    if (shouldResizeCanvasForCrop(canvas, paintingAnnotationCount)) {
      vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "width", transformed.region.width);
      vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "height", transformed.region.height);
    }
  });

  return transformed;
}

export function getServiceDimensions(service: any): { width: number; height: number } | null {
  const width = Number(service?.width);
  const height = Number(service?.height);
  return width > 0 && height > 0 ? { width, height } : null;
}

function serialiseCropRegion(region: CropRegion) {
  return `${region.x},${region.y},${region.width},${region.height}`;
}

function imageRequestForCrop(crop: EditableImageCrop, region: CropRegion, thumbnailWidth?: number) {
  const parsedSource = parseImageRequest(crop.source.id);
  const request = parsedSource || createImageServiceRequest(normaliseService(crop.service));
  const rotation = parsedSource?.rotation || selectorRotation(crop.selector.rotation);

  return imageServiceRequestToString({
    ...request,
    type: "image",
    region: { x: region.x, y: region.y, w: region.width, h: region.height },
    size: thumbnailWidth
      ? { max: false, confined: false, upscaled: false, width: thumbnailWidth }
      : parsedSource?.size || { max: true, confined: false, upscaled: false },
    rotation,
    quality: parsedSource?.quality || "default",
    format: parsedSource?.format || "jpg",
  } as any);
}

function parseImageRequest(id: unknown) {
  if (typeof id !== "string") return null;
  try {
    const request = parseImageServiceRequest(id);
    return request.type === "image" ? request : null;
  } catch {
    return null;
  }
}

function selectorRotation(value: unknown) {
  const angle = Number(value);
  return { angle: Number.isFinite(angle) ? angle : 0 };
}

function normaliseService(service: any) {
  return {
    ...service,
    id: service.id || service["@id"],
    type: service.type || service["@type"],
  };
}

function countPaintingAnnotations(vault: any, canvas: any) {
  let count = 0;
  for (const pageRef of canvas?.items || []) {
    const page = vault.get(pageRef, { skipSelfReturn: false }) || pageRef;
    for (const annotationRef of page?.items || []) {
      const annotation = vault.get(annotationRef, { skipSelfReturn: false }) || annotationRef;
      const motivations = Array.isArray(annotation?.motivation) ? annotation.motivation : [annotation?.motivation];
      if (motivations.includes("painting")) count++;
    }
  }
  return count;
}
