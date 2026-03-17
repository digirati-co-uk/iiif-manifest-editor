import { describe, expect, it } from "vitest";
import { invokeTool } from "../runtime/registry";
import { createFixtureRuntime, getEntity } from "./helpers";

function getItemId(item: any) {
  return item?.id || item?.source?.id || item?.partOf?.id;
}

describe("manifest workflow tools", () => {
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

    const topLevelResult = await invokeTool(runtime, "me_create_top_level_range", {});
    expect(topLevelResult.ok).toBe(true);

    const manifest = getEntity<any>(vault, refs.manifest);
    const outerRangeRef = {
      id: manifest.structures[0].id,
      type: "Range" as const,
    };
    const outerRange = getEntity<any>(vault, outerRangeRef);
    const innerRangeRef = {
      id: outerRange.items[0].id,
      type: "Range" as const,
    };

    const nestedRangeResult = await invokeTool(runtime, "me_create_nested_range", {
      parentRange: innerRangeRef,
      label: { en: ["Details"] },
    });

    expect(nestedRangeResult.ok).toBe(true);
    if (!nestedRangeResult.ok) {
      return;
    }

    const nestedRangeRef = nestedRangeResult.createdRefs[0]!;

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

    const topLevelResult = await invokeTool(runtime, "me_create_top_level_range", {});
    expect(topLevelResult.ok).toBe(true);

    const manifest = getEntity<any>(vault, refs.manifest);
    const outerRangeRef = {
      id: manifest.structures[0].id,
      type: "Range" as const,
    };
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
});
