import { addMappings, importEntities } from "@iiif/helpers/vault/actions";
import {
  canonicalServiceUrl,
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
  annotationRef: { id: string; type: "Annotation" };
  body: any;
  selector: any;
  source: any;
  service: any;
}

type Resolver = (resource: any) => any;

export function getEditableImageCrop(
  annotation: any,
  resolve: Resolver = (resource) => resource,
): EditableImageCrop | null {
  const crop = getImageCropContext(annotation, resolve);
  return crop && parseCropRegion(crop.selector.region) ? crop : null;
}

export function getImageCropContext(
  annotation: any,
  resolve: Resolver = (resource) => resource,
): EditableImageCrop | null {
  const motivations = Array.isArray(annotation?.motivation) ? annotation.motivation : [annotation?.motivation];
  const bodyRefs = Array.isArray(annotation?.body) ? annotation.body : annotation?.body ? [annotation.body] : [];
  if (!motivations.includes("painting") || bodyRefs.length !== 1) return null;

  const bodyRef = bodyRefs[0];
  if (!annotation?.id || bodyRef?.type === "Choice" || bodyRef?.source?.type === "Choice") return null;

  const isSpecificResource = bodyRef?.type === "SpecificResource";
  const existingSelector = isSpecificResource ? bodyRef.selector : undefined;
  if (existingSelector && !["ImageApiSelector", "iiif:ImageApiSelector"].includes(existingSelector.type)) {
    return null;
  }

  const sourceRef = isSpecificResource ? bodyRef.source : bodyRef;
  const source = resolve(sourceRef) || sourceRef;
  if (source?.type !== "Image") return null;

  const services = Array.isArray(source.service) ? source.service : source.service ? [source.service] : [];
  const service = services
    .map((item: any) => resolve(item) || item)
    .find((item: any) => isImageService(item) && (item.id || item["@id"]));
  if (!service) return null;

  return {
    annotation,
    annotationRef: { id: annotation.id, type: "Annotation" },
    body: isSpecificResource ? bodyRef : { type: "SpecificResource", source: sourceRef },
    selector: existingSelector || { type: "ImageApiSelector" },
    source,
    service,
  };
}

export function parseCropRegion(value: unknown): CropRegion | null {
  if (typeof value !== "string") return null;
  const values = value.split(",").map(Number);
  if (values.length !== 4 || !values.every(Number.isFinite)) return null;
  const x = values[0]!;
  const y = values[1]!;
  const width = values[2]!;
  const height = values[3]!;
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
    source: {
      ...crop.source,
      id: sourceId,
      ...(crop.source["@id"] ? { "@id": sourceId } : {}),
    },
    sourceId,
    thumbnailId,
  };
}

export function applyImageCropResponse(
  vault: any,
  crop: EditableImageCrop,
  canvas: any,
  response: { cancelled?: boolean; boundingBox?: CropRegion | null } | null | undefined,
) {
  if (!response || response.cancelled || !response.boundingBox) return null;
  return applyImageCrop(vault, crop, canvas, response.boundingBox);
}

export function shouldResizeCanvasForCrop(canvas: any, annotation: any, paintingAnnotationCount: number) {
  const behavior = Array.isArray(canvas?.behavior) ? canvas.behavior : canvas?.behavior ? [canvas.behavior] : [];
  const targets = Array.isArray(annotation?.target)
    ? annotation.target
    : annotation?.target
      ? [annotation.target]
      : [];
  const targetsWholeCanvas = targets.some((target: any) => {
    if (typeof target === "string") return target === canvas.id;
    if (target?.selector) return false;
    const source = target?.type === "SpecificResource" ? target.source : target;
    return (typeof source === "string" ? source : source?.id) === canvas.id;
  });
  return targetsWholeCanvas && paintingAnnotationCount === 1 && !behavior.includes("multi-image");
}

export function applyImageCrop(vault: any, crop: EditableImageCrop, canvas: any, editedRegion: CropRegion) {
  const transformed = transformImageCrop(crop, editedRegion);
  const paintingAnnotationCount = countPaintingAnnotations(vault, canvas);
  const thumbnailDimensions = rotatedImageDimensions(
    512,
    Math.round((transformed.region.height / transformed.region.width) * 512),
    crop.selector.rotation,
  );

  vault.batch(() => {
    vault.dispatch(
      importEntities({
        entities: {
          ContentResource: {
            [transformed.sourceId]: transformed.source,
            [transformed.thumbnailId]: {
              id: transformed.thumbnailId,
              type: "Image",
              format: "image/jpeg",
              width: thumbnailDimensions.width,
              height: thumbnailDimensions.height,
              service: [crop.service],
            },
          },
        },
      }),
    );
    vault.dispatch(
      addMappings({
        mapping: {
          [transformed.sourceId]: "ContentResource",
          [transformed.thumbnailId]: "ContentResource",
        },
      }),
    );
    vault.modifyEntityField(crop.annotationRef, "body", [
      {
        ...crop.body,
        selector: transformed.selector,
        source: {
          id: transformed.sourceId,
          type: "ContentResource",
        },
      },
    ]);

    vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "thumbnail", [
      { id: transformed.thumbnailId, type: "ContentResource" },
    ]);

    if (shouldResizeCanvasForCrop(canvas, crop.annotation, paintingAnnotationCount)) {
      vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "width", transformed.region.width);
      vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "height", transformed.region.height);
    }
  });

  return transformed;
}

export function rotatedImageDimensions(width: number, height: number, rotation: unknown) {
  const angle = Number(String(rotation ?? 0).replace(/^!/, ""));
  const normalised = Number.isFinite(angle) ? ((angle % 360) + 360) % 360 : 0;
  return normalised === 90 || normalised === 270 ? { width: height, height: width } : { width, height };
}

export function getServiceDimensions(service: any): { width: number; height: number } | null {
  const width = Number(service?.width);
  const height = Number(service?.height);
  return width > 0 && height > 0 ? { width, height } : null;
}

export async function resolveImageService(service: any, fetcher: typeof fetch = fetch): Promise<any> {
  if (getServiceDimensions(service)) return service;

  const serviceId = service?.id || service?.["@id"];
  if (!serviceId) throw new Error("The image service has no identifier");

  const response = await fetcher(canonicalServiceUrl(serviceId));
  if (!response.ok) throw new Error(`The image service returned ${response.status}`);
  const info = await response.json();
  const resolved = {
    ...service,
    ...info,
    id: info.id || info["@id"] || serviceId,
  };
  if (!getServiceDimensions(resolved)) {
    throw new Error("The image service did not provide full image dimensions");
  }
  return resolved;
}

export function fullImageRequest(service: any) {
  const request = createImageServiceRequest(normaliseService(service));
  return imageServiceRequestToString({
    ...request,
    type: "image",
    region: { full: true },
    size: { max: true, confined: false, upscaled: false },
    rotation: { angle: 0 },
    quality: "default",
    format: "jpg",
  } as any);
}

function serialiseCropRegion(region: CropRegion) {
  return `${region.x},${region.y},${region.width},${region.height}`;
}

function imageRequestForCrop(crop: EditableImageCrop, region: CropRegion, thumbnailWidth?: number) {
  const parsedSource = parseImageRequest(crop.source.id);
  const request = parsedSource || createImageServiceRequest(normaliseService(crop.service));
  const rotation =
    crop.selector.rotation !== undefined
      ? selectorRotation(crop.selector.rotation)
      : parsedSource?.rotation || { angle: 0 };

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
