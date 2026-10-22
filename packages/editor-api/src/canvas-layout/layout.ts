import type { Vault } from "@iiif/helpers/vault";
import type { CanvasNormalized, AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { EditorInstance } from "../EditorInstance";
import {
  expandedCanvasBounds,
  fitWithinBounds,
  layoutSlotToPixels,
  validSize,
  type CanvasLayout,
  type Rectangle,
  type Size,
  validRectangle,
} from "./geometry";

export const CANVAS_LAYOUT_META = "canvas-layout";
export interface CanvasPlaceholder {
  id: string;
  bounds: Rectangle;
  annotationIds?: string[];
}
export interface CanvasLayoutState {
  layoutId: string;
  slots: CanvasPlaceholder[];
}
export function createCanvasLayoutState(layout: CanvasLayout): CanvasLayoutState {
  return { layoutId: layout.id, slots: layout.slots.map((bounds, i) => ({ id: `${layout.id}-${i}`, bounds })) };
}
export function getCanvasLayout(vault: Vault, canvasId: string): CanvasLayoutState | undefined {
  return vault.getState().iiif.meta?.[canvasId]?.[CANVAS_LAYOUT_META]?.state ?? undefined;
}
/** Cumulative origin shift lets viewers retain their screen position across a resize. */
export function getCanvasOrigin(vault: Vault, canvasId: string): { x: number; y: number } {
  return vault.getState().iiif.meta?.[canvasId]?.[CANVAS_LAYOUT_META]?.origin || { x: 0, y: 0 };
}
export function setCanvasLayout(vault: Vault, canvasId: string, state: CanvasLayoutState) {
  vault.setMetaValue([canvasId, CANVAS_LAYOUT_META, "state"], state);
}
export function getPaintingAnnotations(vault: Vault, canvas: CanvasNormalized): AnnotationNormalized[] {
  return (canvas.items || []).flatMap((page) => vault.get(page)?.items || []).map((ref) => vault.get(ref));
}
export function getImageSize(vault: Vault, annotation: AnnotationNormalized): Size | null {
  const body = annotation.body?.[0];
  const image = body && vault.get<any>(body);
  if (image?.type !== "Image") return null;
  const service = image.service?.find((s: any) => s.width && s.height) as Size | undefined;
  let size = { width: service?.width || image.width, height: service?.height || image.height };
  const selector = (body as any)?.selector;
  if ((selector?.type === "ImageApiSelector" || selector?.type === "iiif:ImageApiSelector") && selector.region) {
    const values = selector.region.split(",").map(Number);
    if (values.length === 4 && validSize({ width: values[2], height: values[3] }))
      size = { width: values[2], height: values[3] };
  }
  return validSize(size) ? size : null;
}
export function getPaintingImages(vault: Vault, canvas: CanvasNormalized) {
  return getPaintingAnnotations(vault, canvas).filter((a) => a.body?.length === 1 && getImageSize(vault, a));
}
export function getAnnotationRectangle(vault: Vault, annotation: AnnotationNormalized, canvas: Size): Rectangle | null {
  const target = new EditorInstance({ vault, reference: { id: annotation.id, type: "Annotation" } }).annotation.target;
  const parsed = target.getParsedSelector();
  if (parsed?.type === "BoxSelector" || parsed?.type === "TemporalBoxSelector") {
    const rect = parsed.spatial;
    return rect.unit === "percent"
      ? {
          x: (rect.x * canvas.width) / 100,
          y: (rect.y * canvas.height) / 100,
          width: (rect.width * canvas.width) / 100,
          height: (rect.height * canvas.height) / 100,
        }
      : rect;
  }
  if (!(annotation.target as any)?.selector) return { x: 0, y: 0, width: canvas.width, height: canvas.height };
  return null;
}
export function canResizeCanvas(vault: Vault, canvas: CanvasNormalized) {
  const annotations = getPaintingAnnotations(vault, canvas);
  return !(
    annotations.length === 1 &&
    getImageSize(vault, annotations[0]!) &&
    !(annotations[0]!.target as any)?.selector
  );
}
/** Shared with the media editor's “Target specific region” action. */
export function targetPaintingImageRegion(vault: Vault, canvas: CanvasNormalized, annotationId: string) {
  const annotation = vault.get<AnnotationNormalized>({ id: annotationId, type: "Annotation" });
  const size = getImageSize(vault, annotation);
  if (!size) return false;
  new EditorInstance({ vault, reference: annotation }).annotation.target.setPosition(
    fitWithinBounds(size, {
      x: canvas.width * 0.2,
      y: canvas.height * 0.2,
      width: canvas.width * 0.6,
      height: canvas.height * 0.6,
    })
  );
  return true;
}
export function switchToSingleImage(vault: Vault, canvas: CanvasNormalized) {
  const annotations = getPaintingAnnotations(vault, canvas);
  if (annotations.length !== 1) return false;
  const image = annotations[0]!;
  const size = getImageSize(vault, image);
  if (!size) return false;
  vault.batch(() => {
    resizeCanvas(vault, canvas, { x: 0, y: 0, ...size });
    new EditorInstance({ vault, reference: image }).annotation.target.removeSelector();
    vault.setMetaValue([canvas.id, CANVAS_LAYOUT_META, "state"], null);
  });
  return true;
}
export function clearCanvasPlaceholders(vault: Vault, canvas: CanvasNormalized) {
  const state = getCanvasLayout(vault, canvas.id);
  if (!state) return;
  const empty = new Set(getEmptyCanvasPlaceholders(vault, canvas).map((slot) => slot.id));
  setCanvasLayout(vault, canvas.id, { ...state, slots: state.slots.filter((slot) => !empty.has(slot.id)) });
}
export function applyCanvasLayout(vault: Vault, canvas: CanvasNormalized, layout: CanvasLayout) {
  const images = getPaintingImages(vault, canvas);
  if (layout.slots.length < images.length) throw new Error("This layout does not have enough image positions");
  const state = createCanvasLayoutState(layout);
  vault.batch(() => {
    images.forEach((image, index) => {
      const position = state.slots[index]!;
      new EditorInstance({ vault, reference: { id: image.id, type: "Annotation" } }).annotation.target.setPosition(
        fitWithinBounds(getImageSize(vault, image)!, layoutSlotToPixels(position.bounds, canvas))
      );
      position.annotationIds = [image.id];
    });
    setCanvasLayout(vault, canvas.id, state);
  });
}
export function getEmptyCanvasPlaceholders(vault: Vault, canvas: CanvasNormalized) {
  const ids = new Set(getPaintingAnnotations(vault, canvas).map((a) => a.id));
  return (
    getCanvasLayout(vault, canvas.id)?.slots.filter((slot) => !slot.annotationIds?.some((id) => ids.has(id))) || []
  );
}
/** Resize the surface, preserving resource dimensions. All positioned annotations move with the origin. */
export function resizeCanvas(vault: Vault, canvas: CanvasNormalized, bounds: Rectangle) {
  if (!validSize(bounds) || !Number.isFinite(bounds.x) || !Number.isFinite(bounds.y)) return;
  const annotations = [
    ...getPaintingAnnotations(vault, canvas),
    ...(canvas.annotations || []).flatMap((page) => vault.get(page)?.items || []).map((ref) => vault.get(ref)),
  ];
  vault.batch(() => {
    for (const annotation of annotations) {
      const editor = new EditorInstance({ vault, reference: { id: annotation.id, type: "Annotation" } }).annotation
        .target;
      if (editor.getSourceId() !== canvas.id) continue;
      const selector = editor.getParsedSelector();
      const rect = getAnnotationRectangle(vault, annotation, canvas);
      if (
        rect &&
        (!selector ||
          ((selector.type === "BoxSelector" || selector.type === "TemporalBoxSelector") &&
            selector.spatial.unit === "percent") ||
          bounds.x ||
          bounds.y)
      )
        editor.setPosition({ ...rect, x: rect.x - bounds.x, y: rect.y - bounds.y });
      else if ((bounds.x || bounds.y) && (selector?.type === "SvgSelector" || selector?.type === "PointSelector")) {
        editor.setSvgSelector(
          {
            points: (selector.points || []).map(([x, y]) => [x - bounds.x, y - bounds.y]),
            open: selector.type === "PointSelector",
          },
          bounds
        );
      }
    }
    const state = getCanvasLayout(vault, canvas.id);
    if (state)
      setCanvasLayout(vault, canvas.id, {
        ...state,
        slots: state.slots.map((slot) => {
          const rect = layoutSlotToPixels(slot.bounds, canvas);
          return {
            ...slot,
            bounds: {
              x: (rect.x - bounds.x) / bounds.width,
              y: (rect.y - bounds.y) / bounds.height,
              width: rect.width / bounds.width,
              height: rect.height / bounds.height,
            },
          };
        }),
      });
    if (bounds.x || bounds.y) {
      const origin = getCanvasOrigin(vault, canvas.id);
      vault.setMetaValue([canvas.id, CANVAS_LAYOUT_META, "origin"], { x: origin.x - bounds.x, y: origin.y - bounds.y });
    }
    vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "width", Math.round(bounds.width));
    vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "height", Math.round(bounds.height));
  });
}
export function movePaintingImage(vault: Vault, canvas: CanvasNormalized, annotationId: string, position: Rectangle) {
  if (!validRectangle(position)) return;
  const bounds = expandedCanvasBounds(canvas, [position]);
  vault.batch(() => {
    if (bounds.x || bounds.y || bounds.width !== canvas.width || bounds.height !== canvas.height)
      resizeCanvas(vault, canvas, bounds);
    new EditorInstance({ vault, reference: { id: annotationId, type: "Annotation" } }).annotation.target.setPosition({
      ...position,
      x: position.x - bounds.x,
      y: position.y - bounds.y,
    });
  });
}

