import type { InternationalString } from "@iiif/presentation-3";
import type {
  CreatorDefinition,
  CreatorFunctionContext,
} from "@manifest-editor/creator-api";

export const textPanelCreator: CreatorDefinition = {
  id: "@exhibitions/text-panel",
  create: createEmptyCanvas,
  label: "Text panel",
  summary: "A text panel for an exhibition",
  icon: <div>TEXT Panel</div>,
  tags: ["exhibition-slide"],
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
};

interface EmptyCanvasPayload {
  label?: InternationalString;
  width?: number;
  height?: number;
}

async function createEmptyCanvas(
  data: EmptyCanvasPayload,
  ctx: CreatorFunctionContext,
) {
  const canvasId = ctx.generateId("canvas");
  const page = ctx.embed({
    id: ctx.generateId("annotation-page", { id: canvasId, type: "Canvas" }),
    type: "AnnotationPage",
    items: [],
  });

  return ctx.embed({
    id: canvasId,
    type: "Canvas",
    label: data.label || { en: [""] },
    height: data.height || 1000,
    width: data.width || 1000,
    items: [page],
  });
}
