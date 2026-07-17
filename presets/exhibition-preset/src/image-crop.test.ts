import { Vault } from "@iiif/helpers";
import { describe, expect, test, vi } from "vitest";
import {
  applyImageCrop,
  applyImageCropResponse,
  applyImageRotation,
  fullImageRequest,
  getEditableImageCrop,
  getImageCropContext,
  normaliseImageRotation,
  parseCropRegion,
  resolveImageService,
  rotatedImageDimensions,
  shouldResizeCanvasForCrop,
  transformImageCrop,
  transformImageRotation,
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
    target: "canvas-1",
    body: [
      {
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
          width: 777,
          height: 1024,
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

  test("accepts an inline SpecificResource without an id", () => {
    expect(getEditableImageCrop(fixture())?.annotationRef).toEqual({
      id: "annotation-1",
      type: "Annotation",
    });
  });

  test("offers crop creation for an uncropped IIIF image", () => {
    const image = fixture().body[0].source;
    const crop = getImageCropContext(fixture({ body: [image] }));

    expect(crop).toMatchObject({
      selector: { type: "ImageApiSelector" },
      body: {
        type: "SpecificResource",
        source: image,
      },
    });
    expect(getEditableImageCrop(fixture({ body: [image] }))).toBeNull();
  });

  test.each([
    ["uncropped body", fixture({ body: [{ ...fixture().body[0], selector: undefined }] })],
    ["non-painting annotation", fixture({ motivation: "commenting" })],
    ["choice body", fixture({ body: [{ type: "Choice", items: [] }] })],
    ["multiple bodies", fixture({ body: [fixture().body[0], fixture().body[0]] })],
    ["missing service", fixture({ body: [{ ...fixture().body[0], source: { type: "Image" } }] })],
    [
      "malformed selector",
      fixture({
        body: [
          {
            ...fixture().body[0],
            selector: { type: "ImageApiSelector", region: "x" },
          },
        ],
      }),
    ],
  ])("rejects %s", (_, annotation) => {
    expect(getEditableImageCrop(annotation)).toBeNull();
  });
});

describe("image service resolution", () => {
  test("creates an uncropped full-image request for a virtual canvas", () => {
    expect(fullImageRequest(service)).toBe("https://images.example.org/iiif/book-1/full/max/0/default.jpg");
  });

  test("uses embedded full dimensions without a request", async () => {
    const fetcher = vi.fn();
    await expect(resolveImageService(service, fetcher as any)).resolves.toBe(service);
    expect(fetcher).not.toHaveBeenCalled();
  });

  test("loads missing dimensions and rejects unavailable services", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: service.id,
        type: "ImageService3",
        width: 1000,
        height: 800,
      }),
    });
    await expect(resolveImageService({ id: service.id, type: "ImageService3" }, fetcher as any)).resolves.toMatchObject(
      {
        width: 1000,
        height: 800,
      },
    );
    await expect(
      resolveImageService(
        { id: service.id, type: "ImageService3" },
        vi.fn().mockResolvedValue({ ok: false, status: 503 }) as any,
      ),
    ).rejects.toThrow("503");
  });
});

