import { emptyAnnotationPage, emptyCanvas } from "@iiif/parser";
import type { InternationalString } from "@iiif/presentation-3";
import type {
  CreatorContext,
  CreatorDefinition,
  CreatorFunctionContext,
} from "@manifest-editor/creator-api";

export const imageSlideCreator: CreatorDefinition = {
  id: "@exhibitions/image-slide-creator",
  create: createImageSlide,
  label: "Image",
  summary: "An image with text.",
  icon: <div>IMAGE</div>,
  tags: ["exhibition-slide"],
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
};

export const imageSlideLeftCreator: CreatorDefinition = {
  ...imageSlideCreator,
  id: "@exhibitions/image-slide-creator-left",
  label: "Image (Left)",
  summary: "An image with text on the left.",
  icon: <div>IMAGE (LEFT)</div>,
  create: (payload, ctx) => createImageSlide({ ...payload, type: "left" }, ctx),
};

export const imageSlideRightCreator: CreatorDefinition = {
  ...imageSlideCreator,
  id: "@exhibitions/image-slide-creator-right",
  label: "Image (Right)",
  summary: "An image with text on the right.",
  icon: <div>IMAGE (RIGHT)</div>,
  create: (payload, ctx) =>
    createImageSlide({ ...payload, type: "right" }, ctx),
};

export const imageSlideBottomCreator: CreatorDefinition = {
  ...imageSlideCreator,
  id: "@exhibitions/image-slide-creator-bottom",
  label: "Image (Bottom)",
  summary: "An image with text at the bottom.",
  icon: <div>IMAGE (BOTTOM)</div>,
  create: (payload, ctx) =>
    createImageSlide({ ...payload, type: "bottom" }, ctx),
};

interface InfoBoxPayload {
  label?: InternationalString;
  height?: number;
  width?: number;
  type: "default" | "left" | "right" | "bottom";
}

function createImageSlide(
  payload: InfoBoxPayload,
  ctx: CreatorFunctionContext,
) {
  const canvasId = ctx.generateId("Canvas");
  const itemsPageId = ctx.generateId("AnnotationPage", {
    id: canvasId,
    type: "Canvas",
  });
  const annotationsPageId = ctx.generateId("AnnotationPage", {
    id: canvasId,
    type: "Canvas",
  });

  const behavior = ["w-12", "h-4"];
  let width = 6000;

  switch (payload.type) {
    case "left":
      behavior.push("left");
      width *= 2 / 3;
      break;
    case "right":
      behavior.push("right");
      width *= 2 / 3;
      break;
    case "bottom":
      behavior.push("bottom");
      break;
  }

  return ctx.embed({
    ...emptyCanvas,
    id: canvasId,
    behavior,
    label: payload.label || { en: ["Untitled"] },
    height: payload.height || 2000,
    width: payload.width || width,
    items: [
      ctx.embed({
        ...emptyAnnotationPage,
        id: itemsPageId,
        type: "AnnotationPage",
        items: [],
      }),
    ],
    annotations: [
      ctx.embed({
        ...emptyAnnotationPage,
        id: annotationsPageId,
        type: "AnnotationPage",
        items: [],
      }),
    ],
  });
}
