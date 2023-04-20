import { CreatorDefinition } from "@/creator-api";
import { ThumbnailStripIcon } from "../../../icons/ThumbnailStripIcon";
import { CreatorFunctionContext } from "../../../creator-api";
import { InternationalString } from "@iiif/presentation-3";

export const emptyCanvas: CreatorDefinition = {
  id: "@manifest-editor/empty-canvas",
  create: createEmptyCanvas,
  label: "Empty canvas",
  summary: "Canvas with nothing",
  icon: <ThumbnailStripIcon />,
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    parentTypes: ["Manifest"],
  },
};

interface EmptyCanvasPayload {
  label?: InternationalString;
  width?: number;
  height?: number;
}

async function createEmptyCanvas(data: EmptyCanvasPayload, ctx: CreatorFunctionContext) {
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
