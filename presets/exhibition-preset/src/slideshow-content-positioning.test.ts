import { describe, expect, test } from "vitest";
import { getAnnotationTargetBox } from "./slideshow-content-positioning";

describe("getAnnotationTargetBox", () => {
  test("keeps a bare canvas target on the whole canvas", () => {
    const canvas = {
      id: "https://example.org/canvas/1",
      width: 900,
      height: 600,
      behavior: ["left"],
    };

    expect(
      getAnnotationTargetBox(
        { target: canvas.id },
        canvas,
      ),
    ).toEqual({ x: 0, y: 0, width: 900, height: 600 });
  });
});
