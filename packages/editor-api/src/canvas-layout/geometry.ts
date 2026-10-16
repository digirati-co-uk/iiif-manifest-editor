export interface Size {
  width: number;
  height: number;
}
export interface Rectangle extends Size {
  x: number;
  y: number;
}
export type CanvasEdge = "top" | "right" | "bottom" | "left";
export type CanvasHandle = CanvasEdge | "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Corner resizing anchors the opposite corner; Shift can release the proportions. */
export function resizeCanvasHandle(size: Size, handle: CanvasHandle, dx: number, dy: number, locked = true): Rectangle {
  if (!handle.includes("-"))
    return resizeCanvasEdge(size, handle as CanvasEdge, handle === "left" || handle === "right" ? dx : dy);
  const left = handle.includes("left");
  const top = handle.includes("top");
  let width = Math.max(1, size.width + (left ? -dx : dx));
  let height = Math.max(1, size.height + (top ? -dy : dy));
  if (locked) {
    const scale =
      Math.abs(width / size.width - 1) >= Math.abs(height / size.height - 1)
        ? width / size.width
        : height / size.height;
    width = Math.max(1, size.width * scale);
    height = Math.max(1, size.height * scale);
  }
  return { x: left ? size.width - width : 0, y: top ? size.height - height : 0, width, height };
}

/** Resize one edge while keeping the opposite edge fixed. */
export function resizeCanvasEdge(size: Size, edge: CanvasEdge, delta: number): Rectangle {
  const rect = { x: 0, y: 0, ...size };
  if (!Number.isFinite(delta)) return rect;
  if (edge === "right") rect.width = Math.max(1, size.width + delta);
  if (edge === "bottom") rect.height = Math.max(1, size.height + delta);
  if (edge === "left") {
    rect.x = Math.min(delta, size.width - 1);
    rect.width -= rect.x;
  }
  if (edge === "top") {
    rect.y = Math.min(delta, size.height - 1);
    rect.height -= rect.y;
  }
  return rect;
}
export interface CanvasLayout {
  id: string;
  label: string;
  slots: Rectangle[];
}

const slot = (x: number, y: number, width: number, height: number): Rectangle => ({ x, y, width, height });
const grid = (columns: number, rows: number) =>
  Array.from({ length: columns * rows }, (_, i) =>
    slot((i % columns) / columns + 0.025, Math.floor(i / columns) / rows + 0.025, 1 / columns - 0.05, 1 / rows - 0.05)
  );

