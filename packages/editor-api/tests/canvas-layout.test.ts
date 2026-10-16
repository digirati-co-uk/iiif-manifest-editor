import { describe, expect, test } from "vitest";
import { Vault } from "@iiif/helpers/vault";
import {
  canvasLayouts,
  expandedCanvasBounds,
  fitWithinBounds,
  layoutSlotToPixels,
  resizeWithAspectRatio,
  resizeCanvasEdge,
  resizeCanvasHandle,
} from "../src/canvas-layout/geometry";
import {
  captureCanvasComposition,
  restoreCanvasComposition,
  applyCanvasLayout,
  targetPaintingImageRegion,
  switchToSingleImage,
  clearCanvasPlaceholders,
  canResizeCanvas,
  getCanvasLayout,
  getCanvasOrigin,
  getEmptyCanvasPlaceholders,
  getPaintingImages,
  movePaintingImage,
  resizeCanvas,
} from "../src/canvas-layout/layout";
import { Creator } from "../../creator-api/src/Creator";
import { placeCreatedResources } from "../../creator-api/src/placeholder-position";

import { canvasBackground, canvasWorkspaceBackground } from "../src/canvas-layout/colors";

const canvasId = "https://example.org/canvas";
async function fixture(count = 2, whole = false) {
  const vault = new Vault();
  const canvas = await vault.loadManifest("https://example.org/manifest", {
    id: "https://example.org/manifest",
    type: "Manifest",
    items: [
      {
        id: canvasId,
        type: "Canvas",
        width: 1200,
        height: 800,
        items: [
          {
            id: `${canvasId}/page`,
            type: "AnnotationPage",
            items: Array.from({ length: count }, (_, i) => ({
              id: `${canvasId}/a${i}`,
              type: "Annotation",
              motivation: "painting",
              target: whole ? canvasId : `${canvasId}#xywh=${i * 500},100,400,300`,
              body: {
                id: `https://example.org/${i}.jpg`,
                type: "Image",
                width: 800,
                height: 600,
                format: "image/jpeg",
              },
            })),
          },
        ],
      },
    ],
  });
  return { vault, canvas: vault.get(canvas.items[0]!) };
}

describe("canvas layout geometry", () => {
  test("templates stop at six and include overlapping regions", () => {
    expect(canvasLayouts.every((layout) => layout.slots.length <= 6)).toBe(true);
    const pair = canvasLayouts.find((layout) => layout.id === "offset-pair")!.slots;
    expect(pair[0]!.x + pair[0]!.width).toBeGreaterThan(pair[1]!.x);
    expect(pair[0]!.y + pair[0]!.height).toBeGreaterThan(pair[1]!.y);
  });
  test("corner resize anchors the opposite corner and optionally unlocks proportions", () => {
    const size = { width: 1200, height: 800 };
    expect(resizeCanvasHandle(size, "top-left", -300, -10)).toEqual({ x: -300, y: -200, width: 1500, height: 1000 });
    expect(resizeCanvasHandle(size, "top-left", -300, -10, false)).toEqual({
      x: -300,
      y: -10,
      width: 1500,
      height: 810,
    });
    expect(resizeCanvasHandle(size, "bottom-right", 300, 0)).toEqual({ x: 0, y: 0, width: 1500, height: 1000 });
  });
  test("resizes accumulate origin translations for viewport compensation", async () => {
    const { vault, canvas } = await fixture();
    resizeCanvas(vault, canvas, { x: -100, y: -50, width: 1300, height: 850 });
    expect(getCanvasOrigin(vault, canvas.id)).toEqual({ x: 100, y: 50 });
    resizeCanvas(vault, vault.get(canvas), { x: 30, y: 0, width: 1270, height: 850 });
    expect(getCanvasOrigin(vault, canvas.id)).toEqual({ x: 70, y: 50 });
  });
  test("edge resizing fixes the opposite edge and never inverts the surface", () => {
    const size = { width: 1200, height: 800 };
    expect(resizeCanvasEdge(size, "left", -100)).toEqual({ x: -100, y: 0, width: 1300, height: 800 });
    expect(resizeCanvasEdge(size, "bottom", -100)).toEqual({ x: 0, y: 0, width: 1200, height: 700 });
    expect(resizeCanvasEdge(size, "top", 900)).toEqual({ x: 0, y: 799, width: 1200, height: 1 });
  });
  test("fits and centres wide and tall images without cropping", () => {
    expect(fitWithinBounds({ width: 2000, height: 1000 }, { x: 50, y: 100, width: 400, height: 400 })).toEqual({
      x: 50,
      y: 200,
      width: 400,
      height: 200,
    });
    expect(fitWithinBounds({ width: 1000, height: 2000 }, { x: 50, y: 100, width: 400, height: 400 })).toEqual({
      x: 150,
      y: 100,
      width: 200,
      height: 400,
    });
  });
  test("rejects invalid dimensions", () => {
    expect(() => fitWithinBounds({ width: 0, height: 100 }, { x: 0, y: 0, width: 100, height: 100 })).toThrow();
    expect(() => fitWithinBounds({ width: Infinity, height: 100 }, { x: 0, y: 0, width: 100, height: 100 })).toThrow();
  });
  test("templates scale independently of pixels", () => {
    expect(layoutSlotToPixels({ x: 0.1, y: 0.25, width: 0.4, height: 0.5 }, { width: 3000, height: 2000 })).toEqual({
      x: 300,
      y: 500,
      width: 1200,
      height: 1000,
    });
    for (const layout of canvasLayouts)
      for (const slot of layout.slots) {
        expect(slot.x).toBeGreaterThanOrEqual(0);
        expect(slot.y).toBeGreaterThanOrEqual(0);
        expect(slot.x + slot.width).toBeLessThanOrEqual(1);
        expect(slot.y + slot.height).toBeLessThanOrEqual(1);
      }
  });
  test("growth includes all four edges and rounds outwards", () => {
    expect(
      expandedCanvasBounds({ width: 1000, height: 800 }, [{ x: -50.2, y: -30.2, width: 1200.5, height: 950.5 }])
    ).toEqual({ x: -51, y: -31, width: 1202, height: 952 });
  });
  test("aspect locking works in both directions and rejects invalid edits", () => {
    const size = { width: 1200, height: 800 };
    expect(resizeWithAspectRatio(size, "width", 600, true)).toEqual({ width: 600, height: 400 });
    expect(resizeWithAspectRatio(size, "height", 400, true)).toEqual({ width: 600, height: 400 });
    expect(resizeWithAspectRatio(size, "height", 400, false)).toEqual({ width: 1200, height: 400 });
    expect(resizeWithAspectRatio(size, "width", NaN, true)).toEqual(size);
  });
});

