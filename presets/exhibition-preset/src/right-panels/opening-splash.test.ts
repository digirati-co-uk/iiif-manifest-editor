import { describe, expect, test } from "vitest";
import { supportsTourSteps } from "../slideshow-content-positioning";
import { getOpeningSplashCreatorInitialData, isOpeningSplashCanvas } from "./opening-splash";

const items = [{ id: "canvas-1" }, { id: "canvas-2" }];

describe("opening splash", () => {
  test("only applies splash defaults while the exhibition is empty", () => {
    expect(getOpeningSplashCreatorInitialData([])).toEqual({ imageSlideBehavior: ["splash"] });
    expect(getOpeningSplashCreatorInitialData(items)).toBeUndefined();
    expect(getOpeningSplashCreatorInitialData([{ id: "legacy-canvas-without-splash" }])).toBeUndefined();
  });

  test("only the first splash canvas is the opening splash", () => {
    expect(
      isOpeningSplashCanvas({ id: "canvas-1", behavior: ["splash"] }, items),
    ).toBe(true);
    expect(
      isOpeningSplashCanvas({ id: "canvas-2", behavior: ["splash"] }, items),
    ).toBe(false);
    expect(
      isOpeningSplashCanvas({ id: "canvas-1", behavior: ["image"] }, items),
    ).toBe(false);
    expect(isOpeningSplashCanvas(undefined, items)).toBe(false);
  });

  test("follows the current canvas order", () => {
    const splash = { id: "canvas-1", behavior: ["splash"] };

    expect(isOpeningSplashCanvas(splash, items)).toBe(true);
    expect(isOpeningSplashCanvas(splash, [...items].reverse())).toBe(false);
  });

  test("exposes Tour Steps only on normal image slides", () => {
    const vault = { get: (resource: unknown) => resource };
    const image = slide("canvas-2", ["image"], { id: "image", type: "Image" });
    const splash = slide("canvas-1", ["splash"], { id: "image", type: "Image" });
    const info = slide("canvas-2", ["info"], { id: "text", type: "TextualBody" });
    const video = slide("canvas-2", ["image"], { id: "video", type: "Video" });
    const exposesTourSteps = (canvas: ReturnType<typeof slide>) =>
      supportsTourSteps(vault, canvas) && !isOpeningSplashCanvas(canvas, items);

    expect(exposesTourSteps(image)).toBe(true);
    expect(exposesTourSteps(splash)).toBe(false);
    expect(exposesTourSteps(info)).toBe(false);
    expect(exposesTourSteps(video)).toBe(false);
  });
});

function slide(id: string, behavior: string[], body: { id: string; type: string }) {
  return {
    id,
    behavior,
    items: [{ items: [{ motivation: "painting", body }] }],
  };
}
