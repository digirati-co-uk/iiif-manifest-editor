import { canvasLayouts, CANVAS_LAYOUT_META, createCanvasLayoutState } from "@manifest-editor/editor-api";
import { CanvasLayoutForm } from "@manifest-editor/editors";
import { emptyAnnotationPage, emptyCanvas } from "@iiif/parser";
import type { InternationalString } from "@iiif/presentation-3";
import { EmptyCanvasIcon, ImageListIcon } from "@manifest-editor/components";
import { type CreatorFunctionContext, type CreatorResource, defineCreator } from "@manifest-editor/creator-api";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@exhibitions/image-slide-creator": typeof imageSlideCreator;
      "@exhibitions/image-slide-creator-bottom": typeof imageSlideBottomCreator;
      "@exhibitions/image-slide-creator-left": typeof imageSlideLeftCreator;
      "@exhibitions/image-slide-creator-right": typeof imageSlideRightCreator;
      "@exhibitions/slideshow-image-only-creator": typeof slideshowImageOnlyCreator;
      "@exhibitions/slideshow-image-text-creator": typeof slideshowImageTextCreator;
      "@exhibitions/scroll-compact-deck-creator": typeof scrollCompactDeckCreator;
    }
  }
}

export const imageSlideCreator = defineCreator({
  id: "@exhibitions/image-slide-creator",
  create: createImageSlide,
  render: (ctx) => <CanvasLayoutForm runCreate={(data) => ctx.runCreate({ ...data, type: "default" })} />,
  label: "Empty slide",
  summary: "Create a blank slide and add content later.",
  icon: <EmptyCanvasIcon />,
  tags: ["exhibition-slide"], // No tag, so it doesn't appear, it's just called.
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    initialData: true,
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
});

export const imageSlideLeftCreator = defineCreator({
  ...imageSlideCreator,
  id: "@exhibitions/image-slide-creator-left",
  label: "Image with text on left",
  summary: "An image with text on the left.",
  icon: <SlideLayoutIcon position="left" />,
  create: (payload, ctx) => createImageSlide({ ...payload, type: "left" }, ctx),
});

export const imageSlideRightCreator = defineCreator({
  ...imageSlideCreator,
  id: "@exhibitions/image-slide-creator-right",
  label: "Image with text on right",
  summary: "An image with text on the right.",
  icon: <SlideLayoutIcon position="right" />,
  create: (payload, ctx) => createImageSlide({ ...payload, type: "right" }, ctx),
});

export const imageSlideBottomCreator = defineCreator({
  ...imageSlideCreator,
  id: "@exhibitions/image-slide-creator-bottom",
  label: "Image with text below",
  summary: "An image with text at the bottom.",
  icon: <SlideLayoutIcon position="bottom" />,
  create: (payload, ctx) => createImageSlide({ ...payload, type: "bottom" }, ctx),
});

export const slideshowImageOnlyCreator = defineCreator({
  ...imageSlideCreator,
  id: "@exhibitions/slideshow-image-only-creator",
  label: "Multiple images",
  icon: <ImageListIcon />,
  summary: "Create a slide and arrange multiple images on it.",
  tags: ["exhibition-slideshow-slide"],
  create: (payload, ctx) =>
    createImageSlide(
      {
        ...payload,
        behavior: [`w-${payload.columns || 12}`, `h-${payload.rows || 8}`, "image"],
        height: payload.height || 2000,
        width: payload.width || 3000,
        type: "default",
      },
      ctx
    ),
});

export const slideshowImageTextCreator = defineCreator({
  ...imageSlideCreator,
  id: "@exhibitions/slideshow-image-text-creator",
  label: "Multiple images with text",
  icon: <SlideLayoutIcon position="right" />,
  summary: "Create a slide with space for multiple images and text.",
  tags: ["exhibition-slideshow-slide"],
  create: (payload, ctx) =>
    createImageSlide(
      {
        ...payload,
        behavior: [`w-${payload.columns || 12}`, `h-${payload.rows || 8}`, "right"],
        height: payload.height || 2000,
        width: payload.width || 3000,
        type: "right",
      },
      ctx
    ),
});

