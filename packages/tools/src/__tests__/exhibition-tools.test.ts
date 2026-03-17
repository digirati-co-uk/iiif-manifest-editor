import { describe, expect, it } from "vitest";
import { invokeTool } from "../runtime/registry";
import { createFixtureRuntime, exhibitionToolCreators, getEntity } from "./helpers";

describe("exhibition workflow tools", () => {
  it("creates exhibition slides and updates layout tokens without dropping info behavior", async () => {
    const { runtime, vault } = createFixtureRuntime({
      creators: exhibitionToolCreators,
    });

    const slideResult = await invokeTool(runtime, "me_create_exhibition_slide", {
      kind: "info_box",
      payload: {
        label: { en: ["Info slide"] },
      },
    });

    expect(slideResult.ok).toBe(true);
    if (!slideResult.ok) {
      return;
    }

    const canvasRef = slideResult.createdRefs[0]!;

    const layoutResult = await invokeTool(runtime, "me_update_exhibition_layout", {
      canvas: canvasRef,
      layout: "right",
      floating: "float-top-left",
      grid: {
        width: 6,
        height: 7,
      },
    });

    expect(layoutResult.ok).toBe(true);

    const canvas = getEntity<any>(vault, canvasRef);
    expect(canvas.behavior).toContain("info");
    expect(canvas.behavior).toContain("right");
    expect(canvas.behavior).toContain("float-top-left");
    expect(canvas.behavior).toContain("w-6");
    expect(canvas.behavior).toContain("h-7");
    expect(canvas.behavior).not.toContain("w-4");
  });

  it("creates tour pages idempotently", async () => {
    const { runtime, refs } = createFixtureRuntime({
      creators: exhibitionToolCreators,
    });

    const firstResult = await invokeTool(runtime, "me_create_exhibition_tour", {
      canvas: refs.canvas1,
    });

    expect(firstResult.ok).toBe(true);
    if (!firstResult.ok) {
      return;
    }

    const secondResult = await invokeTool(runtime, "me_create_exhibition_tour", {
      canvas: refs.canvas1,
    });

    expect(secondResult.ok).toBe(true);
    if (!secondResult.ok) {
      return;
    }

    expect(firstResult.createdRefs).toHaveLength(1);
    expect(secondResult.createdRefs).toHaveLength(0);
    expect(secondResult.warnings[0]).toContain("annotation page for tour steps");
  });

  it("creates and reorders exhibition tour steps", async () => {
    const { runtime, vault, refs } = createFixtureRuntime({
      creators: exhibitionToolCreators,
    });

    const firstStep = await invokeTool(runtime, "me_create_exhibition_tour_step", {
      canvas: refs.canvas1,
      payload: {
        body: { en: ["<h2>Step One</h2>"] },
      },
      selector: {
        type: "xywh",
        x: 1,
        y: 2,
        width: 30,
        height: 40,
      },
    });

    expect(firstStep.ok).toBe(true);
    if (!firstStep.ok) {
      return;
    }

    const annotationPage = (firstStep.data as { annotationPage?: { id: string; type: string } } | undefined)
      ?.annotationPage;
    const firstAnnotation = firstStep.createdRefs.find((ref) => ref.type === "Annotation");
    expect(annotationPage).toBeDefined();
    expect(firstAnnotation).toBeDefined();

    const secondStep = await invokeTool(runtime, "me_create_exhibition_tour_step", {
      canvas: refs.canvas1,
      annotationPage,
      payload: {
        body: { en: ["<h2>Step Two</h2>"] },
      },
    });

    expect(secondStep.ok).toBe(true);

    const beforeReorder = getEntity<any>(vault, annotationPage!);
    const secondAnnotationId = beforeReorder.items[1].id;

    const reorderResult = await invokeTool(runtime, "me_reorder_exhibition_tour_steps", {
      canvas: refs.canvas1,
      annotationPage,
      startIndex: 0,
      endIndex: 1,
    });

    expect(reorderResult.ok).toBe(true);

    const page = getEntity<any>(vault, annotationPage!);
    const firstAnnotationEntity = getEntity<any>(vault, firstAnnotation!);

    expect(page.items).toHaveLength(2);
    expect(page.items[0].id).toBe(secondAnnotationId);
    expect(firstAnnotationEntity.motivation).toBe("tagging");
    expect(firstAnnotationEntity.target.selector.value).toBe("xywh=1,2,30,40");

    const exported = vault.toPresentation3(refs.manifest as any) as any;
    expect(exported.items[0].annotations).toHaveLength(1);
  });
});
