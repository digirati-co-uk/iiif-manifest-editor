import type { InternationalString } from "@iiif/presentation-3";
import { EmptyCanvasIcon } from "@manifest-editor/components";
import type { CreatorDefinition } from "@manifest-editor/creator-api";

export const emptyCanvas: CreatorDefinition<{
  label?: InternationalString;
  width?: number;
  height?: number;
}> = {
  id: "@manifest-editor/empty-canvas",
  create: (data, ctx) => {
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
};
