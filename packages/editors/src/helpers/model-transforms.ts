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

export function setTransformVector(
  transforms: readonly ModelTransform[],
  type: TransformType,
  value: { x: number; y: number; z: number }
) {
  const next = transforms.filter((item) => item.type !== type).map((item) => ({ ...item }));
  next.push({ type, ...value });
  return next;
}

export function sceneTransformValueToTransforms(value: {
  translation: readonly [number, number, number];
  rotation: readonly [number, number, number];
  scale: readonly [number, number, number];
}) {
  const round = (number: number) => Math.round(number * 1_000_000) / 1_000_000;
  const vector = (values: readonly [number, number, number]) => ({
    x: round(values[0]),
    y: round(values[1]),
    z: round(values[2]),
  });
  const transforms: ModelTransform[] = [];
  if (value.scale.some((item) => Math.abs(item - 1) > 0.000001)) {
    transforms.push({ type: "ScaleTransform", ...vector(value.scale) });
  }
  if (value.rotation.some((item) => Math.abs(item) > 0.000001)) {
    transforms.push({ type: "RotateTransform", ...vector(value.rotation) });
  }
  if (value.translation.some((item) => Math.abs(item) > 0.000001)) {
    transforms.push({ type: "TranslateTransform", ...vector(value.translation) });
  }
  return transforms;
}
