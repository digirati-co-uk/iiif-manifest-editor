import { describe, expect, test } from "vitest";
import { getTransformVector, setTransformAxis } from "../helpers/model-transforms";

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
});
