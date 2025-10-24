import { emptyAnnotation, emptyCanvas } from "@iiif/parser";
import type { InternationalString } from "@iiif/presentation-3";
import { type CreatorFunctionContext, defineCreator } from "@manifest-editor/creator-api";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@exhibitions/info-box-creator": typeof infoBoxCreator;
    }
  }
}

export const infoBoxCreator = defineCreator({
  id: "@exhibitions/info-box-creator",
  create: createInfoBox,
  label: "Info box",
  summary: "A text panel for an exhibition",
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <title>Info box</title>
      <path
        fill="currentColor"
        d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
      />
    </svg>
  ),
  tags: ["exhibition-slide"],
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
});

interface InfoBoxPayload {
  label?: InternationalString;
  height?: number;
  width?: number;
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
      { parent: { resource: annotation, property: "body" } },
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
        },
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
    behavior: ["w-4", "h-4", "info"],
    label: data.label || undefined,
    height: data.height || 1000,
    width: data.width || 1000,
    items: [page],
    annotations: [annotations],
  });
}
