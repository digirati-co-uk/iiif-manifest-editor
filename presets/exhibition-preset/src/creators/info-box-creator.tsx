import { TextIcon } from "@manifest-editor/components";
import { emptyAnnotation, emptyCanvas } from "@iiif/parser";
import type { InternationalString } from "@iiif/presentation-3";
import { type CreatorFunctionContext, defineCreator } from "@manifest-editor/creator-api";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@exhibitions/info-box-creator": typeof infoBoxCreator;
      "@exhibitions/slideshow-long-editorial-creator": typeof slideshowLongEditorialCreator;
    }
  }
}

export const infoBoxCreator = defineCreator({
  id: "@exhibitions/info-box-creator",
  create: createInfoBox,
  label: "Text panel",
  summary: "Create a panel for text. No link is needed.",
  icon: <TextIcon />,
  tags: ["exhibition-slide"],
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    initialData: true,
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
});

export const slideshowLongEditorialCreator = defineCreator({
  ...infoBoxCreator,
  id: "@exhibitions/slideshow-long-editorial-creator",
  label: "Text slide",
  summary: "Create a slide for longer text. No link is needed.",
  tags: ["exhibition-slideshow-slide"],
  create: (payload, ctx) =>
    createInfoBox(
      {
        ...payload,
        behavior: ["w-12", "h-8", "info"],
        height: payload.height || 1080,
        width: payload.width || 1920,
      },
      ctx
    ),
});

interface InfoBoxPayload {
  label?: InternationalString;
  height?: number;
  width?: number;
  behavior?: string[];
}

async function createInfoBox(data: InfoBoxPayload, ctx: CreatorFunctionContext) {
  const canvasId = ctx.generateId("canvas");
  const pageId = ctx.generateId("annotation-page", {
    id: canvasId,
    type: "Canvas",
  });
  const annotationsId = ctx.generateId("annotation-page", {
    id: canvasId,
    type: "Canvas",
  });
  const annotation = {
    ...emptyAnnotation,
    id: ctx.generateId("annotation", { id: canvasId, type: "Canvas" }),
    type: "Annotation",
  };

  const bodies = [
    await ctx.create(
      "@manifest-editor/html-body-creator",
      {
        language: "en",
        body: "",
      },
      { parent: { resource: annotation, property: "body" } }
    ),
  ];

  const annotationResource = ctx.embed({
    ...annotation,
    motivation: "painting",
    body: bodies,
    target: {
      type: "SpecificResource",
      source: { id: canvasId, type: "Canvas" },
    },
  });

  const annotationLongId = ctx.generateId("annotation", {
    id: canvasId,
    type: "Canvas",
  });
  const longDescriptionResource = ctx.embed({
    id: annotationLongId,
    type: "Annotation",
    motivation: "tagging",
    body: [
      await ctx.create(
        "@manifest-editor/html-body-creator",
        {
          language: "en",
          body: "",
        },
        {
          parent: {
            resource: { id: annotationLongId, type: "Annotation" },
            property: "body",
          },
        }
      ),
    ],
    target: {
      type: "SpecificResource",
      source: { id: canvasId, type: "Canvas" },
    },
  });

  const page = ctx.embed({
    id: pageId,
    type: "AnnotationPage",
    items: [annotationResource],
  });

  const annotations = ctx.embed({
    id: annotationsId,
    type: "AnnotationPage",
    items: [longDescriptionResource],
  });

  return ctx.embed({
    ...emptyCanvas, // bug with placeholder canvas.
    id: canvasId,
    type: "Canvas",
    behavior: data.behavior || ["w-4", "h-4", "info"],
    label: data.label || undefined,
    height: data.height || 1000,
    width: data.width || 1000,
    items: [page],
    annotations: [annotations],
  });
}
