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
  return transformImage(crop, region, crop.selector.rotation);
}

export function transformImageRotation(crop: EditableImageCrop, rotation: number) {
  const region = parseCropRegion(crop.selector.region);
  const dimensions = region || getServiceDimensions(crop.service);
  if (!dimensions) throw new Error("The image service did not provide full image dimensions");
  return transformImage(crop, region, normaliseImageRotation(rotation), dimensions);
}

function transformImage(
  crop: EditableImageCrop,
  region: CropRegion | null,
  rotation: unknown,
  dimensions: { width: number; height: number } = region!,
) {
  const selector: any = {
    ...crop.selector,
    ...(rotation !== undefined ? { rotation: String(rotation) } : {}),
  };
  if (region) selector.region = serialiseCropRegion(region);
  else delete selector.region;
  const sourceId = imageRequestForTransform(crop, region, rotation);
  const thumbnailWidth = Math.min(512, dimensions.width);
  const thumbnailId = imageRequestForTransform(crop, region, rotation, thumbnailWidth);
  const imageDimensions = rotatedImageDimensions(dimensions.width, dimensions.height, rotation);
  const thumbnailDimensions = rotatedImageDimensions(
    thumbnailWidth,
    Math.round((dimensions.height / dimensions.width) * thumbnailWidth),
    rotation,
  );

  return {
    region,
    imageDimensions,
    thumbnailDimensions,
    selector,
    source: {
      ...crop.source,
      id: sourceId,
      ...(crop.source["@id"] ? { "@id": sourceId } : {}),
      width: imageDimensions.width,
      height: imageDimensions.height,
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
  const targetsWholeCanvas = targets.some((target: any) => targetCoversCanvas(target, canvas));
  return targetsWholeCanvas && paintingAnnotationCount === 1 && !behavior.includes("multi-image");
}

export function applyImageCrop(vault: any, crop: EditableImageCrop, canvas: any, editedRegion: CropRegion) {
  const transformed = transformImageCrop(crop, editedRegion);
  return applyImageTransform(vault, crop, canvas, transformed);
}

export function applyImageRotation(vault: any, crop: EditableImageCrop, canvas: any, rotation: number) {
  const transformed = transformImageRotation(crop, rotation);
  return applyImageTransform(vault, crop, canvas, transformed);
}

function applyImageTransform(
  vault: any,
  crop: EditableImageCrop,
  canvas: any,
  transformed: ReturnType<typeof transformImage>,
) {
  const paintingAnnotationCount = countPaintingAnnotations(vault, canvas);
  const resizeCanvas = shouldResizeCanvasForCrop(canvas, crop.annotation, paintingAnnotationCount);

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
              width: transformed.thumbnailDimensions.width,
              height: transformed.thumbnailDimensions.height,
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

    if (resizeCanvas) {
      vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "width", transformed.imageDimensions.width);
      vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "height", transformed.imageDimensions.height);
      vault.modifyEntityField(crop.annotationRef, "target", removeWholeCanvasSelector(crop.annotation.target, canvas));
    }
  });

  return transformed;
}

export function rotatedImageDimensions(width: number, height: number, rotation: unknown) {
  const angle = Number(String(rotation ?? 0).replace(/^!/, ""));
  const normalised = Number.isFinite(angle) ? ((angle % 360) + 360) % 360 : 0;
  return normalised === 90 || normalised === 270 ? { width: height, height: width } : { width, height };
}

function rotateRegion(
  region: CropRegion,
  dimensions: { width: number; height: number },
  rotation: unknown,
): CropRegion {
  switch (normaliseImageRotation(rotation)) {
    case 90:
      return {
        x: dimensions.height - region.y - region.height,
        y: region.x,
        width: region.height,
        height: region.width,
      };
    case 180:
      return {
        x: dimensions.width - region.x - region.width,
        y: dimensions.height - region.y - region.height,
        width: region.width,
        height: region.height,
      };
    case 270:
      return {
        x: region.y,
        y: dimensions.width - region.x - region.width,
        width: region.height,
        height: region.width,
      };
    default:
      return { ...region };
  }
}

export function imageRegionToDisplay(
  region: CropRegion,
  dimensions: { width: number; height: number },
  rotation: unknown,
): CropRegion {
  const sourceRegion = String(rotation ?? "").startsWith("!")
    ? { ...region, x: dimensions.width - region.x - region.width }
    : region;
  return rotateRegion(sourceRegion, dimensions, rotation);
}

