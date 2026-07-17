import { describe, expect, test, vi } from "vitest";
import {
  applyImageCrop,
  getEditableImageCrop,
  parseCropRegion,
  shouldResizeCanvasForCrop,
  transformImageCrop,
} from "./image-crop";

const service = {
  id: "https://images.example.org/iiif/book-1",
  type: "ImageService3",
  profile: "level2",
  width: 2000,
  height: 1500,
};

function fixture(overrides: any = {}) {
  return {
    id: "annotation-1",
    type: "Annotation",
    motivation: "painting",
    body: [
      {
        id: "specific-1",
        type: "SpecificResource",
        selector: {
          type: "ImageApiSelector",
          region: "10,20,300,400",
          rotation: "90",
          retained: true,
        },
        source: {
          id: "https://images.example.org/iiif/book-1/10,20,300,400/max/90/default.jpg",
          type: "Image",
          format: "image/jpeg",
          service: [service],
          retained: true,
        },
      },
    ],
    ...overrides,
  };
}

describe("existing image crop eligibility", () => {
  test("accepts selector aliases and independent painting annotations", () => {
    expect(getEditableImageCrop(fixture())).not.toBeNull();
    const aliased = fixture();
    aliased.body[0].selector.type = "iiif:ImageApiSelector";
    expect(getEditableImageCrop(aliased)?.selector.type).toBe("iiif:ImageApiSelector");
  });

  test.each([
    ["uncropped body", fixture({ body: [{ ...fixture().body[0], selector: undefined }] })],
    ["non-painting annotation", fixture({ motivation: "commenting" })],
    ["choice body", fixture({ body: [{ type: "Choice", items: [] }] })],
    ["multiple bodies", fixture({ body: [fixture().body[0], fixture().body[0]] })],
    ["missing service", fixture({ body: [{ ...fixture().body[0], source: { type: "Image" } }] })],
    ["malformed selector", fixture({ body: [{ ...fixture().body[0], selector: { type: "ImageApiSelector", region: "x" } }] })],
  ])("rejects %s", (_, annotation) => {
    expect(getEditableImageCrop(annotation)).toBeNull();
  });
});

describe("image crop transform", () => {
  test("normalises the region and preserves rotation and unrelated fields", () => {
    const crop = getEditableImageCrop(fixture())!;
    const transformed = transformImageCrop(crop, { x: 21.6, y: 31.2, width: 499.7, height: 249.5 });

    expect(transformed.selector).toEqual({
      type: "ImageApiSelector",
      region: "22,31,500,250",
      rotation: "90",
      retained: true,
    });
    expect(transformed.source.retained).toBe(true);
    expect(transformed.sourceId).toBe(
      "https://images.example.org/iiif/book-1/22,31,500,250/max/90/default.jpg",
    );
    expect(transformed.thumbnailId).toBe(
      "https://images.example.org/iiif/book-1/22,31,500,250/512,/90/default.jpg",
    );
  });

  test("rejects malformed regions", () => {
    expect(parseCropRegion("1,2,0,4")).toBeNull();
    expect(() => transformImageCrop(getEditableImageCrop(fixture())!, { x: 0, y: 0, width: 0, height: 1 })).toThrow();
  });
});

describe("crop transaction side effects", () => {
  test("saves in one batch, refreshes thumbnail, and resizes a single-image canvas", () => {
    const annotation = fixture();
    const canvas = {
      id: "canvas-1",
      type: "Canvas",
      width: 1000,
      height: 1000,
      items: [{ id: "page-1", type: "AnnotationPage" }],
    };
    const page = { id: "page-1", type: "AnnotationPage", items: [{ id: annotation.id, type: "Annotation" }] };
    const entities: any = { "page-1": page, [annotation.id]: annotation };
    const vault = {
      batch: vi.fn((callback) => callback()),
      loadSync: vi.fn(),
      modifyEntityField: vi.fn(),
      get: vi.fn((ref) => entities[ref.id]),
    };

    applyImageCrop(vault, getEditableImageCrop(annotation)!, canvas, { x: 1, y: 2, width: 320, height: 180 });

    expect(vault.batch).toHaveBeenCalledTimes(1);
    expect(vault.modifyEntityField).toHaveBeenCalledWith({ id: "canvas-1", type: "Canvas" }, "width", 320);
    expect(vault.modifyEntityField).toHaveBeenCalledWith({ id: "canvas-1", type: "Canvas" }, "height", 180);
    expect(vault.modifyEntityField).toHaveBeenCalledWith(
      { id: "canvas-1", type: "Canvas" },
      "thumbnail",
      expect.any(Array),
    );
  });

  test("retains composition dimensions for multiple paintings and multi-image canvases", () => {
    expect(shouldResizeCanvasForCrop({ behavior: [] }, 2)).toBe(false);
    expect(shouldResizeCanvasForCrop({ behavior: ["multi-image"] }, 1)).toBe(false);
    expect(shouldResizeCanvasForCrop({ behavior: [] }, 1)).toBe(true);
  });
});