export const scrollCompactDeckCreator = defineCreator({
  ...imageSlideCreator,
  id: "@exhibitions/scroll-compact-deck-creator",
  label: "Compact image deck",
  icon: <ImageListIcon />,
  summary: "A scrolling section with compact annotation-led image slides.",
  tags: ["exhibition-scroll-section", "exhibition-slide"],
  create: (payload, ctx) =>
    createImageSlide(
      {
        ...payload,
        behavior: [`w-${payload.columns || 12}`, `h-${payload.rows || 8}`, "compact-deck"],
        height: payload.height || 2000,
        width: payload.width || 3000,
        type: "default",
      },
      ctx
    ),
});

interface InfoBoxPayload {
  layoutId?: string;
  columns?: number;
  rows?: number;
  canvasId?: string;
  label?: InternationalString;
  metadata?: any[];
  requiredStatement?: any;
  rights?: string;
  partOf?: any[];
  height?: number;
  width?: number;
  duration?: number;
  type: "default" | "left" | "right" | "bottom";
  behavior?: string[];
  imageSlideBehavior?: string[];
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

  const imageSlideBehavior = payload.imageSlideBehavior || ctx.options.initialData?.imageSlideBehavior;

  if (payload.behavior) {
    behavior.push(...payload.behavior);
  } else if (imageSlideBehavior) {
    behavior.push(...imageSlideBehavior);
  } else if (payload.columns && payload.rows) {
    behavior.push(`w-${payload.columns}`, `h-${payload.rows}`);
  } else if (payload.width && payload.height) {
    // Determine layout type to apply effective-width modifier for text panels
    const layoutType = payload.type ?? "default";
    const isLeftRight = layoutType === "left" || layoutType === "right";
    const isBottom = layoutType === "bottom";

    // Always start full-width (w-12); height is derived from aspect ratio
    const displayWidth = 12;
    const ratio = payload.width / payload.height;
    // Effective image width after text-panel area is subtracted
    const effectiveWidth = isLeftRight ? displayWidth * (2 / 3) : displayWidth;
    // For bottom layout the text panel adds ~half height again
    const textHeightMultiplier = isBottom ? 3 / 2 : 1;
    const derivedHeight = Math.max(1, Math.min(12, Math.round((effectiveWidth / ratio) * textHeightMultiplier)));

    behavior.push(`w-${displayWidth}`, `h-${derivedHeight}`);
  } else {
    behavior.push(`w-${payload.columns || 12}`, `h-${payload.rows || 8}`);
  }

  if (!payload.behavior) {
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
  }

  if (!payload.items?.length) {
    behavior.push("multi-image");
  }

  const manifestTracking = {
    ...(payload.metadata ? { metadata: payload.metadata } : {}),
    ...(payload.requiredStatement ? { requiredStatement: payload.requiredStatement } : {}),
    ...(payload.rights ? { rights: payload.rights } : {}),
    ...(payload.partOf ? { partOf: payload.partOf } : {}),
  };

  const resource = ctx.embed({
    ...emptyCanvas,
    id: canvasId,
    behavior,
    label: payload.label || { en: ["Untitled"] },
    ...manifestTracking,
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
  const layout = canvasLayouts.find((layout) => layout.id === payload.layoutId);
  if (layout) resource.meta[CANVAS_LAYOUT_META] = { state: createCanvasLayoutState(layout) };
  return resource;
}

function SlideLayoutIcon({ position }: { position: "left" | "right" | "bottom" }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      {position === "bottom" ? (
        <path d="M3 14h18M7 17h10" />
      ) : (
        <>
          <path d={position === "left" ? "M11 4v16M6 9h2M6 12h2M6 15h2" : "M13 4v16M16 9h2M16 12h2M16 15h2"} />
        </>
      )}
    </svg>
  );
}
