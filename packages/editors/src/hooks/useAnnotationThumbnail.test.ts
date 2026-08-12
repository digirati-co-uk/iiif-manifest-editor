import { describe, expect, test } from "vitest";
import { constrainCroppedThumbnail, getAnnotationThumbnailCacheKey } from "./annotation-thumbnail";

describe("constrainCroppedThumbnail", () => {
  test("replaces max on a cropped IIIF image request", () => {
    expect(constrainCroppedThumbnail("https://example.org/iiif/image/610,1738,1909,1584/max/0/default.jpg")).toBe(
      "https://example.org/iiif/image/610,1738,1909,1584/256,/0/default.jpg",
    );
  });

  test("leaves full and non-IIIF image URLs unchanged", () => {
    expect(constrainCroppedThumbnail("https://example.org/iiif/image/full/max/0/default.jpg")).toBe(
      "https://example.org/iiif/image/full/max/0/default.jpg",
    );
    expect(constrainCroppedThumbnail("https://example.org/image.jpg")).toBe("https://example.org/image.jpg");
  });
});

describe("getAnnotationThumbnailCacheKey", () => {
  test("changes when an annotation crop changes", () => {
    const annotation = (region: string) => ({
      id: "https://example.org/annotation",
      type: "Annotation",
      body: [
        {
          type: "SpecificResource",
          source: { id: "https://example.org/image", type: "ContentResource" },
          selector: { type: "ImageApiSelector", region },
        },
      ],
    });

    expect(getAnnotationThumbnailCacheKey("https://example.org/annotation", annotation("0,0,100,100"))).not.toBe(
      getAnnotationThumbnailCacheKey("https://example.org/annotation", annotation("10,10,50,50")),
    );
  });
});
