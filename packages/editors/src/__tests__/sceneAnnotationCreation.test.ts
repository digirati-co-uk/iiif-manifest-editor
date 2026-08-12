import { describe, expect, it } from "vitest";
import { Object3D, Vector3 } from "three";
import { findModelSurfacePoint, scenePointTarget } from "../helpers/scene-annotation-creation";

describe("Scene annotation creation", () => {
  it("chooses the first intersection belonging to a rendered model", () => {
    const unrelated = new Object3D();
    const model = new Object3D();
    const mesh = new Object3D();
    model.userData.iiifIds = ["painting", "model"];
    model.add(mesh);

    expect(
      findModelSurfacePoint(
        [
          { object: unrelated, point: new Vector3(9, 9, 9) },
          { object: mesh, point: new Vector3(1, 2, 3) },
        ],
        new Set(["painting"]),
      ),
    ).toEqual([1, 2, 3]);
  });

  it("serializes a world-space PointSelector against the Scene", () => {
    expect(scenePointTarget("scene", [1, 2, 3])).toEqual({
      type: "SpecificResource",
      source: { id: "scene", type: "Scene" },
      selector: [{ type: "PointSelector", x: 1, y: 2, z: 3 }],
    });
  });
});