export function displayRegionToImage(
  region: CropRegion,
  dimensions: { width: number; height: number },
  rotation: unknown,
): CropRegion {
  const displayDimensions = rotatedImageDimensions(
    dimensions.width,
    dimensions.height,
    rotation,
  );
  const sourceRegion = rotateRegion(
    region,
    displayDimensions,
    360 - normaliseImageRotation(rotation),
  );
  return String(rotation ?? "").startsWith("!")
    ? {
        ...sourceRegion,
        x: dimensions.width - sourceRegion.x - sourceRegion.width,
      }
    : sourceRegion;
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

export function fullImageRequest(service: any, rotation: unknown = 0) {
  const request = createImageServiceRequest(normaliseService(service));
  return imageServiceRequestToString({
    ...request,
    type: "image",
    region: { full: true },
    size: { max: true, confined: false, upscaled: false },
    rotation: selectorRotation(rotation),
    quality: "default",
    format: "jpg",
  } as any);
}

function serialiseCropRegion(region: CropRegion) {
  return `${region.x},${region.y},${region.width},${region.height}`;
}

function targetCoversCanvas(target: any, canvas: any) {
  const source = target?.type === "SpecificResource" ? target.source : target;
  const sourceValue = typeof source === "string" ? source : source?.id;
  if (typeof sourceValue !== "string") return false;
  const [sourceId, fragment] = sourceValue.split("#", 2);
  if (sourceId !== canvas.id) return false;

  const selectors = Array.isArray(target?.selector)
    ? target.selector
    : target?.selector
      ? [target.selector]
      : [];
  if (!selectors.length && !fragment) return true;

  const selector = selectors.find(
    (item: any) => item?.spatial || (typeof item?.value === "string" && item.value.startsWith("xywh=")),
  );
  let region = selector?.spatial;
  const value = fragment || selector?.value;
  if (!region && typeof value === "string" && value.startsWith("xywh=")) {
    const [x, y, width, height] = value.replace(/^xywh=(?:pixel:)?/, "").split(/[,&]/).slice(0, 4).map(Number);
    region = { x, y, width, height };
  }
  if (!region) return false;

  return (
    Number(region?.x) === 0 &&
    Number(region?.y) === 0 &&
    Number(region?.width) === Number(canvas?.width) &&
    Number(region?.height) === Number(canvas?.height)
  );
}

function removeWholeCanvasSelector(target: any, canvas: any): any {
  if (Array.isArray(target)) {
    return target.map((item) => (targetCoversCanvas(item, canvas) ? removeWholeCanvasSelector(item, canvas) : item));
  }
  if (typeof target === "string") return canvas.id;
  if (target?.type !== "SpecificResource") return target;

  return {
    ...target,
    source:
      typeof target.source === "string"
        ? canvas.id
        : target.source?.id?.includes("#")
          ? { ...target.source, id: canvas.id }
          : target.source,
    selector: undefined,
  };
}

function imageRequestForTransform(
  crop: EditableImageCrop,
  region: CropRegion | null,
  rotationValue: unknown,
  thumbnailWidth?: number,
) {
  const parsedSource = parseImageRequest(crop.source.id);
  const request = parsedSource || createImageServiceRequest(normaliseService(crop.service));
  const rotation =
    rotationValue !== undefined
      ? selectorRotation(rotationValue)
      : parsedSource?.rotation || { angle: 0 };

  return imageServiceRequestToString({
    ...request,
    type: "image",
    region: region
      ? { x: region.x, y: region.y, w: region.width, h: region.height }
      : { full: true },
    size: thumbnailWidth
      ? { max: false, confined: false, upscaled: false, width: thumbnailWidth }
      : { max: true, confined: false, upscaled: false },
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
  const stringValue = String(value ?? 0);
  const angle = Number(stringValue.replace(/^!/, ""));
  return { angle: Number.isFinite(angle) ? angle : 0, ...(stringValue.startsWith("!") ? { mirror: true } : {}) };
}

export function normaliseImageRotation(rotation: unknown) {
  const angle = Number(String(rotation ?? 0).replace(/^!/, ""));
  const normalised = Number.isFinite(angle) ? ((angle % 360) + 360) % 360 : 0;
  return [0, 90, 180, 270].includes(normalised) ? normalised : 0;
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
