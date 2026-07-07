import { getImageApiRegion, getRegionIntersection, imageUrlWithRegion } from "@manifest-editor/components";
import { describe, expect, test } from "vitest";

describe("getRegionIntersection", () => {
  test("returns the overlapping canvas region", () => {
    expect(
      getRegionIntersection(
        { x: 10, y: 10, width: 50, height: 40 },
        { x: 40, y: 20, width: 50, height: 20 },
      ),
    ).toEqual({ x: 40, y: 20, width: 20, height: 20 });
  });

  test("returns null when regions do not overlap", () => {
    expect(
      getRegionIntersection(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 10, y: 0, width: 10, height: 10 },
      ),
    ).toBeNull();
  });
});

describe("imageUrlWithRegion", () => {
  test("applies an Image API selector region to a thumbnail URL", () => {
    const body = {
      selector: {
        type: "ImageApiSelector",
        region: "10,20,300,400",
      },
    };

    expect(getImageApiRegion(body)).toBe("10,20,300,400");
    expect(
      imageUrlWithRegion("https://example.org/iiif/image/full/256,/0/default.jpg", getImageApiRegion(body)),
    ).toBe("https://example.org/iiif/image/10,20,300,400/256,/0/default.jpg");
  });
});