describe("image crop transform", () => {
  test("normalises the region and preserves rotation and unrelated fields", () => {
    const crop = getEditableImageCrop(fixture())!;
    const transformed = transformImageCrop(crop, {
      x: 21.6,
      y: 31.2,
      width: 499.7,
      height: 249.5,
    });

    expect(transformed.selector).toEqual({
      type: "ImageApiSelector",
      region: "22,31,500,250",
      rotation: "90",
      retained: true,
    });
    expect(transformed.source.retained).toBe(true);
    expect(transformed.source).toMatchObject({ width: 250, height: 500 });
    expect(transformed.imageDimensions).toEqual({ width: 250, height: 500 });
    expect(transformed.sourceId).toBe("https://images.example.org/iiif/book-1/22,31,500,250/max/90/default.jpg");
    expect(transformed.thumbnailId).toBe("https://images.example.org/iiif/book-1/22,31,500,250/500,/90/default.jpg");
    expect(transformed.thumbnailDimensions).toEqual({ width: 250, height: 500 });
  });

  test("updates non-rotated image dimensions when the old request was stale", () => {
    const annotation = fixture();
    annotation.body[0].selector.rotation = undefined;
    annotation.body[0].source.id = "https://images.example.org/iiif/book-1/10,20,300,400/max/0/default.jpg";
    const transformed = transformImageCrop(getEditableImageCrop(annotation)!, {
      x: 2,
      y: 3,
      width: 20,
      height: 30,
    });
    expect(transformed.sourceId).toContain("/2,3,20,30/max/0/default.jpg");
    expect(transformed.source).toMatchObject({ width: 20, height: 30 });
  });

  test("uses a full-size crop request and preserves mirrored rotation", () => {
    const annotation = fixture();
    annotation.body[0].selector.rotation = "!90";
    annotation.body[0].source.id = "https://images.example.org/iiif/book-1/full/800,/0/default.jpg";

    const transformed = transformImageCrop(getEditableImageCrop(annotation)!, {
      x: 2,
      y: 3,
      width: 20,
      height: 30,
    });

    expect(transformed.sourceId).toContain("/2,3,20,30/max/!90/default.jpg");
    expect(transformed.thumbnailId).toContain("/2,3,20,30/20,/!90/default.jpg");
    expect(transformed.source).toMatchObject({ width: 30, height: 20 });
    expect(transformed.thumbnailDimensions).toEqual({ width: 30, height: 20 });
  });

  test("reports rotated thumbnail dimensions", () => {
    expect(rotatedImageDimensions(512, 256, "90")).toEqual({
      width: 256,
      height: 512,
    });
    expect(rotatedImageDimensions(512, 256, "180")).toEqual({
      width: 512,
      height: 256,
    });
  });

  test("changes rotation without changing an existing crop", () => {
    const transformed = transformImageRotation(getEditableImageCrop(fixture())!, 270);

    expect(transformed.selector).toMatchObject({
      type: "ImageApiSelector",
      region: "10,20,300,400",
      rotation: "270",
      retained: true,
    });
    expect(transformed.sourceId).toBe(
      "https://images.example.org/iiif/book-1/10,20,300,400/max/270/default.jpg",
    );
    expect(transformed.imageDimensions).toEqual({ width: 400, height: 300 });
  });

  test("rotates a full image without introducing a crop", () => {
    const image = fixture().body[0].source;
    const transformed = transformImageRotation(getImageCropContext(fixture({ body: [image] }))!, 90);

    expect(transformed.selector).toEqual({
      type: "ImageApiSelector",
      rotation: "90",
    });
    expect(transformed.sourceId).toBe("https://images.example.org/iiif/book-1/full/max/90/default.jpg");
    expect(transformed.imageDimensions).toEqual({ width: 1500, height: 2000 });
  });

  test("normalises rotation controls to quarter turns", () => {
    expect(normaliseImageRotation("!270")).toBe(270);
    expect(normaliseImageRotation(450)).toBe(90);
    expect(normaliseImageRotation(45)).toBe(0);
  });

  test("rejects malformed regions", () => {
    expect(parseCropRegion("1,2,0,4")).toBeNull();
    expect(() =>
      transformImageCrop(getEditableImageCrop(fixture())!, {
        x: 0,
        y: 0,
        width: 0,
        height: 1,
      }),
    ).toThrow();
  });
});

