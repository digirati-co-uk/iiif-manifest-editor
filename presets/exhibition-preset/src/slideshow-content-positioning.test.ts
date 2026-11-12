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

import { supportsTourSteps } from "./slideshow-content-positioning";

test("audio slides do not offer image tour steps", () => {
  expect(supportsTourSteps({ get: (value: any) => value }, { behavior: ["audio"] })).toBe(false);
  const canvas = { items: [{ items: [{ motivation: ["painting"], body: [{ type: "Sound", id: "https://example.org/audio.mp3" }] }] }] };
  expect(supportsTourSteps({ get: (value: any) => value }, canvas)).toBe(false);
});