/** Only fields that composition edits own; unrelated canvas metadata is left intact on discard. */
export function captureCanvasComposition(vault: Vault, canvas: CanvasNormalized) {
  const annotations = [
    ...getPaintingAnnotations(vault, canvas),
    ...(canvas.annotations || []).flatMap((page) => vault.get(page)?.items || []).map((ref) => vault.get(ref)),
  ];
  return structuredClone({
    width: canvas.width,
    height: canvas.height,
    behavior: canvas.behavior,
    targets: annotations.map((annotation) => ({ id: annotation.id, target: annotation.target })),
    layout: getCanvasLayout(vault, canvas.id) || null,
    origin: getCanvasOrigin(vault, canvas.id),
  });
}
export function restoreCanvasComposition(
  vault: Vault,
  canvasId: string,
  snapshot: ReturnType<typeof captureCanvasComposition>
) {
  const canvas = { id: canvasId, type: "Canvas" } as const;
  vault.batch(() => {
    vault.modifyEntityField(canvas, "width", snapshot.width);
    vault.modifyEntityField(canvas, "height", snapshot.height);
    vault.modifyEntityField(canvas, "behavior", snapshot.behavior);
    for (const annotation of snapshot.targets)
      vault.modifyEntityField({ id: annotation.id, type: "Annotation" }, "target", annotation.target);
    vault.setMetaValue([canvasId, CANVAS_LAYOUT_META, "state"], snapshot.layout);
    vault.setMetaValue([canvasId, CANVAS_LAYOUT_META, "origin"], snapshot.origin);
  });
}
