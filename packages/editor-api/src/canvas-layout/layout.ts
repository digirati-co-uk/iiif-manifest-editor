import { runVaultCommand } from "../history";
import type { Vault } from "@iiif/helpers/vault";
import type { CanvasNormalized, AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { EditorInstance } from "../EditorInstance";
import {
  canvasLayouts,
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
  /** Missing on legacy compositions: never infer ownership from geometry. */
  customised?: boolean;
  slots: CanvasPlaceholder[];
}
export function createCanvasLayoutState(layout: CanvasLayout): CanvasLayoutState {
  return {
    layoutId: layout.id,
    customised: layout.slots.length === 0,
    slots: layout.slots.map((bounds, i) => ({ id: `${layout.id}-${i}`, bounds })),
  };
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
export function switchToSingleImage(sourceVault: Vault, canvas: CanvasNormalized) {
  return runVaultCommand(sourceVault, "Switch To Single Image", (vault) => {
    const annotations = getPaintingAnnotations(vault, canvas);
    if (annotations.length !== 1) return false;
    const image = annotations[0]!;
    const size = getImageSize(vault, image);
    if (!size) return false;
    beginCanvasComposition(vault, canvas);
    vault.batch(() => {
      resizeCanvas(vault, canvas, { x: 0, y: 0, ...size });
      new EditorInstance({ vault, reference: image }).annotation.target.removeSelector();
      vault.setMetaValue([canvas.id, CANVAS_LAYOUT_META, "state"], null);
    });
    return true;
  });
}
export function clearCanvasPlaceholders(sourceVault: Vault, canvas: CanvasNormalized) {
  return runVaultCommand(sourceVault, "Clear Canvas Placeholders", (vault) => {
    const state = getCanvasLayout(vault, canvas.id);
    if (!state) return;
    beginCanvasComposition(vault, canvas);
    const empty = new Set(getEmptyCanvasPlaceholders(vault, canvas).map((slot) => slot.id));
    setCanvasLayout(vault, canvas.id, {
      ...state,
      customised: true,
      slots: state.slots.filter((slot) => !empty.has(slot.id)),
    });
  });
}
/** Slot assignment and template paint order are independent of insertion order. */
export function applyCanvasLayout(sourceVault: Vault, canvas: CanvasNormalized, layout: CanvasLayout) {
  return runVaultCommand(sourceVault, "Apply Canvas Layout", (vault) => {
    const images = getPaintingImages(vault, canvas);
    if (getPaintingAnnotations(vault, canvas).length !== images.length)
      throw new Error("This composition contains unsupported media. Arrange it freely instead.");
    if (layout.slots.length < images.length) throw new Error("This layout does not have enough image positions");
    const previous = getCanvasLayout(vault, canvas.id);
    const state = createCanvasLayoutState(layout);
    const remaining = new Set(images.map((image) => image.id));
    const overflow: string[] = [];
    previous?.slots.forEach((slot, index) => {
      for (const id of slot.annotationIds || []) {
        if (!remaining.delete(id)) continue;
        if (state.slots[index] && !state.slots[index]!.annotationIds?.length) state.slots[index]!.annotationIds = [id];
        else overflow.push(id);
      }
    });
    for (const id of [...overflow, ...remaining]) {
      const empty = state.slots.find((slot) => !slot.annotationIds?.length)!;
      empty.annotationIds = [id];
    }
    vault.batch(() => {
      state.slots.forEach((slot) => {
        const image = images.find((image) => image.id === slot.annotationIds?.[0]);
        if (image)
          new EditorInstance({ vault, reference: image }).annotation.target.setPosition(
            fitWithinBounds(getImageSize(vault, image)!, layoutSlotToPixels(slot.bounds, canvas))
          );
      });
      setCanvasLayout(vault, canvas.id, state);
      syncCanvasPaintOrder(vault, canvas, state);
    });
  });
}

export function hasCanvasRegionAnnotations(vault: Vault, canvas: CanvasNormalized) {
  return (canvas.annotations || []).some((page) => vault.get(page)?.items?.length > 0);
}
export function isTemplateManaged(vault: Vault, canvas: CanvasNormalized) {
  const state = getCanvasLayout(vault, canvas.id);
  const images = getPaintingImages(vault, canvas);
  const assigned = state?.slots.flatMap((slot) => slot.annotationIds || []) || [];
  return (
    state?.customised === false &&
    !hasCanvasRegionAnnotations(vault, canvas) &&
    state.slots.every((slot) => (slot.annotationIds?.length || 0) <= 1) &&
    getPaintingAnnotations(vault, canvas).length === images.length &&
    images.every((image) => assigned.includes(image.id))
  );
}
export function customiseCanvasLayout(vault: Vault, canvas: CanvasNormalized) {
  const state = getCanvasLayout(vault, canvas.id);
  if (state && state.customised !== true) setCanvasLayout(vault, canvas.id, { ...state, customised: true });
}
/** Preserve page boundaries while sorting the template's painting sequence. */
export function syncCanvasPaintOrder(
  vault: Vault,
  canvas: CanvasNormalized,
  state = getCanvasLayout(vault, canvas.id)
) {
  if (!state || state.customised !== false) return;
  const order = state.slots.flatMap((slot) => slot.annotationIds || []);
  const paintings = getPaintingAnnotations(vault, canvas);
  const sorted = [...paintings].sort((a, b) => {
    const ai = order.indexOf(a.id),
      bi = order.indexOf(b.id);
    return (ai < 0 ? order.length : ai) - (bi < 0 ? order.length : bi);
  });
  let offset = 0;
  for (const ref of canvas.items || []) {
    const page = vault.get(ref);
    const count = page.items.length;
    vault.modifyEntityField(
      ref,
      "items",
      sorted.slice(offset, offset + count).map(({ id, type }) => ({ id, type }))
    );
    offset += count;
  }
}
export function removeCanvasImage(sourceVault: Vault, canvas: CanvasNormalized, id: string) {
  return runVaultCommand(sourceVault, "Remove Canvas Image", (vault) => {
    beginCanvasComposition(vault, canvas);
    vault.batch(() => {
      for (const page of canvas.items || [])
        vault.modifyEntityField(
          page,
          "items",
          vault.get(page).items.filter((ref: any) => ref.id !== id)
        );
      const state = getCanvasLayout(vault, canvas.id);
      if (state)
        setCanvasLayout(vault, canvas.id, {
          ...state,
          slots: state.slots.map((slot) => ({
            ...slot,
            annotationIds: slot.annotationIds?.filter((item) => item !== id),
          })),
        });
    });
  });
}
export function swapCanvasPositions(sourceVault: Vault, canvas: CanvasNormalized, from: number, to: number) {
  return runVaultCommand(sourceVault, "Swap Canvas Positions", (vault) => {
    if (!isTemplateManaged(vault, canvas)) return;
    const state = structuredClone(getCanvasLayout(vault, canvas.id)!);
    if (!state.slots[from] || !state.slots[to]) return;
    beginCanvasComposition(vault, canvas);
    [state.slots[from]!.annotationIds, state.slots[to]!.annotationIds] = [
      state.slots[to]!.annotationIds,
      state.slots[from]!.annotationIds,
    ];
    setCanvasLayout(vault, canvas.id, state);
    applyCanvasLayout(
      vault,
      canvas,
      canvasLayouts.find((layout) => layout.id === state.layoutId)!
    );
  });
}
/** A template can be (re)applied when it has positions for every image and nothing else is pinned to the canvas. */
export function canReapplyCanvasLayout(vault: Vault, canvas: CanvasNormalized) {
  const layout = canvasLayouts.find((layout) => layout.id === getCanvasLayout(vault, canvas.id)?.layoutId);
  const images = getPaintingImages(vault, canvas);
  return (
    !!layout &&
    layout.slots.length > 0 &&
    layout.slots.length >= images.length &&
    !hasCanvasRegionAnnotations(vault, canvas) &&
    getPaintingAnnotations(vault, canvas).length === images.length
  );
}
/**
 * Explicit template resize only. Incidental expansion continues to use resizeCanvas.
 * Template-managed slides always reflow; `reapply` extends that to custom arrangements
 * (images are returned to their template positions) and `reapply: false` keeps every position.
 */
export function resizeCanvasLayout(
  sourceVault: Vault,
  canvas: CanvasNormalized,
  bounds: Rectangle,
  options: { reapply?: boolean } = {}
) {
  return runVaultCommand(sourceVault, "Resize Canvas Layout", (vault) => {
    if (!validRectangle(bounds)) return;
    beginCanvasComposition(vault, canvas);
    const reflow = (options.reapply ?? isTemplateManaged(vault, canvas)) && canReapplyCanvasLayout(vault, canvas);
    const layout = canvasLayouts.find((layout) => layout.id === getCanvasLayout(vault, canvas.id)?.layoutId);
    resizeCanvas(vault, canvas, bounds);
    if (reflow && layout) applyCanvasLayout(vault, vault.get(canvas), layout);
  });
}

export function getEmptyCanvasPlaceholders(vault: Vault, canvas: CanvasNormalized) {
  const ids = new Set(getPaintingAnnotations(vault, canvas).map((a) => a.id));
  return (
    getCanvasLayout(vault, canvas.id)?.slots.filter((slot) => !slot.annotationIds?.some((id) => ids.has(id))) || []
  );
}
/** Resize the surface, preserving resource dimensions. All positioned annotations move with the origin. */
export function resizeCanvas(sourceVault: Vault, canvas: CanvasNormalized, bounds: Rectangle) {
  return runVaultCommand(sourceVault, "Resize Canvas", (vault) => {
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
        vault.setMetaValue([canvas.id, CANVAS_LAYOUT_META, "origin"], {
          x: origin.x - bounds.x,
          y: origin.y - bounds.y,
        });
      }
      vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "width", Math.round(bounds.width));
      vault.modifyEntityField({ id: canvas.id, type: "Canvas" }, "height", Math.round(bounds.height));
    });
  });
}
export function movePaintingImage(
  sourceVault: Vault,
  canvas: CanvasNormalized,
  annotationId: string,
  position: Rectangle
) {
  return runVaultCommand(sourceVault, "Move Painting Image", (vault) => {
    if (!validRectangle(position)) return;
    const previous = getAnnotationRectangle(vault, vault.get({ id: annotationId, type: "Annotation" }), canvas);
    if (
      previous &&
      (["x", "y", "width", "height"] as const).every((axis) => Math.abs(previous[axis] - position[axis]) < 0.01)
    )
      return;
    const bounds = expandedCanvasBounds(canvas, [position]);
    beginCanvasComposition(vault, canvas);
    if (!isCanvasCompositionMoved(vault, canvas.id)) {
      // Discard should return to how the slide was before the first manual move, not before earlier housekeeping.
      vault.setMetaValue([canvas.id, CANVAS_LAYOUT_META, "editingSnapshot"], captureCanvasComposition(vault, canvas));
      vault.setMetaValue([canvas.id, CANVAS_LAYOUT_META, "moved"], true);
    }
    customiseCanvasLayout(vault, canvas);
    vault.batch(() => {
      if (bounds.x || bounds.y || bounds.width !== canvas.width || bounds.height !== canvas.height)
        resizeCanvas(vault, canvas, bounds);
      new EditorInstance({ vault, reference: { id: annotationId, type: "Annotation" } }).annotation.target.setPosition({
        ...position,
        x: position.x - bounds.x,
        y: position.y - bounds.y,
      });
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
    canvasItems: canvas.items,
    pages: (canvas.items || []).map((page) => ({ ...page, items: vault.get(page).items })),
    targets: annotations.map((annotation) => ({ id: annotation.id, target: annotation.target, body: annotation.body })),
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
    if (snapshot.canvasItems) vault.modifyEntityField(canvas, "items", snapshot.canvasItems);
    for (const page of snapshot.pages || [])
      vault.modifyEntityField({ id: page.id, type: "AnnotationPage" }, "items", page.items);
    for (const annotation of snapshot.targets) {
      vault.modifyEntityField({ id: annotation.id, type: "Annotation" }, "target", annotation.target);
      if (annotation.body) vault.modifyEntityField({ id: annotation.id, type: "Annotation" }, "body", annotation.body);
    }
    vault.setMetaValue([canvasId, CANVAS_LAYOUT_META, "state"], snapshot.layout);
    vault.setMetaValue([canvasId, CANVAS_LAYOUT_META, "origin"], snapshot.origin);
  });
}

/** A bounded, workspace-local editing session; never exported as IIIF. */
export function beginCanvasComposition(vault: Vault, canvas: CanvasNormalized, options: { restart?: boolean } = {}) {
  // A separate operation (such as canvas resize) owns only changes made after it begins.
  if (options.restart) completeCanvasComposition(vault, canvas.id);
  if (!getCanvasCompositionSnapshot(vault, canvas.id))
    vault.setMetaValue([canvas.id, CANVAS_LAYOUT_META, "editingSnapshot"], captureCanvasComposition(vault, canvas));
}
export function getCanvasCompositionSnapshot(
  vault: Vault,
  canvasId: string
): ReturnType<typeof captureCanvasComposition> | null {
  return vault.getState().iiif.meta?.[canvasId]?.[CANVAS_LAYOUT_META]?.editingSnapshot || null;
}
/** True once an image has been dragged or resized by hand in the current editing session. */
export function isCanvasCompositionMoved(vault: Vault, canvasId: string): boolean {
  return !!vault.getState().iiif.meta?.[canvasId]?.[CANVAS_LAYOUT_META]?.moved;
}
export function completeCanvasComposition(vault: Vault, canvasId: string, discard = false) {
  const snapshot = getCanvasCompositionSnapshot(vault, canvasId);
  vault.batch(() => {
    if (discard && snapshot) restoreCanvasComposition(vault, canvasId, snapshot);
    vault.setMetaValue([canvasId, CANVAS_LAYOUT_META, "editingSnapshot"], null);
    vault.setMetaValue([canvasId, CANVAS_LAYOUT_META, "moved"], null);
  });
}
