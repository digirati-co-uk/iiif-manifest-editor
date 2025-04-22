import type { InternationalString } from "@iiif/presentation-3";
import { EmptyCanvasIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/empty-canvas": typeof emptyCanvas;
    }
  }
}

export const emptyCanvas = defineCreator({
  id: "@manifest-editor/empty-canvas",
  create: (
    data: {
      label?: InternationalString;
      width?: number;
      height?: number;
    },
    ctx,
  ) => {
    const canvasId = ctx.generateId("canvas");
    const page = ctx.embed({
      id: ctx.generateId("annotation-page", { id: canvasId, type: "Canvas" }),
      type: "AnnotationPage",
      items: [],
    });

    return {
      id: canvasId,
      type: "Canvas",
      label: data.label || { en: [""] },
      height: data.height || 1000,
      width: data.width || 1000,
      items: [page],
    };
  },
  label: "Empty canvas",
  summary: "No content",
  icon: <EmptyCanvasIcon />,
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
});
