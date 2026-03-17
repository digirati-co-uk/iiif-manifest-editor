import { describe, expect, it } from "vitest";
import { invokeTool } from "../runtime/registry";
import { createFixtureRuntime, getEntity } from "./helpers";

describe("core tools", () => {
  it("updates resource properties and metadata through the editor api", async () => {
    const { runtime, vault, refs } = createFixtureRuntime();

    const propertyResult = await invokeTool(runtime, "me_update_resource_properties", {
      resource: refs.canvas1,
      patches: [
        { property: "label", value: "Frontispiece" },
        { property: "behavior", value: ["paged"] },
        {
          property: "navPlace",
          value: {
            type: "FeatureCollection",
            features: [],
          },
        },
      ],
    });

    expect(propertyResult.ok).toBe(true);

    const metadataResult = await invokeTool(runtime, "me_update_metadata", {
      resource: refs.canvas1,
      patches: [
        {
          type: "add",
          label: { en: ["Role"] },
          value: { en: ["Opening"] },
        },
      ],
    });

    expect(metadataResult.ok).toBe(true);

    const canvas = getEntity<any>(vault, refs.canvas1);
    expect(canvas.label.en[0]).toBe("Frontispiece");
    expect(canvas.behavior).toEqual(["paged"]);
    expect(canvas.navPlace.type).toBe("FeatureCollection");
    expect(canvas.metadata).toHaveLength(1);
    expect(canvas.metadata[0].label.en[0]).toBe("Role");
  });

  it("creates resources and mutates reference lists", async () => {
    const { runtime, vault, refs } = createFixtureRuntime();

    const createdPage = await invokeTool(runtime, "me_create_resource", {
      parent: refs.canvas1,
      property: "annotations",
      targetType: "AnnotationPage",
      creatorId: "@manifest-editor/empty-annotation-page",
      target: refs.canvas1,
      payload: {
        label: { en: ["Extra notes"] },
      },
    });

    expect(createdPage.ok).toBe(true);
    if (!createdPage.ok) {
      return;
    }

    const annotationPageRef = createdPage.createdRefs[0]!;

    const addResult = await invokeTool(runtime, "me_add_reference", {
      resource: refs.canvas2,
      property: "annotations",
      reference: annotationPageRef,
    });

    expect(addResult.ok).toBe(true);

    const reorderResult = await invokeTool(runtime, "me_reorder_references", {
      resource: refs.manifest,
      property: "items",
      startIndex: 0,
      endIndex: 1,
    });

    expect(reorderResult.ok).toBe(true);

    const removeResult = await invokeTool(runtime, "me_remove_reference", {
      resource: refs.canvas2,
      property: "annotations",
      reference: annotationPageRef,
    });

    expect(removeResult.ok).toBe(true);

    const manifest = getEntity<any>(vault, refs.manifest);
    const canvas2 = getEntity<any>(vault, refs.canvas2);
    const annotationPage = getEntity<any>(vault, annotationPageRef);

    expect(annotationPage.label.en[0]).toBe("Extra notes");
    expect(manifest.items[0].id).toBe(refs.canvas2.id);
    expect((canvas2.annotations || []).some((item: { id: string }) => item.id === annotationPageRef.id)).toBe(false);
  });
});
