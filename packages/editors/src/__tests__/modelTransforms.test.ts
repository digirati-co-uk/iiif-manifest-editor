import { describe, expect, test } from "vitest";
import {
  getTransformVector,
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

  test("sets a complete vector without disturbing other transform types", () => {
    expect(setTransformVector([{ type: "RotateTransform", y: 5 }], "ScaleTransform", { x: 2, y: 2, z: 2 })).toEqual([
      { type: "RotateTransform", y: 5 },
      { type: "ScaleTransform", x: 2, y: 2, z: 2 },
    ]);
  });
});
