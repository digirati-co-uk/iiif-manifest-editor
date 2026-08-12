import type { SceneBounds, SceneView } from "react-iiif-vault/scene-panel";
import { getTransformVector, type ModelTransform } from "./model-transforms";

const degrees = (value: number) => (value * 180) / Math.PI || 0;

export const cameraPresets = [
  { id: "current", label: "Current view" },
  { id: "isometric", label: "Isometric" },
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "top", label: "Top down" },
] as const;
export type CameraPreset = (typeof cameraPresets)[number]["id"];

const cameraPresetDirections: Record<Exclude<CameraPreset, "current">, readonly [number, number, number]> = {
  isometric: [1, 1, 1],
  front: [0, 0, 1],
  back: [0, 0, -1],
  left: [-1, 0, 0],
  right: [1, 0, 0],
  top: [0, 1, 0],
};

export function sceneCameraView(item: any, getBounds: (id: string) => SceneBounds | null): SceneView | null {
  if (!item?.type?.endsWith("Camera")) return null;
  const transforms = (item.transforms || []) as ModelTransform[];
  const positionValue = getTransformVector(transforms, "TranslateTransform");
  const position: [number, number, number] = [positionValue.x, positionValue.y, positionValue.z];
  const target = cameraTarget(item.resource?.lookAt, getBounds);
  const authoredRotation = transforms.some((transform) => transform.type === "RotateTransform");
  const rotationValue = getTransformVector(transforms, "RotateTransform");
  const rotation: [number, number, number] = authoredRotation
    ? [rotationValue.x, rotationValue.y, rotationValue.z]
    : sceneCameraRotation({ position, target, rotation: [0, 0, 0] });
  const near = positive(item.resource?.near, 0.1);
  const far = Math.max(near + 0.001, positive(item.resource?.far, 2000));
  const view: SceneView = {
    projection: item.type === "OrthographicCamera" ? "orthographic" : "perspective",
    position,
    rotation,
    target,
    near,
    far,
  };
  if (view.projection === "orthographic") view.viewHeight = positive(item.resource?.viewHeight, 2);
  else view.fieldOfView = positive(item.resource?.fieldOfView, 50);
  return view;
}

function cameraTarget(value: any, getBounds: (id: string) => SceneBounds | null): [number, number, number] {
  if (value?.type === "PointSelector") return [Number(value.x) || 0, Number(value.y) || 0, Number(value.z) || 0];
  const id = value?.type === "SpecificResource" ? value.source?.id : value?.id;
  return (id && getBounds(id)?.center) || [0, 0, 0];
}

export function sceneCameraRotation(
  view: Pick<SceneView, "position" | "rotation" | "target">
): [number, number, number] {
  if (view.rotation.some((value) => Math.abs(value) > 0.000001)) return [...view.rotation];
  const position = view.position;
  const target = view.target;
  const x = target[0] - position[0];
  const y = target[1] - position[1];
  const z = target[2] - position[2];
  if (!x && !y && !z) return [0, 0, 0] as [number, number, number];
  const horizontal = Math.hypot(x, z);
  return [degrees(Math.atan2(y, horizontal)), horizontal < 0.000001 ? 0 : degrees(Math.atan2(-x, -z)), 0] as [
    number,
    number,
    number,
  ];
}

export function sceneCameraPresetView(
  base: SceneView,
  preset: CameraPreset,
  projection: SceneView["projection"]
): SceneView {
  const target = [...base.target] as [number, number, number];
  const distance =
    Math.hypot(base.position[0] - target[0], base.position[1] - target[1], base.position[2] - target[2]) || 5;
  let position = [...base.position] as [number, number, number];
  let rotation = [...base.rotation] as [number, number, number];

  if (preset !== "current") {
    const direction = cameraPresetDirections[preset];
    const length = Math.hypot(...direction);
    position = direction.map((value, index) => target[index]! + (value / length) * distance) as [
      number,
      number,
      number,
    ];
    rotation = sceneCameraRotation({ position, target, rotation: [0, 0, 0] });
  }

  const fieldOfView = base.fieldOfView || 50;
  return {
    ...base,
    projection,
    position,
    rotation,
    target,
    fieldOfView,
    viewHeight: base.viewHeight || 2 * distance * Math.tan((fieldOfView * Math.PI) / 360),
  };
}

function positive(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}
