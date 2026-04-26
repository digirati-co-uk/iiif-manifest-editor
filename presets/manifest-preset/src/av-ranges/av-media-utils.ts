import { getValue } from "@iiif/helpers";
import { isSpecificResource } from "@iiif/parser";
import type { InternationalString, Reference } from "@iiif/presentation-3";

export interface AvCanvas {
  id: string;
  label?: InternationalString;
  title: string;
  duration: number;
  media: {
    id: string;
    type: "Sound" | "Video";
    format?: string;
    width?: number;
    height?: number;
  };
  captions: Array<{
    id: string;
    label?: InternationalString;
    language?: string;
    format?: string;
  }>;
}

export function getAvCanvases(
  vault: { get: (ref: any, options?: any) => any },
  manifest: any,
): AvCanvas[] {
  return (manifest?.items || [])
    .map((canvasRef: Reference<"Canvas">) => {
      const canvas = vault.get(canvasRef, { skipSelfReturn: false });
      return canvas ? getAvCanvas(vault, canvas) : null;
    })
    .filter((canvas: AvCanvas | null): canvas is AvCanvas => !!canvas);
}

export function getAvCanvas(
  vault: { get: (ref: any, options?: any) => any },
  canvas: any,
): AvCanvas | null {
  const media = getFirstPaintingMedia(vault, canvas);
  const duration = Number(canvas?.duration || media?.duration || 0);
  if (!media || !duration) {
    return null;
  }

  return {
    id: canvas.id,
    label: canvas.label,
    title: getValue(canvas.label) || "Untitled canvas",
    duration,
    media: {
      id: media.id,
      type: media.type,
      format: media.format,
      width: media.width,
      height: media.height,
    },
    captions: getTimedText(vault, canvas),
  };
}

function getFirstPaintingMedia(
  vault: { get: (ref: any, options?: any) => any },
  canvas: any,
): any | null {
  for (const annotation of getCanvasAnnotations(vault, canvas)) {
    const motivation = Array.isArray(annotation?.motivation)
      ? annotation.motivation
      : [annotation?.motivation];
    if (!motivation.includes("painting")) {
      continue;
    }

    for (const body of toArray(annotation.body)) {
      const resource = resolveResource(vault, body);
      if (resource?.type === "Sound" || resource?.type === "Video") {
        return resource;
      }
    }
  }
  return null;
}

function getTimedText(
  vault: { get: (ref: any, options?: any) => any },
  canvas: any,
): AvCanvas["captions"] {
  const captions: AvCanvas["captions"] = [];

  for (const annotation of getCanvasAnnotations(vault, canvas)) {
    const motivation = Array.isArray(annotation?.motivation)
      ? annotation.motivation
      : [annotation?.motivation];
    if (
      !motivation.some(
        (value: string) =>
          value === "supplementing" ||
          value === "captioning" ||
          value === "transcribing",
      )
    ) {
      continue;
    }

    for (const body of toArray(annotation.body)) {
      const resource = resolveResource(vault, body);
      if (!resource?.id) {
        continue;
      }
      const format = resource.format || resource.type;
      if (
        format === "text/vtt" ||
        format === "text/plain" ||
        String(resource.id).endsWith(".vtt")
      ) {
        captions.push({
          id: resource.id,
          label: resource.label,
          language: resource.language,
          format,
        });
      }
    }
  }

  return captions;
}

function getCanvasAnnotations(
  vault: { get: (ref: any, options?: any) => any },
  canvas: any,
) {
  const annotations: any[] = [];
  for (const pageRef of canvas?.items || []) {
    const page = vault.get(pageRef, { skipSelfReturn: false });
    for (const annotationRef of page?.items || []) {
      const annotation = vault.get(annotationRef, { skipSelfReturn: false });
      if (annotation) {
        annotations.push(annotation);
      }
    }
  }
  return annotations;
}

function resolveResource(
  vault: { get: (ref: any, options?: any) => any },
  resource: any,
) {
  const ref = isSpecificResource(resource) ? resource.source : resource;
  if (!ref) {
    return null;
  }
  return vault.get(ref, { skipSelfReturn: false }) || ref;
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
