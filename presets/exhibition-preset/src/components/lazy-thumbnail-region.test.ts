import {
  getImageApiRegion,
  getRegionIntersection,
  imageUrlWithRegion,
  shouldUseComplexCanvasThumbnail,
} from "../../../../packages/components/src/LazyThumbnail";
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

describe("shouldUseComplexCanvasThumbnail", () => {
  const image = (body: any) => ({
    annotation: { body },
  });

  test("uses the ordinary path for one uncropped image", () => {
    expect(
      shouldUseComplexCanvasThumbnail({
        type: "images",
        images: [image({ id: "https://example.org/image.jpg", type: "Image" })],
      }),
    ).toBe(false);
  });

  test("uses the composition path for a single valid body crop", () => {
    expect(
      shouldUseComplexCanvasThumbnail({
        type: "images",
        images: [
          image({
            type: "SpecificResource",
            selector: {
              type: "ImageApiSelector",
              region: "10,20,300,400",
            },
          }),
        ],
      }),
    ).toBe(true);
  });

  test("retains existing complex cases and rejects malformed selectors", () => {
    const malformed = {
      type: "images",
      images: [
        image({
          type: "SpecificResource",
          selector: { type: "ImageApiSelector", region: "not-a-region" },
        }),
      ],
    };

    expect(shouldUseComplexCanvasThumbnail(malformed)).toBe(false);
    expect(
      shouldUseComplexCanvasThumbnail({
        type: "images",
        images: [image({ type: "Image" }), image({ type: "Image" })],
      }),
    ).toBe(true);
    expect(
      shouldUseComplexCanvasThumbnail(
        { type: "images", images: [image({ type: "Image" })] },
        undefined,
        { x: 0, y: 0, width: 100, height: 100 },
      ),
    ).toBe(true);
  });
});