describe("canvas layout operations", () => {
  test("multiple results share a placeholder until all of them are removed", async () => {
    const { vault, canvas } = await fixture();
    applyCanvasLayout(
      vault,
      canvas,
      canvasLayouts.find((l) => l.id === "feature-left")!
    );
    const slot = getEmptyCanvasPlaceholders(vault, canvas)[0]!;
    placeCreatedResources(vault, getPaintingImages(vault, canvas), {
      targetType: "Annotation",
      placeholderPosition: { canvasId, placeholderId: slot.id, bounds: { x: 0, y: 0, width: 800, height: 400 } },
    });
    expect(vault.get(`${canvasId}/a0`).target.selector.value).toBe("xywh=0,50,400,300");
    expect(vault.get(`${canvasId}/a1`).target.selector.value).toBe("xywh=400,50,400,300");
    const page = vault.get(canvas.items[0]!);
    vault.modifyEntityField(page, "items", page.items.slice(1));
    expect(getEmptyCanvasPlaceholders(vault, canvas).some((s) => s.id === slot.id)).toBe(false);
    vault.modifyEntityField(page, "items", []);
    expect(getEmptyCanvasPlaceholders(vault, canvas).some((s) => s.id === slot.id)).toBe(true);
  });
  test("placement retargets resources and supplies bounds for bodies without dimensions", async () => {
    const { vault, canvas } = await fixture(0);
    const annotation = await vault.load(`${canvasId}/text`, {
      id: `${canvasId}/text`,
      type: "Annotation",
      motivation: "painting",
      target: "https://example.org/other",
      body: { type: "TextualBody", value: "A caption" },
    });
    placeCreatedResources(vault, annotation, {
      targetType: "Annotation",
      placeholderPosition: { canvasId, bounds: { x: 10, y: 20, width: 300, height: 200 } },
    });
    expect(vault.get(annotation).target.source.id).toBe(canvas.id);
    expect(vault.get(annotation).target.selector.value).toBe("xywh=10,20,300,200");
  });
  test("applies compatible layouts, leaves empty slots in meta and exports only IIIF", async () => {
    const { vault, canvas } = await fixture();
    applyCanvasLayout(
      vault,
      canvas,
      canvasLayouts.find((l) => l.id === "feature-left")!
    );
    expect(getEmptyCanvasPlaceholders(vault, canvas)).toHaveLength(1);
    expect(getCanvasLayout(vault, canvas.id)?.slots[0]?.annotationIds).toEqual([`${canvasId}/a0`]);
    expect(
      JSON.stringify(vault.toPresentation3({ id: "https://example.org/manifest", type: "Manifest" }))
    ).not.toContain("canvas-layout");
    expect(() =>
      applyCanvasLayout(
        vault,
        canvas,
        canvasLayouts.find((l) => l.id === "blank")!
      )
    ).toThrow();
  });
  test("a removed image makes its slot available again", async () => {
    const { vault, canvas } = await fixture();
    applyCanvasLayout(vault, canvas, canvasLayouts[0]!);
    const page = vault.get(canvas.items[0]!);
    vault.modifyEntityField(page, "items", page.items.slice(1));
    expect(getEmptyCanvasPlaceholders(vault, canvas)).toHaveLength(1);
  });
  test("moving beyond top and left grows the canvas and translates the other image", async () => {
    const { vault, canvas } = await fixture();
    movePaintingImage(vault, canvas, `${canvasId}/a0`, { x: -100, y: -50, width: 400, height: 300 });
    expect(vault.get(canvas).width).toBe(1300);
    expect(vault.get(canvas).height).toBe(850);
    expect(vault.get(`${canvasId}/a0`).target.selector.value).toBe("xywh=0,0,400,300");
    expect(vault.get(`${canvasId}/a1`).target.selector.value).toBe("xywh=600,150,400,300");
  });
  test("surface resize preserves image size and empty slot position", async () => {
    const { vault, canvas } = await fixture(1);
    applyCanvasLayout(vault, canvas, canvasLayouts[0]!);
    const before = vault.get(`${canvasId}/a0`).target;
    const slot = getEmptyCanvasPlaceholders(vault, canvas)[0]!;
    resizeCanvas(vault, canvas, { x: 0, y: 0, width: 2400, height: 1600 });
    expect(vault.get(`${canvasId}/a0`).target).toEqual(before);
    expect(
      layoutSlotToPixels(getEmptyCanvasPlaceholders(vault, vault.get(canvas))[0]!.bounds, vault.get(canvas))
    ).toEqual(layoutSlotToPixels(slot.bounds, canvas));
  });
  test("single whole-canvas image cannot resize until given a layout", async () => {
    const { vault, canvas } = await fixture(1, true);
    expect(canResizeCanvas(vault, canvas)).toBe(false);
    applyCanvasLayout(vault, canvas, canvasLayouts[0]!);
    expect(canResizeCanvas(vault, canvas)).toBe(true);
  });
  test("growth preserves annotation references and temporal target fragments", async () => {
    const { vault, canvas } = await fixture();
    const page = await vault.load(`${canvasId}/notes`, {
      id: `${canvasId}/notes`,
      type: "AnnotationPage",
      items: [
        {
          id: `${canvasId}/note`,
          type: "Annotation",
          motivation: "describing",
          target: { id: `${canvasId}/a0`, type: "Annotation" },
          body: { type: "TextualBody", value: "Caption" },
        },
        {
          id: `${canvasId}/timed`,
          type: "Annotation",
          motivation: "commenting",
          target: `${canvasId}#xywh=10,20,30,40&t=1,5`,
          body: { type: "TextualBody", value: "Timed note" },
        },
      ],
    });
    vault.modifyEntityField(canvas, "annotations", [{ id: page.id, type: "AnnotationPage" }]);
    const originalTarget = vault.get(`${canvasId}/note`).target;
    movePaintingImage(vault, vault.get(canvas), `${canvasId}/a0`, { x: -100, y: -50, width: 400, height: 300 });
    expect(vault.get(`${canvasId}/note`).target).toEqual(originalTarget);
    expect(vault.get(`${canvasId}/timed`).target.selector.value).toBe("xywh=110,70,30,40&t=1,5");
  });
  test("percentage targets keep their pixel position during surface resizing", async () => {
    const { vault, canvas } = await fixture();
    vault.modifyEntityField({ id: `${canvasId}/a0`, type: "Annotation" }, "target", {
      type: "SpecificResource",
      source: { id: canvasId, type: "Canvas" },
      selector: { type: "FragmentSelector", value: "xywh=percent:10,20,30,40" },
    });
    resizeCanvas(vault, canvas, { x: 0, y: 0, width: 2400, height: 1600 });
    expect(vault.get(`${canvasId}/a0`).target.selector.value).toBe("xywh=120,160,360,320");
  });
  test("creator placement consumes its slot, respects aspect ratio, and skips automatic canvas layout side effects", async () => {
    const { vault, canvas } = await fixture(0);
    applyCanvasLayout(vault, canvas, canvasLayouts[0]!);
    const slot = getEmptyCanvasPlaceholders(vault, canvas)[0]!;
    let sideEffect = false;
    const creator = new Creator(vault, [
      {
        id: "image",
        label: "Image",
        resourceType: "Annotation",
        resourceFields: [],
        supports: {},
        create: (_, ctx) =>
          ctx.embed({
            id: `${canvasId}/new`,
            type: "Annotation",
            motivation: "painting",
            target: ctx.getTarget(),
            body: [{ id: "https://example.org/new.jpg", type: "Image", width: 800, height: 400 }],
          }),
        sideEffects: [
          {
            spatial: true,
            canvasInteraction: true,
            run: () => {
              sideEffect = true;
            },
          },
        ],
      },
    ]);
    await creator.create(
      "image",
      {},
      {
        targetType: "Annotation",
        target: canvas,
        parent: { resource: canvas.items[0]!, property: "items" },
        placeholderPosition: { canvasId, bounds: { x: 50, y: 50, width: 400, height: 400 }, placeholderId: slot.id },
      }
    );
    expect(sideEffect).toBe(false);
    expect(vault.get(`${canvasId}/new`).target.selector.value).toBe("xywh=50,150,400,200");
    expect(getEmptyCanvasPlaceholders(vault, canvas)).toHaveLength(1);
    expect(getPaintingImages(vault, canvas)).toHaveLength(1);
    expect(vault.get(canvas).width).toBe(1200);
  });
});

