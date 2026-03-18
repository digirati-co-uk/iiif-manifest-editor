import { Vault } from "@iiif/helpers/vault";
import {
  emptyAnnotation,
  emptyAnnotationPage,
  emptyCanvas,
  emptyManifest,
  emptyRange,
} from "@iiif/parser";
import {
  defineCreator,
  type CreatorDefinition,
  type CreatorFunctionContext,
} from "@manifest-editor/creator-api";
import { imageServiceAnnotation } from "../../../creators/src/Annotation/ImageServiceAnnotation/index.tsx";
import { imageServiceCreator } from "../../../creators/src/ContentResource/ImageServiceCreator/index.tsx";
import { thumbnailCreator } from "../../../creators/src/ContentResource/ThumbnailCreator/index.tsx";
import { createManifestEditorToolRuntime } from "../runtime/create-runtime";
import type { ManifestEditorToolRuntime, ResourceRef, ToolMode } from "../types";

function createHtmlBodyResources(
  annotationId: string,
  body: Record<string, string[]> = { en: [""] },
  ctx: CreatorFunctionContext,
) {
  const bodies = Object.entries(body).flatMap(([language, values], index) => {
    return values.map((value, valueIndex) =>
      ctx.embed({
        id: `${annotationId}/body/${language}/${index}-${valueIndex}`,
        type: "TextualBody",
        format: "text/html",
        language,
        value,
      }),
    );
  });

  return bodies.length ? bodies : [ctx.embed({ id: `${annotationId}/body/en/0-0`, type: "TextualBody", value: "" })];
}

const emptyCanvasCreator = defineCreator({
  id: "@manifest-editor/empty-canvas",
  label: "Empty canvas",
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
  create: (
    data: {
      label?: Record<string, string[]>;
      width?: number;
      height?: number;
    },
    ctx,
  ) => {
    const canvasId = ctx.generateId("canvas");
    const page = ctx.embed({
      ...emptyAnnotationPage,
      id: ctx.generateId("annotation-page", { id: canvasId, type: "Canvas" }),
      type: "AnnotationPage",
      items: [],
    });

    return ctx.embed({
      ...emptyCanvas,
      id: canvasId,
      type: "Canvas",
      label: data.label || { en: [""] },
      height: data.height || 1000,
      width: data.width || 1000,
      items: [page],
      annotations: [],
    });
  },
});

const emptyAnnotationPageCreator = defineCreator({
  id: "@manifest-editor/empty-annotation-page",
  label: "Empty annotation page",
  resourceType: "AnnotationPage",
  resourceFields: ["id", "type", "items"],
  supports: {
    parentTypes: ["Manifest", "Canvas", "Range"],
    parentFieldMap: {
      Manifest: ["annotations"],
      Canvas: ["items", "annotations"],
      Range: ["annotations"],
    },
  },
  create: (data: { label?: Record<string, string[]> }, ctx) => {
    return ctx.embed({
      ...emptyAnnotationPage,
      id: ctx.generateId("annotation-page"),
      type: "AnnotationPage",
      label: data.label,
      items: [],
    });
  },
});

const htmlAnnotationCreator = defineCreator({
  id: "@manifest-editor/html-annotation",
  label: "HTML annotation",
  resourceType: "Annotation",
  additionalTypes: ["Canvas"],
  resourceFields: ["id", "type", "motivation", "body", "target"],
  supports: {
    initialData: true,
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
  },
  create: (
    data: {
      label?: Record<string, string[]>;
      body?: Record<string, string[]>;
      motivation?: string;
      width?: number;
      height?: number;
    },
    ctx,
  ) => {
    const targetType = ctx.options.targetType as "Annotation" | "Canvas";
    const annotationId = ctx.generateId("annotation");

    const annotation = ctx.embed({
      ...emptyAnnotation,
      id: annotationId,
      type: "Annotation",
      label: data.label,
      motivation: data.motivation || ctx.options.initialData?.motivation || "painting",
      body: createHtmlBodyResources(annotationId, data.body, ctx),
      target: ctx.getTarget(),
    });

    if (targetType === "Annotation") {
      return annotation;
    }

    const canvasId = ctx.generateId("canvas");
    const page = ctx.embed({
      ...emptyAnnotationPage,
      id: ctx.generateId("annotation-page", { id: canvasId, type: "Canvas" }),
      type: "AnnotationPage",
      items: [
        ctx.embed({
          ...emptyAnnotation,
          id: annotationId,
          type: "Annotation",
          label: data.label,
          motivation: "painting",
          body: createHtmlBodyResources(annotationId, data.body, ctx),
          target: {
            type: "SpecificResource",
            source: { id: canvasId, type: "Canvas" },
          },
        }),
      ],
    });

    return ctx.embed({
      ...emptyCanvas,
      id: canvasId,
      type: "Canvas",
      label: data.label || { en: ["Untitled HTML canvas"] },
      height: data.height || 1000,
      width: data.width || 1000,
      items: [page],
      annotations: [],
    });
  },
});

