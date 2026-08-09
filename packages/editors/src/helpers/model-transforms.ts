export type TransformType = "ScaleTransform" | "RotateTransform" | "TranslateTransform";
export type TransformAxis = "x" | "y" | "z";
export type ModelTransform = { type: TransformType; x?: number; y?: number; z?: number };

export function getTransformVector(transforms: readonly ModelTransform[], type: TransformType) {
  const transform = transforms.find((item) => item.type === type);
  const fallback = type === "ScaleTransform" ? 1 : 0;
  return {
    x: transform?.x ?? fallback,
    y: transform?.y ?? fallback,
    z: transform?.z ?? fallback,
  };
}

export function setTransformAxis(
  transforms: readonly ModelTransform[],
  type: TransformType,
  axis: TransformAxis,
  value: number
) {
  const next = transforms.map((item) => ({ ...item }));
  const index = next.findIndex((item) => item.type === type);
  if (index === -1) {
    next.push({ type, [axis]: value });
  } else {
    next[index] = { ...next[index]!, [axis]: value };
  }
  return next;
}
