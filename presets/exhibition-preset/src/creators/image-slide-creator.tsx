import { emptyAnnotationPage, emptyCanvas } from "@iiif/parser";
import type { InternationalString } from "@iiif/presentation-3";
import { EmptyCanvasIcon } from "@manifest-editor/components";
import { type CreatorFunctionContext, type CreatorResource, defineCreator } from "@manifest-editor/creator-api";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@exhibitions/image-slide-creator": typeof imageSlideCreator;
      "@exhibitions/image-slide-creator-bottom": typeof imageSlideBottomCreator;
      "@exhibitions/image-slide-creator-left": typeof imageSlideLeftCreator;
      "@exhibitions/image-slide-creator-right": typeof imageSlideRightCreator;
    }
  }
}

export const imageSlideCreator = defineCreator({
  id: "@exhibitions/image-slide-creator",
  create: createImageSlide,
  label: "Empty slide",
  summary: "An empty image slide.",
  icon: <EmptyCanvasIcon />,
  tags: ["exhibition-slide"], // No tag, so it doesn't appear, it's just called.
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
});

export const imageSlideLeftCreator = defineCreator({
  ...imageSlideCreator,
  id: "@exhibitions/image-slide-creator-left",
  label: "Image (Left)",
  summary: "An image with text on the left.",
  icon: <div>IMAGE (LEFT)</div>,
  create: (payload, ctx) => createImageSlide({ ...payload, type: "left" }, ctx),
});

export const imageSlideRightCreator = defineCreator({
  ...imageSlideCreator,
  id: "@exhibitions/image-slide-creator-right",
  label: "Image (Right)",
  summary: "An image with text on the right.",
  icon: <div>IMAGE (RIGHT)</div>,
  create: (payload, ctx) => createImageSlide({ ...payload, type: "right" }, ctx),
});

export const imageSlideBottomCreator = defineCreator({
  ...imageSlideCreator,
  id: "@exhibitions/image-slide-creator-bottom",
  label: "Image (Bottom)",
  summary: "An image with text at the bottom.",
  icon: <div>IMAGE (BOTTOM)</div>,
  create: (payload, ctx) => createImageSlide({ ...payload, type: "bottom" }, ctx),
});

interface InfoBoxPayload {
  canvasId?: string;
  label?: InternationalString;
  height?: number;
  width?: number;
  duration?: number;
  type: "default" | "left" | "right" | "bottom";
  items?: CreatorResource[];
}

function createImageSlide(payload: InfoBoxPayload, ctx: CreatorFunctionContext) {
  const canvasId = payload.canvasId || ctx.generateId("Canvas");
  const itemsPageId = ctx.generateId("AnnotationPage", {
    id: canvasId,
    type: "Canvas",
  });
  const annotationsPageId = ctx.generateId("AnnotationPage", {
    id: canvasId,
    type: "Canvas",
  });

  const behavior = [];
  let width = 6000;

  if (payload.width && payload.height) {
    // Let's figure out the right behaviours.
    if (payload.width > payload.height) {
      // The orientation is landscape.
      // Let's shrink the height.
      const gridSize = payload.width / 12;
      const heightColumns = Math.floor(payload.height / gridSize);
      const hClass = `h-${heightColumns}`;
      behavior.push("w-12", hClass);
    } else {
      // The orientation is portrait.
      const gridSize = payload.height / 12;
      const widthColumns = Math.floor(payload.width / gridSize);
      const wClass = `w-${widthColumns}`;
      behavior.push(wClass, "h-12");
    }
  } else {
    behavior.push("w-12", "h-4");
  }

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

  if (!payload.items?.length) {
    behavior.push("multi-image");
  }

  return ctx.embed({
    ...emptyCanvas,
    id: canvasId,
    behavior,
    label: payload.label || { en: ["Untitled"] },
    height: payload.height || 4000,
    duration: payload.duration,
    width: payload.width || width,
    items: [
      ctx.embed({
        ...emptyAnnotationPage,
        id: itemsPageId,
        type: "AnnotationPage",
        items: payload.items ? payload.items : [],
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
