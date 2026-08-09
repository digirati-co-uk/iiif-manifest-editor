import { describe, expect, test } from "vitest";
import { sceneCameraRotation, sceneCameraView } from "../helpers/scene-camera";

describe("Scene camera views", () => {
  test("restores a camera position and referenced lookAt", () => {
    const view = sceneCameraView(
      {
        type: "PerspectiveCamera",
        resource: { near: 0.1, far: 100, fieldOfView: 45, lookAt: { id: "model", type: "Annotation" } },
        transforms: [{ type: "TranslateTransform", x: 3, y: 4, z: 5 }],
      },
      () => ({ min: [-1, -1, -1], max: [1, 1, 1], center: [0, 0, 0] })
    );

    expect(view).toMatchObject({
      projection: "perspective",
      position: [3, 4, 5],
      target: [0, 0, 0],
      near: 0.1,
      far: 100,
      fieldOfView: 45,
    });
    expect(view?.rotation.some((value) => Math.abs(value) > 0.01)).toBe(true);
  });

  test("preserves an authored rotation", () => {
    expect(
      sceneCameraView(
        {
          type: "OrthographicCamera",
          resource: { viewHeight: 4, lookAt: { type: "PointSelector", x: 1, y: 2, z: 3 } },
          transforms: [
            { type: "RotateTransform", x: 10, y: 20, z: 30 },
            { type: "TranslateTransform", x: 4, y: 5, z: 6 },
          ],
        },
        () => null
      )
    ).toMatchObject({
      projection: "orthographic",
      position: [4, 5, 6],
      rotation: [10, 20, 30],
      target: [1, 2, 3],
      viewHeight: 4,
    });
  });

  test("derives a helper rotation when an orbit view only supplies a look-at target", () => {
    expect(
      sceneCameraRotation({
        position: [0, 5, 5],
        target: [0, 0, 0],
        rotation: [0, 0, 0],
      })
    ).toEqual([-45, 0, 0]);
  });
});
