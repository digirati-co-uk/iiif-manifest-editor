import { afterEach, describe, expect, it, vi } from "vitest";
import { invokeTool } from "../runtime/registry";
import {
  createFixtureRuntime,
  getEntity,
  manifestToolCreatorsWithImageServices,
} from "./helpers";

function getItemId(item: any) {
  return item?.id || item?.source?.id || item?.partOf?.id;
}

describe("manifest workflow tools", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates canvases, annotation pages, annotations, and selector targets", async () => {
    const { runtime, vault, refs } = createFixtureRuntime();

    const canvasResult = await invokeTool(runtime, "me_create_canvas", {
      payload: {
        label: { en: ["Inserted canvas"] },
        width: 1200,
        height: 900,
      },
    });

    expect(canvasResult.ok).toBe(true);
    if (!canvasResult.ok) {
      return;
    }

    const createdCanvas = canvasResult.createdRefs[0]!;

    const pageResult = await invokeTool(runtime, "me_create_annotation_page", {
      parent: createdCanvas,
      label: { en: ["Highlights"] },
    });

    expect(pageResult.ok).toBe(true);
    if (!pageResult.ok) {
      return;
    }

    const annotationPage = pageResult.createdRefs[0]!;

    const annotationResult = await invokeTool(runtime, "me_create_annotation", {
      annotationPage,
      targetCanvas: createdCanvas,
      kind: "html",
      payload: {
        body: { en: ["<p>Highlighted text</p>"] },
      },
      selector: {
        type: "xywh",
        x: 10,
        y: 20,
        width: 30,
        height: 40,
      },
    });

    expect(annotationResult.ok).toBe(true);
    if (!annotationResult.ok) {
      return;
    }

    const annotation = annotationResult.createdRefs.find((ref) => ref.type === "Annotation")!;
    let fullAnnotation = getEntity<any>(vault, annotation);
    expect(fullAnnotation.target.selector.value).toBe("xywh=10,20,30,40");

    const updateTarget = await invokeTool(runtime, "me_set_annotation_target", {
      annotation,
      targetCanvas: createdCanvas,
      selector: {
        type: "whole_canvas",
      },
    });

    expect(updateTarget.ok).toBe(true);

    fullAnnotation = getEntity<any>(vault, annotation);
    const manifest = getEntity<any>(vault, refs.manifest);
    expect(fullAnnotation.target.source.id).toBe(createdCanvas.id);
    expect(fullAnnotation.target.selector).toBeUndefined();
    expect(manifest.items).toHaveLength(3);
  });

  it("creates top-level and nested ranges and moves items between them", async () => {
    const { runtime, vault, refs } = createFixtureRuntime();
    const originalManifest = getEntity<any>(vault, refs.manifest);
    const originalManifestItemIds = originalManifest.items.map((item: any) => item.id);

    const topLevelResult = await invokeTool(runtime, "me_create_top_level_range", {});
    expect(topLevelResult.ok).toBe(true);
    if (!topLevelResult.ok) {
      return;
    }

    const manifest = getEntity<any>(vault, refs.manifest);
    expect(manifest.items.map((item: any) => item.id)).toEqual(originalManifestItemIds);
    const outerRangeRef = {
      id: manifest.structures[0].id,
      type: "Range" as const,
    };
    expect((topLevelResult.data as any).topLevelRange).toEqual(outerRangeRef);
    const outerRange = getEntity<any>(vault, outerRangeRef);
    const innerRangeRef = {
      id: outerRange.items[0].id,
      type: "Range" as const,
    };
    expect((topLevelResult.data as any).initialChildRange).toEqual(innerRangeRef);

    const nestedRangeResult = await invokeTool(runtime, "me_create_nested_range", {
      parentRange: innerRangeRef,
      label: { en: ["Details"] },
    });

    expect(nestedRangeResult.ok).toBe(true);
    if (!nestedRangeResult.ok) {
      return;
    }

    const nestedRangeRef = nestedRangeResult.createdRefs[0]!;
    const manifestAfterNestedRange = getEntity<any>(vault, refs.manifest);
    expect(manifestAfterNestedRange.items.map((item: any) => item.id)).toEqual(originalManifestItemIds);

    const moveResult = await invokeTool(runtime, "me_move_range_items", {
      sourceRange: innerRangeRef,
      targetRange: nestedRangeRef,
      items: [refs.canvas2],
    });

    expect(moveResult.ok).toBe(true);

    const innerRange = getEntity<any>(vault, innerRangeRef);
    const nestedRange = getEntity<any>(vault, nestedRangeRef);
    expect(innerRange.items.map((item: any) => getItemId(item))).toEqual([refs.canvas1.id, nestedRangeRef.id]);
    expect(nestedRange.items.map((item: any) => getItemId(item))).toEqual([refs.canvas2.id]);
  });

  it("splits and merges sibling ranges using the existing range workbench semantics", async () => {
    const { runtime, vault, refs } = createFixtureRuntime();
    const originalManifest = getEntity<any>(vault, refs.manifest);
    const originalManifestItemIds = originalManifest.items.map((item: any) => item.id);

    const topLevelResult = await invokeTool(runtime, "me_create_top_level_range", {});
    expect(topLevelResult.ok).toBe(true);
    if (!topLevelResult.ok) {
      return;
    }

    const manifest = getEntity<any>(vault, refs.manifest);
    expect(manifest.items.map((item: any) => item.id)).toEqual(originalManifestItemIds);
    const outerRangeRef = {
      id: manifest.structures[0].id,
      type: "Range" as const,
    };
    expect((topLevelResult.data as any).topLevelRange).toEqual(outerRangeRef);
    const outerRange = getEntity<any>(vault, outerRangeRef);
    const innerRangeRef = {
      id: outerRange.items[0].id,
      type: "Range" as const,
    };

    const splitResult = await invokeTool(runtime, "me_split_range", {
      range: innerRangeRef,
      item: refs.canvas2,
      label: { en: ["Second section"] },
    });

    expect(splitResult.ok).toBe(true);

    let refreshedOuter = getEntity<any>(vault, outerRangeRef);
    expect(refreshedOuter.items).toHaveLength(2);

    const splitRangeRef = {
      id: refreshedOuter.items[1].id,
      type: "Range" as const,
    };

    const mergeResult = await invokeTool(runtime, "me_merge_ranges", {
      sourceRange: splitRangeRef,
      targetRange: innerRangeRef,
    });

    expect(mergeResult.ok).toBe(true);

    refreshedOuter = getEntity<any>(vault, outerRangeRef);
    const mergedInner = getEntity<any>(vault, innerRangeRef);
    expect(refreshedOuter.items).toHaveLength(1);
    expect(mergedInner.items.map((item: any) => getItemId(item))).toEqual([refs.canvas1.id, refs.canvas2.id]);

    const exported = vault.toPresentation3(refs.manifest as any) as any;
    expect(exported.structures).toHaveLength(1);
  });

  it("creates an empty custom top-level range for nested hierarchies without direct canvas items", async () => {
    const { runtime, vault, refs } = createFixtureRuntime();

    const topLevelResult = await invokeTool(runtime, "me_create_top_level_range", {
      topLevelLabel: { en: ["Contents"] },
      includeInitialChild: false,
    });

    expect(topLevelResult.ok).toBe(true);
    if (!topLevelResult.ok) {
      return;
    }

    const topLevelRangeRef = topLevelResult.createdRefs[0]!;
    const topLevelRange = getEntity<any>(vault, topLevelRangeRef);
    expect(topLevelResult.createdRefs).toHaveLength(1);
    expect((topLevelResult.data as any).topLevelRange).toEqual(topLevelRangeRef);
    expect((topLevelResult.data as any).initialChildRange).toBeNull();
    expect(topLevelRange.items || []).toEqual([]);

    const coverPagesResult = await invokeTool(runtime, "me_create_nested_range", {
      parentRange: topLevelRangeRef,
      label: { en: ["Cover pages"] },
      items: [refs.canvas1],
    });

    const pagesResult = await invokeTool(runtime, "me_create_nested_range", {
      parentRange: topLevelRangeRef,
      label: { en: ["Pages"] },
      items: [refs.canvas2],
    });

    expect(coverPagesResult.ok).toBe(true);
    expect(pagesResult.ok).toBe(true);

    const refreshedTopLevelRange = getEntity<any>(vault, topLevelRangeRef);
    expect(refreshedTopLevelRange.items).toHaveLength(2);
    expect(refreshedTopLevelRange.items.every((item: any) => item.type === "Range")).toBe(true);
  });

  it("creates image service canvases from a minimal URL payload", async () => {
    const { runtime, vault, refs } = createFixtureRuntime({
      creators: manifestToolCreatorsWithImageServices,
    });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "https://example.org/iiif/image-1",
        type: "ImageService3",
        width: 1800,
        height: 2400,
        sizes: [{ width: 400, height: 533 }],
      }),
    } as Response);

    const result = await invokeTool(runtime, "me_create_canvas", {
      manifest: refs.manifest,
      kind: "image_service",
      payload: {
        url: "https://example.org/iiif/image-1/info.json",
        label: { en: ["Page from service"] },
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const createdCanvas = getEntity<any>(vault, result.createdRefs[0]!);
    expect(fetchSpy).toHaveBeenCalledWith("https://example.org/iiif/image-1/info.json");
    expect(createdCanvas.label).toEqual({ en: ["Page from service"] });
    expect(createdCanvas.width).toBe(1800);
    expect(createdCanvas.height).toBe(2400);
    expect(createdCanvas.thumbnail?.[0]?.id).toContain("/full/400,533/0/default.jpg");
  });

  it("accepts a top-level url alias for image service canvas creation", async () => {
    const { runtime, vault, refs } = createFixtureRuntime({
      creators: manifestToolCreatorsWithImageServices,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "https://example.org/iiif/image-alias",
        type: "ImageService3",
        width: 1200,
        height: 1600,
      }),
    } as Response);

    const result = await invokeTool(runtime, "me_create_canvas", {
      manifest: refs.manifest,
      kind: "image_service",
      url: "https://example.org/iiif/image-alias/info.json",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const createdCanvas = getEntity<any>(vault, result.createdRefs[0]!);
    expect(createdCanvas.width).toBe(1200);
    expect(createdCanvas.height).toBe(1600);
  });

  it("infers image_service kind when a service URL is provided without an explicit kind", async () => {
    const { runtime, vault, refs } = createFixtureRuntime({
      creators: manifestToolCreatorsWithImageServices,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "https://example.org/iiif/image-inferred",
        type: "ImageService3",
        width: 700,
        height: 900,
      }),
    } as Response);

    const result = await invokeTool(runtime, "me_create_canvas", {
      manifest: refs.manifest,
      url: "https://example.org/iiif/image-inferred/info.json",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const createdCanvas = getEntity<any>(vault, result.createdRefs[0]!);
    expect(createdCanvas.width).toBe(700);
    expect(createdCanvas.height).toBe(900);
  });

  it("creates image service canvases when a full service object is already provided", async () => {
    const { runtime, vault, refs } = createFixtureRuntime({
      creators: manifestToolCreatorsWithImageServices,
    });
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await invokeTool(runtime, "me_create_canvas", {
      manifest: refs.manifest,
      kind: "image_service",
      payload: {
        url: "https://example.org/iiif/image-2/info.json",
        label: { en: ["Provided service"] },
        service: {
          id: "https://example.org/iiif/image-2",
          type: "ImageService3",
          width: 900,
          height: 1100,
        },
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const createdCanvas = getEntity<any>(vault, result.createdRefs[0]!);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(createdCanvas.width).toBe(900);
    expect(createdCanvas.height).toBe(1100);
  });

  it("fails cleanly when an image service URL cannot be resolved", async () => {
    const { runtime, refs } = createFixtureRuntime({
      creators: manifestToolCreatorsWithImageServices,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    const result = await invokeTool(runtime, "me_create_canvas", {
      manifest: refs.manifest,
      kind: "image_service",
      payload: {
        url: "https://example.org/iiif/missing/info.json",
      },
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.error.message).toContain("Unable to fetch image service");
  });
});
