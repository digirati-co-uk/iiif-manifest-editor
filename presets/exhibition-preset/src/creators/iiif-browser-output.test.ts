import { describe, expect, test, vi } from "vitest";
import {
  browserImageApiSelector,
  browserTransformDimensions,
  formatIIIFBrowserOutput,
  type IIIFBrowserSelectedItem,
} from "../../../../packages/creators/src/ContentResource/IIIFBrowserCreator/iiif-browser-output";

const crop = {
  type: "BoxSelector" as const,
  spatial: { x: 10.9, y: 20.1, width: 300.8, height: 400.7 },
};

describe("IIIF Browser output transforms", () => {
  test("retains the Browser selector and rotation", () => {
    const selected = {
      id: "https://example.org/canvas",
      type: "Canvas",
      parent: { id: "https://example.org/manifest", type: "Manifest" },
      selector: crop,
      rotation: 90,
    } satisfies IIIFBrowserSelectedItem;
    const resource = { id: selected.id, type: selected.type };
    const vault = { get: vi.fn(() => resource) };

    expect(formatIIIFBrowserOutput(selected, null, vault as any)).toEqual([
      {
        resource,
        parent: selected.parent,
        selector: crop,
        rotation: 90,
      },
    ]);
  });

  test.each([90, 180, 270])("serialises a %d degree rotation", (rotation) => {
    expect(browserImageApiSelector(undefined, rotation)).toEqual({
      type: "ImageApiSelector",
      rotation: `${rotation}`,
    });
  });

  test("serialises a crop without a default rotation", () => {
    expect(browserImageApiSelector(crop, 0)).toEqual({
      type: "ImageApiSelector",
      region: "10,20,300,400",
    });
  });

  test("combines crop and rotation without changing the region", () => {
    expect(browserImageApiSelector(crop, 270)).toEqual({
      type: "ImageApiSelector",
      region: "10,20,300,400",
      rotation: "270",
    });
  });

  test("omits a selector when there is no transform", () => {
    expect(browserImageApiSelector(undefined, undefined)).toBeUndefined();
    expect(browserImageApiSelector(undefined, 0)).toBeUndefined();
  });

  test("swaps derived dimensions for quarter-turn rotations", () => {
    expect(browserTransformDimensions({ width: 1000, height: 800 }, 90)).toEqual({ width: 800, height: 1000 });
    expect(browserTransformDimensions({ width: 1000, height: 800 }, 180)).toEqual({ width: 1000, height: 800 });
  });
});