describe("image canvas modes and colours", () => {
  test("a single image can make the round trip without changing its source", async () => {
    const { vault, canvas } = await fixture(1, true);
    const image = getPaintingImages(vault, canvas)[0]!;
    expect(canResizeCanvas(vault, canvas)).toBe(false);
    targetPaintingImageRegion(vault, canvas, image.id);
    expect(canResizeCanvas(vault, vault.get(canvas))).toBe(true);
    const target = vault.get(image).target as any;
    expect(target.selector.value).toBe("xywh=280,160,640,480");
    applyCanvasLayout(vault, vault.get(canvas), canvasLayouts[0]!);
    expect(getEmptyCanvasPlaceholders(vault, vault.get(canvas))).toHaveLength(1);
    expect(switchToSingleImage(vault, vault.get(canvas))).toBe(true);
    const next = vault.get(canvas);
    expect([next.width, next.height]).toEqual([800, 600]);
    expect((vault.get(image).target as any).selector).toBeUndefined();
    expect(getEmptyCanvasPlaceholders(vault, next)).toHaveLength(0);
    expect(vault.get(image).body).toEqual(image.body);
  });
  test("clearing empty placeholders preserves painted images and refuses destructive single-image conversion", async () => {
    const { vault, canvas } = await fixture(2);
    applyCanvasLayout(
      vault,
      canvas,
      canvasLayouts.find((layout) => layout.id === "feature-left")!
    );
    const before = getPaintingImages(vault, canvas).map((image) => image.target);
    clearCanvasPlaceholders(vault, canvas);
    expect(getEmptyCanvasPlaceholders(vault, canvas)).toHaveLength(0);
    expect(getPaintingImages(vault, canvas).map((image) => image.target)).toEqual(before);
    expect(switchToSingleImage(vault, canvas)).toBe(false);
  });
  test("workspace colours contrast with light and dark canvases", () => {
    expect(canvasBackground("#AbC")).toBe("#aabbcc");
    expect(canvasBackground("invalid")).toBe("#ffffff");
    expect(canvasWorkspaceBackground("#ffffff")).toBe("#dbdbdb");
    expect(canvasWorkspaceBackground("#000000")).toBe("#292929");
    expect(canvasWorkspaceBackground("#aaccdd")).toBe("#92afbe");
  });
});

test("discard restores dimensions, targets, placeholders and origin without changing other fields", async () => {
  const { vault, canvas } = await fixture();
  applyCanvasLayout(
    vault,
    canvas,
    canvasLayouts.find((layout) => layout.id === "feature-left")!
  );
  const original = captureCanvasComposition(vault, vault.get(canvas));
  movePaintingImage(vault, vault.get(canvas), `${canvasId}/a0`, { x: -300, y: -200, width: 1000, height: 900 });
  resizeCanvas(vault, vault.get(canvas), { x: 0, y: 0, width: 2000, height: 1400 });
  vault.modifyEntityField(canvas, "backgroundColor", "#abcdef");
  restoreCanvasComposition(vault, canvas.id, original);
  expect(captureCanvasComposition(vault, vault.get(canvas))).toEqual(original);
  expect(vault.get(canvas).backgroundColor).toBe("#abcdef");
});
