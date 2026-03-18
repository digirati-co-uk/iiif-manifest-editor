import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createFixtureRuntime,
  exhibitionToolCreators,
  getEntity,
  manifestToolCreatorsWithImageServices,
} from "./tool-fixtures";

describe("openrouter tool regressions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes only default tools to the model", () => {
    const { tools } = createFixtureRuntime();

    expect(tools.me_get_resource_capabilities).toBeDefined();
    expect(tools.me_update_metadata).toBeDefined();
    expect(tools.me_create_resource).toBeUndefined();
    expect(tools.me_add_reference).toBeUndefined();
    expect(tools.me_remove_reference).toBeUndefined();
    expect(tools.me_reorder_references).toBeUndefined();
  });

  it("returns capability guidance that distinguishes default and fallback editing paths", async () => {
    const { tools, refs } = createFixtureRuntime();

    const result = await tools.me_get_resource_capabilities.execute({
      resource: refs.manifest,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data?.defaultTools).toContain("me_create_canvas");
    expect(result.data?.defaultTools).toContain("me_update_metadata");
    expect(result.data?.fallbackTools).toContain("me_create_resource");
    expect(result.data?.propertyEditors?.metadata?.editorType).toBe("metadataList");
    expect(result.data?.propertyEditors?.label?.editorType).toBe("singleValue");
    expect(result.data?.fallbackPolicy).toContain("fallback");
  });

  it("creates a canvas from an IIIF image service URL through the default tool set", async () => {
    const { tools, vault, refs } = createFixtureRuntime({
      creators: manifestToolCreatorsWithImageServices,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "https://example.org/iiif/image-1",
        type: "ImageService3",
        width: 1800,
        height: 2400,
        sizes: [{ width: 400, height: 533 }],
      }),
    } as Response);

    const result = await tools.me_create_canvas.execute({
      manifest: refs.manifest,
      kind: "image_service",
      payload: {
        url: "https://example.org/iiif/image-1/info.json",
        label: { en: ["Page 1"] },
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const canvas = getEntity<any>(vault, result.data?.primaryRef);
    expect(result.data?.primaryRef?.type).toBe("Canvas");
    expect(result.data?.normalizedInput?.kind).toBe("image_service");
    expect(canvas.width).toBe(1800);
    expect(canvas.height).toBe(2400);
  });

  it("builds nested ranges without duplicating canvases in the parent range", async () => {
    const { tools, vault, refs } = createFixtureRuntime();

    const topLevel = await tools.me_create_top_level_range.execute({
      manifest: refs.manifest,
      topLevelLabel: { en: ["Contents"] },
      includeInitialChild: false,
    });

    expect(topLevel.ok).toBe(true);
    if (!topLevel.ok) {
      return;
    }

    const topLevelRange = topLevel.data?.topLevelRange;
    expect(topLevelRange?.type).toBe("Range");

    const coverPages = await tools.me_create_nested_range.execute({
      parentRange: topLevelRange,
      label: { en: ["Cover pages"] },
      items: [refs.canvas1],
    });
    const pages = await tools.me_create_nested_range.execute({
      parentRange: topLevelRange,
      label: { en: ["Pages"] },
      items: [refs.canvas2],
    });

    expect(coverPages.ok).toBe(true);
    expect(pages.ok).toBe(true);

    const refreshedTopLevel = getEntity<any>(vault, topLevelRange!);
    expect(refreshedTopLevel.items).toHaveLength(2);
    expect(refreshedTopLevel.items.every((item: any) => item.type === "Range")).toBe(true);
  });

  it("adds metadata entries in a single metadata call", async () => {
    const { tools, refs } = createFixtureRuntime();

    const result = await tools.me_update_metadata.execute({
      resource: refs.manifest,
      patches: [
        { type: "add", label: "Test field 1", value: "Sample value 1" },
        { type: "add", label: "Test field 2", value: "Sample value 2" },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data?.normalizedInput?.patches).toHaveLength(2);
    expect(result.data?.metadataCount).toBe(2);
  });

  it("supports exhibition slide and tour workflows with default tools", async () => {
    const { tools, refs } = createFixtureRuntime({
      creators: exhibitionToolCreators,
    });

    const slide = await tools.me_create_exhibition_slide.execute({
      manifest: refs.manifest,
      kind: "info_box",
      payload: {
        label: { en: ["Intro"] },
      },
    });

    expect(slide.ok).toBe(true);
    if (!slide.ok) {
      return;
    }

    const tourStep = await tools.me_create_exhibition_tour_step.execute({
      canvas: slide.data?.primaryRef,
      payload: {
        body: { en: ["<h2>Welcome</h2><p>Intro</p>"] },
      },
    });

    expect(tourStep.ok).toBe(true);
    if (!tourStep.ok) {
      return;
    }

    expect(tourStep.data?.annotationPage?.type).toBe("AnnotationPage");
    expect(tourStep.data?.primaryRef?.type).toBe("Annotation");
  });

  it("returns structured validation failures that a model can recover from", async () => {
    const { tools, refs } = createFixtureRuntime();

    const failure = await tools.me_update_metadata.execute({
      resource: refs.manifest,
      patches: [],
    });

    expect(failure.ok).toBe(false);
    if (failure.ok) {
      return;
    }

    expect(failure.error.code).toBe("INVALID_INPUT");
    expect(Array.isArray((failure.error.details as any)?.issues)).toBe(true);

    const success = await tools.me_update_metadata.execute({
      resource: refs.manifest,
      patches: [{ type: "add", label: "Test field", value: "Sample value" }],
    });

    expect(success.ok).toBe(true);
  });
});
