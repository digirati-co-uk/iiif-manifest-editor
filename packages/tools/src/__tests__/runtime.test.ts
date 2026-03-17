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
    };

    expect(capabilities.workflowTools).toContain("me_create_annotation_page");
    expect(capabilities.workflowTools).toContain("me_create_exhibition_tour_step");
    expect(capabilities.creatorIds).toContain("@manifest-editor/empty-annotation-page");
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
});
