import { createSceneTransformMatrix } from "@iiif/helpers/scenes";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";

export type TransformType = "ScaleTransform" | "RotateTransform" | "TranslateTransform";
export type TransformAxis = "x" | "y" | "z";
export type ModelTransform = { type: TransformType; x?: number; y?: number; z?: number };
export type SceneTransformMode = "translate" | "rotate" | "scale";
export type SceneTransformSpace = "local" | "world";
export type SceneTransformValue = {
  annotationId: string;
  matrix: Matrix4;
  translation: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

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

export function sceneTransformValueFromMatrix(
  annotationId: string,
  localMatrix: Matrix4,
  targetPoint: readonly [number, number, number] | null = null
): SceneTransformValue {
  const point = targetPoint || [0, 0, 0];
  const authored = new Matrix4().makeTranslation(-point[0], -point[1], -point[2]).multiply(localMatrix);
  const position = new Vector3();
  const quaternion = new Quaternion();
  const scale = new Vector3();
  authored.decompose(position, quaternion, scale);
  const rotation = new Euler().setFromQuaternion(quaternion, "ZYX");
  return {
    annotationId,
    matrix: localMatrix.clone(),
    translation: position.toArray(),
    rotation: [rotation.x, rotation.y, rotation.z].map((value) => (value * 180) / Math.PI) as [number, number, number],
    scale: scale.toArray(),
  };
}

export function sceneActivationTransformValueFromMatrix(
  annotationId: string,
  finalMatrix: Matrix4,
  restTransforms: readonly ModelTransform[],
  targetPoint: readonly [number, number, number] | null = null
) {
  const point = targetPoint || [0, 0, 0];
  const restMatrix = new Matrix4().fromArray(createSceneTransformMatrix(restTransforms, [0, 0, 0])).invert();
  const activationMatrix = new Matrix4()
    .makeTranslation(-point[0], -point[1], -point[2])
    .multiply(finalMatrix)
    .multiply(restMatrix);
  return sceneTransformValueFromMatrix(annotationId, activationMatrix);
}