const noBodyAnnotationCreator = defineCreator({
  id: "@manifest-editor/no-body-annotation",
  label: "No body annotation",
  resourceType: "Annotation",
  resourceFields: ["id", "type", "target"],
  supports: {
    initialData: true,
    parentTypes: ["AnnotationPage"],
    parentFields: ["items"],
  },
  create: (_data: Record<string, never>, ctx) => {
    return ctx.embed({
      ...emptyAnnotation,
      id: ctx.generateId("annotation"),
      type: "Annotation",
      motivation: ctx.options.initialData?.motivation || "painting",
      target: ctx.getTarget(),
    });
  },
});

const rangeTopLevelCreator = defineCreator({
  id: "@manifest-editor/range-top-level",
  label: "Top level range",
  resourceType: "Range",
  resourceFields: ["id", "type", "label", "items"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["structures"],
  },
  create: (
    data: {
      label?: Record<string, string[]>;
      items?: Array<ResourceRef>;
    },
    ctx,
  ) => {
    return ctx.embed({
      ...emptyRange,
      id: ctx.generateId("range"),
      type: "Range",
      label: data.label || { en: ["Table of contents"] },
      items: (data.items || []).map((item) => ctx.ref(item)),
    });
  },
});

const rangeWithItemsCreator = defineCreator({
  id: "@manifest-editor/range-with-items",
  label: "Nested range",
  resourceType: "Range",
  resourceFields: ["id", "type", "label", "items"],
  supports: {
    parentTypes: ["Range"],
    parentFields: ["items"],
  },
  create: (
    data: {
      label?: Record<string, string[]>;
      items?: Array<ResourceRef>;
    },
    ctx,
  ) => {
    return ctx.embed({
      ...emptyRange,
      id: ctx.generateId("range"),
      type: "Range",
      label: data.label || { en: ["Untitled range"] },
      items: (data.items || []).map((item) => ctx.ref(item)),
    });
  },
});

function createExhibitionSlide(
  data: {
    label?: Record<string, string[]>;
    width?: number;
    height?: number;
    behavior?: string[];
    items?: unknown[];
  },
  ctx: CreatorFunctionContext,
) {
  const canvasId = ctx.generateId("canvas");
  const itemsPage = ctx.embed({
    ...emptyAnnotationPage,
    id: ctx.generateId("annotation-page", { id: canvasId, type: "Canvas" }),
    type: "AnnotationPage",
    items: data.items || [],
  });
  const annotationsPage = ctx.embed({
    ...emptyAnnotationPage,
    id: ctx.generateId("annotation-page", { id: canvasId, type: "Canvas" }),
    type: "AnnotationPage",
    items: [],
  });

  return ctx.embed({
    ...emptyCanvas,
    id: canvasId,
    type: "Canvas",
    label: data.label || { en: ["Untitled slide"] },
    width: data.width || 1920,
    height: data.height || 1080,
    behavior: data.behavior || ["w-12", "h-4", "image"],
    items: [itemsPage],
    annotations: [annotationsPage],
  });
}

function defineExhibitionSlideCreator(id: string, behavior: string[]) {
  return defineCreator({
    id,
    label: id,
    resourceType: "Canvas",
    resourceFields: ["id", "type", "label", "height", "width", "items", "annotations"],
    tags: ["exhibition-slide"],
    supports: {
      parentTypes: ["Manifest"],
      parentFields: ["items"],
    },
    create: (
      data: {
        label?: Record<string, string[]>;
        width?: number;
        height?: number;
      },
      ctx,
    ) => {
      return createExhibitionSlide(
        {
          ...data,
          behavior,
        },
        ctx,
      );
    },
  });
}

