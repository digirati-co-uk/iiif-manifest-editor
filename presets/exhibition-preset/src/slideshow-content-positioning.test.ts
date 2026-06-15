import { describe, expect, test, vi } from "vitest";
import { repairSlideContentTargets } from "./slideshow-content-positioning";

describe("repairSlideContentTargets", () => {
  test("preserves layout-specific content regions when repairing bare canvas targets", () => {
    const canvas = {
      id: "https://example.org/canvas/1",
      type: "Canvas",
      width: 900,
      height: 600,
      behavior: ["left"],
      items: [
        { id: "https://example.org/canvas/1/page", type: "AnnotationPage" },
      ],
    };
    const page = {
      id: "https://example.org/canvas/1/page",
      type: "AnnotationPage",
      items: [
        { id: "https://example.org/canvas/1/annotation", type: "Annotation" },
      ],
    };
    const annotation = {
      id: "https://example.org/canvas/1/annotation",
      type: "Annotation",
      motivation: "painting",
      target: canvas.id,
      body: { id: "https://example.org/image.jpg", type: "Image" },
    };
    const vault = {
      get: vi.fn((ref: { id?: string } | string) => {
        const id = typeof ref === "string" ? ref : ref?.id;
        if (id === page.id) return page;
        if (id === annotation.id) return annotation;
        return null;
      }),
      modifyEntityField: vi.fn(),
    };

    repairSlideContentTargets(vault, canvas);

    expect(vault.modifyEntityField).toHaveBeenCalledWith(
      { id: annotation.id, type: "Annotation" },
      "target",
      {
        type: "SpecificResource",
        source: { id: canvas.id, type: "Canvas" },
        selector: {
          type: "FragmentSelector",
          value: "xywh=300,0,600,600",
        },
      },
    );
  });
});
