import { describe, expect, it } from "vitest";
import { invokeTool } from "../runtime/registry";
import { createFixtureRuntime, exhibitionToolCreators } from "./helpers";

describe("tool runtime", () => {
  it("builds exhibition tools when exhibition creators are available", () => {
    const { runtime } = createFixtureRuntime({
      creators: exhibitionToolCreators,
    });

    expect(runtime.mode).toBe("exhibition");
    expect(runtime.registry.some((tool) => tool.name === "me_create_exhibition_slide")).toBe(true);
  });

  it("reports capabilities including creator ids and curated workflow tools", async () => {
    const { runtime, refs } = createFixtureRuntime({
      creators: exhibitionToolCreators,
    });

    const result = await invokeTool(runtime, "me_get_resource_capabilities", {
      resource: refs.canvas1,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const capabilities = result.data as {
      workflowTools: string[];
      creatorIds: string[];
      typeDocumentation: { link: string; summary: string } | null;
      propertyDocumentation: Record<string, { category: string; status: string; link: string | null }>;
      workflowHints: Array<{ toolName: string; title: string }>;
    };

    expect(capabilities.workflowTools).toContain("me_create_annotation_page");
    expect(capabilities.workflowTools).toContain("me_create_exhibition_tour_step");
    expect(capabilities.creatorIds).toContain("@manifest-editor/empty-annotation-page");
    expect(capabilities.typeDocumentation?.link).toContain("#overview-canvas");
    expect(capabilities.propertyDocumentation.items?.category).toBe("structural");
    expect(capabilities.propertyDocumentation.items?.status).toBe("recommended");
    expect(capabilities.workflowHints.some((hint) => hint.toolName === "me_create_annotation")).toBe(true);
  });

  it("maps ambiguous creator matches to a stable error code", async () => {
    const { runtime, refs } = createFixtureRuntime({
      creators: exhibitionToolCreators,
    });

    const result = await invokeTool(runtime, "me_create_resource", {
      parent: refs.manifest,
      property: "items",
      targetType: "Canvas",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.error.code).toBe("AMBIGUOUS_MATCH");
    expect((result.error.details as { matches?: unknown[] } | undefined)?.matches?.length).toBeGreaterThan(1);
  });

  it("describes range workflows that avoid duplicate items in parent and child ranges", async () => {
    const { runtime, refs } = createFixtureRuntime();

    const topLevelResult = await invokeTool(runtime, "me_create_top_level_range", {
      includeInitialChild: false,
    });

    expect(topLevelResult.ok).toBe(true);
    if (!topLevelResult.ok) {
      return;
    }

    const rangeRef = topLevelResult.createdRefs[0]!;
    const result = await invokeTool(runtime, "me_get_resource_capabilities", {
      resource: rangeRef,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const capabilities = result.data as {
      workflowHints: Array<{ toolName: string; description: string }>;
    };

    expect(capabilities.workflowHints.some((hint) => hint.toolName === "me_create_nested_range")).toBe(true);
    expect(capabilities.workflowHints.some((hint) => hint.description.includes("me_move_range_items"))).toBe(true);
  });

  it("describes manifest metadata workflows for synthetic test data", async () => {
    const { runtime, refs } = createFixtureRuntime();

    const result = await invokeTool(runtime, "me_get_resource_capabilities", {
      resource: refs.manifest,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const capabilities = result.data as {
      listProperties: string[];
      workflowHints: Array<{ toolName: string; description: string }>;
    };

    expect(capabilities.listProperties).toContain("metadata");
    expect(capabilities.workflowHints.some((hint) => hint.toolName === "me_update_metadata")).toBe(true);
    expect(capabilities.workflowHints.some((hint) => hint.description.includes("sample metadata"))).toBe(true);
  });
});