const exhibitionImageSlideCreator = defineExhibitionSlideCreator("@exhibitions/image-slide-creator", [
  "w-12",
  "h-4",
  "image",
]);
const exhibitionImageSlideLeftCreator = defineExhibitionSlideCreator("@exhibitions/image-slide-creator-left", [
  "w-12",
  "h-4",
  "left",
]);
const exhibitionImageSlideRightCreator = defineExhibitionSlideCreator("@exhibitions/image-slide-creator-right", [
  "w-12",
  "h-4",
  "right",
]);
const exhibitionImageSlideBottomCreator = defineExhibitionSlideCreator("@exhibitions/image-slide-creator-bottom", [
  "w-12",
  "h-4",
  "bottom",
]);

const exhibitionInfoBoxCreator = defineCreator({
  id: "@exhibitions/info-box-creator",
  label: "Info box",
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items", "annotations"],
  tags: ["exhibition-slide"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
  create: (
    data: {
      label?: Record<string, string[]>;
      width?: number;
      height?: number;
    },
    ctx,
  ) => {
    return createExhibitionSlide(
      {
        ...data,
        behavior: ["w-4", "h-4", "info"],
      },
      ctx,
    );
  },
});

export const manifestToolCreators: CreatorDefinition[] = [
  emptyCanvasCreator,
  emptyAnnotationPageCreator,
  htmlAnnotationCreator,
  noBodyAnnotationCreator,
  rangeTopLevelCreator,
  rangeWithItemsCreator,
];

export const manifestToolCreatorsWithImageServices: CreatorDefinition[] = [
  ...manifestToolCreators,
  thumbnailCreator,
  imageServiceCreator,
  imageServiceAnnotation,
];

export const exhibitionToolCreators: CreatorDefinition[] = [
  ...manifestToolCreators,
  exhibitionImageSlideCreator,
  exhibitionImageSlideLeftCreator,
  exhibitionImageSlideRightCreator,
  exhibitionImageSlideBottomCreator,
  exhibitionInfoBoxCreator,
];

export interface FixtureRefs {
  manifest: ResourceRef;
  canvas1: ResourceRef;
  canvas2: ResourceRef;
  canvas1PaintingPage: ResourceRef;
  canvas2PaintingPage: ResourceRef;
}

export function createFixtureManifest() {
  const canvas1Id = "https://example.org/canvas/1";
  const canvas2Id = "https://example.org/canvas/2";

  const canvas1 = {
    ...emptyCanvas,
    id: canvas1Id,
    type: "Canvas",
    label: { en: ["Canvas 1"] },
    width: 1000,
    height: 1000,
    behavior: ["w-12", "h-4", "image"],
    items: [
      {
        ...emptyAnnotationPage,
        id: `${canvas1Id}/page/painting`,
        type: "AnnotationPage",
        items: [],
      },
    ],
    annotations: [],
  };

  const canvas2 = {
    ...emptyCanvas,
    id: canvas2Id,
    type: "Canvas",
    label: { en: ["Canvas 2"] },
    width: 1000,
    height: 1000,
    behavior: ["w-12", "h-4", "image"],
    items: [
      {
        ...emptyAnnotationPage,
        id: `${canvas2Id}/page/painting`,
        type: "AnnotationPage",
        items: [],
      },
    ],
    annotations: [],
  };

  return {
    ...emptyManifest,
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { en: ["Fixture manifest"] },
    items: [canvas1, canvas2],
    structures: [],
    annotations: [],
  };
}

export function createFixtureRuntime(options: {
  creators?: CreatorDefinition[];
  mode?: ToolMode;
} = {}): {
  runtime: ManifestEditorToolRuntime;
  vault: Vault;
  refs: FixtureRefs;
} {
  const manifest = createFixtureManifest();
  const vault = new Vault();
  vault.loadManifestSync(manifest.id, manifest as any);

  const runtime = createManifestEditorToolRuntime({
    vault,
    rootResource: { id: manifest.id, type: "Manifest" },
    creators: options.creators || manifestToolCreators,
    mode: options.mode,
  });

  return {
    runtime,
    vault,
    refs: {
      manifest: { id: manifest.id, type: "Manifest" },
      canvas1: { id: manifest.items[0]!.id, type: "Canvas" },
      canvas2: { id: manifest.items[1]!.id, type: "Canvas" },
      canvas1PaintingPage: { id: `${manifest.items[0]!.id}/page/painting`, type: "AnnotationPage" },
      canvas2PaintingPage: { id: `${manifest.items[1]!.id}/page/painting`, type: "AnnotationPage" },
    },
  };
}

export function getEntity<T = any>(vault: Vault, ref: ResourceRef): T {
  return vault.get(ref as any) as T;
}
