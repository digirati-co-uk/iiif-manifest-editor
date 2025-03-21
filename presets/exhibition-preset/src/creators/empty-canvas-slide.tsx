import { CreatorDefinition, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { emptyCanvas } from "@manifest-editor/creators";
import { InternationalString } from "@iiif/presentation-3";

export const emptyCanvasSlide: CreatorDefinition = {
  ...emptyCanvas,
  id: "@exhibitions/empty-canvas",
  create: createEmptyCanvasSlide,
  tags: ['Canvas', "exhibition-slide"],
  label: "Empty canvas",
  summary: "No content",
}

interface EmptyCanvasSlidePayload {
  label?: InternationalString;
  width?: number;
  height?: number;
}

async function createEmptyCanvasSlide(data: EmptyCanvasSlidePayload, ctx: CreatorFunctionContext) {
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
}