describe("crop transaction side effects", () => {
  test.each([
    ["Cancel", { cancelled: true }],
    ["Escape", null],
    ["service failure", undefined],
  ])("%s performs zero writes", (_, response) => {
    const vault = {
      batch: vi.fn(),
      dispatch: vi.fn(),
      modifyEntityField: vi.fn(),
    };
    const annotation = fixture();
    applyImageCropResponse(vault, getEditableImageCrop(annotation)!, { id: "canvas-1" }, response as any);
    expect(vault.batch).not.toHaveBeenCalled();
    expect(vault.dispatch).not.toHaveBeenCalled();
    expect(vault.modifyEntityField).not.toHaveBeenCalled();
  });

  test("saves in one batch, refreshes thumbnail, and resizes a single-image canvas", () => {
    const annotation = fixture({
      target: {
        type: "SpecificResource",
        source: { id: "canvas-1", type: "Canvas" },
        selector: { type: "FragmentSelector", value: "xywh=0,0,1000,1000" },
      },
    });
    const canvas = {
      id: "canvas-1",
      type: "Canvas",
      width: 1000,
      height: 1000,
      items: [{ id: "page-1", type: "AnnotationPage" }],
    };
    const page = {
      id: "page-1",
      type: "AnnotationPage",
      items: [{ id: annotation.id, type: "Annotation" }],
    };
    const entities: any = { "page-1": page, [annotation.id]: annotation };
    const vault = {
      batch: vi.fn((callback) => callback()),
      dispatch: vi.fn(),
      modifyEntityField: vi.fn(),
      get: vi.fn((ref) => entities[ref.id]),
    };

    applyImageCrop(vault, getEditableImageCrop(annotation)!, canvas, {
      x: 1,
      y: 2,
      width: 320,
      height: 180,
    });

    expect(vault.batch).toHaveBeenCalledTimes(1);
    expect(vault.modifyEntityField).toHaveBeenCalledWith({ id: "annotation-1", type: "Annotation" }, "body", [
      expect.objectContaining({
        type: "SpecificResource",
        selector: expect.objectContaining({ region: "1,2,320,180" }),
        source: expect.objectContaining({ type: "ContentResource" }),
      }),
    ]);
    expect(vault.modifyEntityField).toHaveBeenCalledWith({ id: "canvas-1", type: "Canvas" }, "width", 180);
    expect(vault.modifyEntityField).toHaveBeenCalledWith({ id: "canvas-1", type: "Canvas" }, "height", 320);
    expect(vault.modifyEntityField).toHaveBeenCalledWith(
      { id: "annotation-1", type: "Annotation" },
      "target",
      {
        type: "SpecificResource",
        source: { id: "canvas-1", type: "Canvas" },
        selector: undefined,
      },
    );
    expect(vault.modifyEntityField).toHaveBeenCalledWith(
      { id: "canvas-1", type: "Canvas" },
      "thumbnail",
      expect.any(Array),
    );
  });

  test("saves rotation in one batch and updates a single-image canvas", () => {
    const annotation = fixture();
    const canvas = {
      id: "canvas-1",
      type: "Canvas",
      width: 400,
      height: 300,
      items: [{ id: "page-1", type: "AnnotationPage" }],
    };
    const entities: any = {
      "page-1": {
        id: "page-1",
        type: "AnnotationPage",
        items: [{ id: annotation.id, type: "Annotation" }],
      },
      [annotation.id]: annotation,
    };
    const vault = {
      batch: vi.fn((callback) => callback()),
      dispatch: vi.fn(),
      modifyEntityField: vi.fn(),
      get: vi.fn((ref) => entities[ref.id]),
    };

    applyImageRotation(vault, getEditableImageCrop(annotation)!, canvas, 180);

    expect(vault.batch).toHaveBeenCalledTimes(1);
    expect(vault.modifyEntityField).toHaveBeenCalledWith(
      { id: "annotation-1", type: "Annotation" },
      "body",
      [
        expect.objectContaining({
          selector: expect.objectContaining({
            region: "10,20,300,400",
            rotation: "180",
          }),
        }),
      ],
    );
    expect(vault.modifyEntityField).toHaveBeenCalledWith(
      { id: "canvas-1", type: "Canvas" },
      "width",
      300,
    );
    expect(vault.modifyEntityField).toHaveBeenCalledWith(
      { id: "canvas-1", type: "Canvas" },
      "height",
      400,
    );
  });

  test("retains composition dimensions for multiple paintings and multi-image canvases", () => {
    const canvas = { id: "canvas-1", behavior: [] };
    const wholeCanvas = { target: "canvas-1" };
    expect(shouldResizeCanvasForCrop(canvas, wholeCanvas, 2)).toBe(false);
    expect(shouldResizeCanvasForCrop({ ...canvas, behavior: ["multi-image"] }, wholeCanvas, 1)).toBe(false);
    expect(shouldResizeCanvasForCrop(canvas, wholeCanvas, 1)).toBe(true);
  });

  test("resizes for direct and full-size whole-canvas targets", () => {
    const canvas = { id: "canvas-1", width: 1000, height: 1000, behavior: [] };
    expect(shouldResizeCanvasForCrop(canvas, { target: "canvas-1" }, 1)).toBe(true);
    expect(shouldResizeCanvasForCrop(canvas, { target: "canvas-1#xywh=0,0,1000,1000" }, 1)).toBe(true);
    expect(
      shouldResizeCanvasForCrop(
        canvas,
        { target: { type: "SpecificResource", source: "canvas-1#xywh=0,0,1000,1000" } },
        1,
      ),
    ).toBe(true);
    expect(
      shouldResizeCanvasForCrop(
        canvas,
        {
          target: {
            type: "SpecificResource",
            source: { id: "canvas-1", type: "Canvas" },
            selector: { type: "FragmentSelector", value: "xywh=0,0,1000,1000" },
          },
        },
        1,
      ),
    ).toBe(true);
    expect(
      shouldResizeCanvasForCrop(
        canvas,
        { target: { type: "SpecificResource", source: { id: "canvas-1", type: "Canvas" } } },
        1,
      ),
    ).toBe(true);
  });

  test("does not resize the canvas when the painting targets a selected region", () => {
    const annotation = fixture({ target: "canvas-1#xywh=10,20,300,400" });
    const canvas = {
      id: "canvas-1",
      type: "Canvas",
      width: 1000,
      height: 1000,
      items: [{ id: "page-1", type: "AnnotationPage" }],
    };
    const entities: any = {
      "page-1": {
        id: "page-1",
        type: "AnnotationPage",
        items: [{ id: annotation.id, type: "Annotation" }],
      },
      [annotation.id]: annotation,
    };
    const vault = {
      batch: vi.fn((callback) => callback()),
      dispatch: vi.fn(),
      modifyEntityField: vi.fn(),
      get: vi.fn((ref) => entities[ref.id]),
    };

    applyImageCrop(vault, getEditableImageCrop(annotation)!, canvas, {
      x: 1,
      y: 2,
      width: 320,
      height: 180,
    });

    expect(vault.modifyEntityField).not.toHaveBeenCalledWith(
      { id: "canvas-1", type: "Canvas" },
      "width",
      expect.anything(),
    );
    expect(vault.modifyEntityField).not.toHaveBeenCalledWith(
      { id: "canvas-1", type: "Canvas" },
      "height",
      expect.anything(),
    );
    expect(vault.modifyEntityField).not.toHaveBeenCalledWith(
      { id: "annotation-1", type: "Annotation" },
      "target",
      expect.anything(),
    );
  });

  test("updates and exports an inline normalized SpecificResource", () => {
    const vault = new Vault();
    const canvasId = "https://example.org/canvas";
    const manifest = {
      id: "https://example.org/manifest",
      type: "Manifest",
      label: { en: ["Crop test"] },
      items: [
        {
          id: canvasId,
          type: "Canvas",
          width: 1000,
          height: 1000,
          items: [
            {
              id: "https://example.org/page",
              type: "AnnotationPage",
              items: [fixture({ target: `${canvasId}#xywh=0,0,1000,1000` })],
            },
          ],
        },
      ],
    };
    vault.loadManifestSync(manifest.id, manifest as any);
    const annotation = vault.get<any>({
      id: "annotation-1",
      type: "Annotation",
    });
    const canvas = vault.get<any>({
      id: canvasId,
      type: "Canvas",
    });
    const crop = getEditableImageCrop(
      annotation,
      (resource) =>
        vault.get(resource, {
          preserveSpecificResources: true,
          skipSelfReturn: false,
        } as any) || resource,
    );
    expect(crop?.source.type).toBe("Image");

    applyImageCrop(vault, crop!, canvas, {
      x: 40,
      y: 50,
      width: 600,
      height: 300,
    });

    const exported = vault.toPresentation3<any>({
      id: manifest.id,
      type: "Manifest",
    });
    expect(exported.items[0]).toMatchObject({ width: 300, height: 600 });
    expect(exported.items[0].thumbnail[0]).toMatchObject({ width: 256, height: 512 });
    expect(exported.items[0].items[0].items[0].target).toBe(canvasId);
    expect(exported.items[0].items[0].items[0].body).toMatchObject({
      type: "SpecificResource",
      selector: {
        type: "ImageApiSelector",
        region: "40,50,600,300",
        rotation: "90",
      },
      source: {
        id: expect.stringContaining("/40,50,600,300/max/90/default.jpg"),
        width: 300,
        height: 600,
      },
    });
  });

  test("rotates and exports an uncropped image", () => {
    const vault = new Vault();
    const canvasId = "https://example.org/full-image-canvas";
    const image = fixture().body[0].source;
    const manifest = {
      id: "https://example.org/full-image-manifest",
      type: "Manifest",
      label: { en: ["Rotation test"] },
      items: [
        {
          id: canvasId,
          type: "Canvas",
          width: 2000,
          height: 1500,
          items: [
            {
              id: "https://example.org/full-image-page",
              type: "AnnotationPage",
              items: [fixture({ body: [image], target: canvasId })],
            },
          ],
        },
      ],
    };
    vault.loadManifestSync(manifest.id, manifest as any);
    const annotation = vault.get<any>({ id: "annotation-1", type: "Annotation" });
    const canvas = vault.get<any>({ id: canvasId, type: "Canvas" });
    const crop = getImageCropContext(
      annotation,
      (resource) =>
        vault.get(resource, {
          preserveSpecificResources: true,
          skipSelfReturn: false,
        } as any) || resource,
    );

    applyImageRotation(vault, crop!, canvas, 90);

    const exported = vault.toPresentation3<any>({
      id: manifest.id,
      type: "Manifest",
    });
    expect(exported.items[0]).toMatchObject({ width: 1500, height: 2000 });
    expect(exported.items[0].items[0].items[0].body).toMatchObject({
      type: "SpecificResource",
      selector: {
        type: "ImageApiSelector",
        rotation: "90",
      },
      source: {
        id: expect.stringContaining("/full/max/90/default.jpg"),
        width: 1500,
        height: 2000,
      },
    });
  });
});
