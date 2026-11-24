import type { Canvas } from "@iiif/presentation-3";
import { withAudioSlideDefaults } from "../audio-slide";
import {
  type CreatorFunctionContext,
  type CreatorDefinition,
  creatorHelper,
  type CreatorResource,
  defineCreator,
} from "@manifest-editor/creator-api";
import { type IIIFBrowserCreatorPayload, iiifBrowserCreator } from "@manifest-editor/creators";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@exhibitions/browser-creator": typeof imageBrowserSlideCreator;
    }
  }
}

export const imageBrowserSlideCreator = defineCreator({
  ...iiifBrowserCreator,
  id: "@exhibitions/browser-creator",
  configKey: iiifBrowserCreator.id,
  create: createBrowser,
  sideEffects: [],
  tags: ["image", "exhibition-slide", "exhibition-slideshow-slide"],
  label: "Browse IIIF content",
  summary: "Browse an IIIF manifest, collection, or supported collection webpage and choose content to add.",
  resourceType: "Canvas",
  resourceFields: ["id", "language", "type", "format", "value"],
  additionalTypes: [],
  supports: {
    initialData: true,
    onlyPainting: true,
    parentTypes: ["Manifest"],
    parentFields: ["items"],
    parentFieldMap: {
      Manifest: ["items"],
    },
  },
});

export function keepIIIFBrowserNested(creator: CreatorDefinition): CreatorDefinition {
  return {
    ...creator,
    additionalTypes: creator.additionalTypes?.filter((type: string) => type !== "Canvas"),
    supports: {
      ...creator.supports,
      parentTypes: ["Annotation", "AnnotationPage"],
      parentFieldMap: {
        Annotation: ["body"],
        AnnotationPage: ["items"],
      },
    },
  };
}

async function createBrowser(data: IIIFBrowserCreatorPayload, ctx: CreatorFunctionContext): Promise<CreatorResource> {
  const canvasId = ctx.generateId("canvas");
  const pageId = ctx.generateId("annotation-page", {
    id: canvasId,
    type: "Canvas",
  });

  const sourceCanvases: Array<{ canvas: Canvas; metadata: typeof manifestTracking }> = [];
  const dimensions = { width: 0, height: 0 };
  let manifestTracking: Parameters<NonNullable<IIIFBrowserCreatorPayload["trackManifest"]>>[0] | undefined;

  const createBrowserAnnotation = creatorHelper(
    ctx,
    { id: pageId, type: "AnnotationPage" },
    "items",
    "@manifest-editor/iiif-browser-creator"
  );

  const annotation = await createBrowserAnnotation(
    {
      ...data,
      trackCanvas(canvas) {
        sourceCanvases.push({ canvas, metadata: manifestTracking });
        data.trackCanvas?.(canvas);
      },
      trackSize({ width, height }) {
        dimensions.height = height;
        dimensions.width = width;
      },
      trackManifest(manifest) {
        manifestTracking = manifest;
      },
    },
    {
      targetType: "Annotation",
      target: {
        id: canvasId,
        type: "Canvas",
      },
    }
  );

  const createSlide = creatorHelper(ctx, "Manifest", "items", "@exhibitions/image-slide-creator");

  // Audio selections become separate timed slides, preserving each accompanying image.
  // Metadata is captured per canvas because the browser can select across manifests.
  const audioSelections = sourceCanvases.filter(({ canvas }) =>
    canvas.items?.some((page) =>
      page.items?.some((item) => {
        const bodies = Array.isArray(item.body) ? item.body : [item.body];
        return bodies.some((body: any) => (body?.type === "SpecificResource" ? body.source : body)?.type === "Sound");
      })
    )
  );
  if (audioSelections.length) {
    const audioSlides = audioSelections.map(({ canvas: source, metadata }, selectionIndex) => {
      const id = selectionIndex === 0 ? canvasId : ctx.generateId("canvas");
      const retarget = (target: any) =>
        typeof target === "string"
          ? target.replace(source.id, id)
          : target?.type === "SpecificResource"
            ? { ...target, source: { id, type: "Canvas" } }
            : { id, type: "Canvas" };
      return ctx.embed({
        ...source,
        id,
        width: source.width || 1920,
        height: source.height || 1080,
        behavior: withAudioSlideDefaults(
          ctx.options.initialData?.audioSlideBehavior || (source.behavior as string[]) || []
        ),
        ...metadata,
        metadata: [
          ...(source.metadata || []),
          ...(metadata?.metadata || []).filter(
            (item) => !(source.metadata || []).some((existing) => JSON.stringify(item) === JSON.stringify(existing))
          ),
        ],
        requiredStatement: source.requiredStatement || metadata?.requiredStatement,
        rights: source.rights || metadata?.rights,
        items: (source.items || []).map((page, pageIndex) => ({
          ...page,
          id: `${id}/page/${pageIndex}`,
          items: page.items?.map((item, index) => ({
            ...item,
            id: `${id}/annotation/${pageIndex}/${index}`,
            target: retarget(item.target),
          })),
        })),
      });
    });
    // Keep any images selected alongside the recordings as an ordinary exhibition slide.
    if (audioSelections.length < sourceCanvases.length || data.output.some((item) => item.resource.type !== "Canvas")) {
      const imageAnnotations = annotation.filter((item: any) => {
        const value = item.get ? item.get() : item;
        const bodies = Array.isArray(value.body) ? value.body : [value.body];
        return !bodies.some((body: any) => {
          const resolved = ctx.vault.get(body);
          return (resolved?.type === "SpecificResource" ? ctx.vault.get(resolved.source) : resolved)?.type === "Sound";
        });
      });
      const imageCanvasId = ctx.generateId("canvas");
      const retargetedImages = imageAnnotations.map((item: any) =>
        ctx.embed({
          ...(item.get ? item.get() : item),
          target: { type: "SpecificResource", source: { id: imageCanvasId, type: "Canvas" } },
        })
      );
      if (imageAnnotations.length)
        audioSlides.push(
          await createSlide({
            canvasId: imageCanvasId,
            width: dimensions.width,
            height: dimensions.height,
            type: "default",
            items: retargetedImages,
            imageSlideBehavior: ctx.options.initialData?.imageSlideBehavior,
            ...manifestTracking,
          })
        );
    }
    return audioSlides.length === 1 ? audioSlides[0]! : (audioSlides as any);
  }

  // 2. Pass that to an empty slide.
  return await createSlide({
    canvasId,
    width: dimensions.width,
    height: dimensions.height,
    type: "default", // default / left / right / bottom
    items: annotation,
    imageSlideBehavior: ctx.options.initialData?.imageSlideBehavior,
    ...manifestTracking,
  });
}