/** Slots are fractions of canvas dimensions; add a layout here to expose it in every picker. */
export const canvasLayouts: CanvasLayout[] = [
  { id: "pair", label: "Side by side", slots: grid(2, 1) },
  { id: "triptych", label: "Three columns", slots: grid(3, 1) },
  {
    id: "feature-left",
    label: "Feature left",
    slots: [slot(0.025, 0.025, 0.6, 0.95), slot(0.65, 0.025, 0.325, 0.4625), slot(0.65, 0.5125, 0.325, 0.4625)],
  },
  {
    id: "feature-top",
    label: "Feature above",
    slots: [slot(0.025, 0.025, 0.95, 0.6), slot(0.025, 0.65, 0.4625, 0.325), slot(0.5125, 0.65, 0.4625, 0.325)],
  },
  { id: "grid-four", label: "Four images", slots: grid(2, 2) },
  { id: "grid-six", label: "Six images", slots: grid(3, 2) },
  { id: "hero-inset", label: "Hero + inset", slots: [slot(0.02, 0.02, 0.96, 0.96), slot(0.62, 0.58, 0.32, 0.34)] },
  { id: "offset-pair", label: "Offset pair", slots: [slot(0.04, 0.08, 0.58, 0.72), slot(0.49, 0.4, 0.46, 0.55)] },
  {
    id: "cascade",
    label: "Cascade",
    slots: [
      slot(0.03, 0.05, 0.3, 0.55),
      slot(0.24, 0.22, 0.3, 0.55),
      slot(0.45, 0.06, 0.3, 0.55),
      slot(0.66, 0.28, 0.3, 0.6),
    ],
  },
  {
    id: "stack-right",
    label: "Stacked",
    slots: [
      slot(0.03, 0.05, 0.55, 0.9),
      slot(0.5, 0.08, 0.26, 0.4),
      slot(0.7, 0.3, 0.27, 0.42),
      slot(0.52, 0.55, 0.3, 0.38),
    ],
  },
  {
    id: "scatter",
    label: "Scatter",
    slots: [
      slot(0.03, 0.06, 0.42, 0.62),
      slot(0.36, 0.2, 0.32, 0.5),
      slot(0.62, 0.04, 0.34, 0.46),
      slot(0.08, 0.62, 0.3, 0.33),
      slot(0.56, 0.52, 0.4, 0.43),
    ],
  },
  {
    id: "gallery",
    label: "Gallery wall",
    slots: [
      slot(0.03, 0.06, 0.3, 0.54),
      slot(0.37, 0.04, 0.24, 0.38),
      slot(0.66, 0.1, 0.3, 0.46),
      slot(0.07, 0.66, 0.25, 0.29),
      slot(0.36, 0.47, 0.27, 0.48),
      slot(0.67, 0.62, 0.29, 0.3),
    ],
  },
  { id: "blank", label: "Blank canvas", slots: [] },
];
export const canvasSizePresets = [
  { label: "12 × 8 · Landscape", columns: 12, rows: 8 },
  { label: "12 × 6 · Wide", columns: 12, rows: 6 },
  { label: "12 × 12 · Square", columns: 12, rows: 12 },
  { label: "8 × 12 · Portrait", columns: 8, rows: 12 },
];
export function validSize(size: Size) {
  return Number.isFinite(size.width) && Number.isFinite(size.height) && size.width >= 1 && size.height >= 1;
}
export function validRectangle(rect: Rectangle) {
  return validSize(rect) && Number.isFinite(rect.x) && Number.isFinite(rect.y);
}
export function layoutSlotToPixels(rect: Rectangle, canvas: Size): Rectangle {
  return {
    x: rect.x * canvas.width,
    y: rect.y * canvas.height,
    width: rect.width * canvas.width,
    height: rect.height * canvas.height,
  };
}
export function fitWithinBounds(image: Size, bounds: Rectangle): Rectangle {
  if (!validSize(image) || !validRectangle(bounds))
    throw new Error("Image and placeholder dimensions must be positive finite numbers");
  const scale = Math.min(bounds.width / image.width, bounds.height / image.height);
  const width = Math.max(1, Math.floor(image.width * scale));
  const height = Math.max(1, Math.floor(image.height * scale));
  return {
    x: Math.round(bounds.x + (bounds.width - width) / 2),
    y: Math.round(bounds.y + (bounds.height - height) / 2),
    width,
    height,
  };
}
/** Keeps the existing canvas and adds room on any edge. Negative origins become a translation. */
export function expandedCanvasBounds(canvas: Size, rectangles: Rectangle[]): Rectangle {
  const valid = rectangles.filter(validRectangle);
  const x = Math.floor(Math.min(0, ...valid.map((r) => r.x)));
  const y = Math.floor(Math.min(0, ...valid.map((r) => r.y)));
  return {
    x,
    y,
    width: Math.ceil(Math.max(canvas.width, ...valid.map((r) => r.x + r.width))) - x,
    height: Math.ceil(Math.max(canvas.height, ...valid.map((r) => r.y + r.height))) - y,
  };
}
export function resizeWithAspectRatio(size: Size, axis: keyof Size, value: number, locked: boolean): Size {
  if (!Number.isFinite(value) || value < 1) return size;
  const next = { ...size, [axis]: Math.round(value) };
  if (locked && validSize(size)) {
    if (axis === "width") next.height = Math.max(1, Math.round((next.width * size.height) / size.width));
    else next.width = Math.max(1, Math.round((next.height * size.width) / size.height));
  }
  return next;
}
