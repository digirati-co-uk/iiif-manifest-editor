import type { InputShape } from "polygon-editor";

export function polygonToBoundingBox(polygon: InputShape | null) {
  if (!polygon) {
    return null;
  }
  if (polygon.points.length > 2) {
    const x1 = Math.min(...polygon.points.map((p) => p[0]));
    const y1 = Math.min(...polygon.points.map((p) => p[1]));
    const x2 = Math.max(0, ...polygon.points.map((p) => p[0]));
    const y2 = Math.max(0, ...polygon.points.map((p) => p[1]));
    return {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1,
    };
  }
  return null;
}
