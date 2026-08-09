import { createSceneTransformMatrix } from "@iiif/helpers/scenes";
import { Matrix4 } from "three";
import { describe, expect, test } from "vitest";
import {
  getTransformVector,
  sceneTransformValueFromMatrix,
  sceneTransformValueToTransforms,
  setTransformAxis,
  setTransformVector,
} from "../helpers/model-transforms";

describe("model transforms", () => {
  test("adds and updates transforms without discarding the others", () => {
    const translated = setTransformAxis([], "TranslateTransform", "x", 4);
    const transformed = setTransformAxis(translated, "ScaleTransform", "z", 2);

    expect(getTransformVector(transformed, "TranslateTransform")).toEqual({ x: 4, y: 0, z: 0 });
    expect(getTransformVector(transformed, "ScaleTransform")).toEqual({ x: 1, y: 1, z: 2 });
    expect(transformed).toEqual([
      { type: "TranslateTransform", x: 4 },
      { type: "ScaleTransform", z: 2 },
    ]);
  });

  test("writes canonical scale, rotation, translation values and drops identities", () => {
    expect(
      sceneTransformValueToTransforms({
        translation: [1.00000001, 0, 2],
        rotation: [0, 90, 0],
        scale: [1, 1, 1],
      })
    ).toEqual([
      { type: "RotateTransform", x: 0, y: 90, z: 0 },
      { type: "TranslateTransform", x: 1, y: 0, z: 2 },
    ]);
  });

  test("recovers authored transforms after world-space manipulation", () => {
    const point = [10, 20, 30] as const;
    const local = new Matrix4().fromArray(
      createSceneTransformMatrix(
        [
          { type: "ScaleTransform", x: 2, y: 3, z: 4 },
          { type: "RotateTransform", x: 10, y: 20, z: 30 },
          { type: "TranslateTransform", x: 1, y: 2, z: 3 },
        ],
        point
      )
    );
    const parentWorld = new Matrix4().makeRotationY(Math.PI / 3).setPosition(5, 6, 7);
    const manipulatedWorld = parentWorld.clone().multiply(local);
    const convertedLocal = parentWorld.clone().invert().multiply(manipulatedWorld);

    const value = sceneTransformValueFromMatrix("annotation", convertedLocal, point);
    value.translation.forEach((component, index) => expect(component).toBeCloseTo(index + 1, 10));
    value.rotation.forEach((component, index) => expect(component).toBeCloseTo((index + 1) * 10, 10));
    value.scale.forEach((component, index) => expect(component).toBeCloseTo(index + 2, 10));
  });

  test("sets a complete vector without disturbing other transform types", () => {
    expect(setTransformVector([{ type: "RotateTransform", y: 5 }], "ScaleTransform", { x: 2, y: 2, z: 2 })).toEqual([
      { type: "RotateTransform", y: 5 },
      { type: "ScaleTransform", x: 2, y: 2, z: 2 },
    ]);
  });
});
