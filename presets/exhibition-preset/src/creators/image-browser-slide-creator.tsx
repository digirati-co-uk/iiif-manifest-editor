import { type CreatorFunctionContext, creatorHelper, defineCreator } from "@manifest-editor/creator-api";
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
  create: createBrowser,
  tags: ["image", "exhibition-slide"],
  label: "IIIF Browser",
  summary: "Browse IIIF Resources",
});

async function createBrowser(data: IIIFBrowserCreatorPayload, ctx: CreatorFunctionContext) {
  const canvasId = ctx.generateId("canvas");
  const pageId = ctx.generateId("annotation-page", {
    id: canvasId,
    type: "Canvas",
  });

  const dimensions = { width: 0, height: 0 };

  const createBrowserAnnotation = creatorHelper(
    ctx,
    { id: pageId, type: "AnnotationPage" },
    "items",
    "@manifest-editor/iiif-browser-creator",
  );

  const annotation = await createBrowserAnnotation(
    {
      ...data,
      trackSize({ width, height }) {
        dimensions.height = height;
        dimensions.width = width;
      },
    },
    {
      targetType: "Annotation",
      target: {
        id: canvasId,
        type: "Canvas",
      },
    },
  );

  const createSlide = creatorHelper(ctx, "Manifest", "items", "@exhibitions/image-slide-creator");

  // 2. Pass that to an empty slide.
  return await createSlide({
    canvasId,
    width: dimensions.width,
    height: dimensions.height,
    type: "default", // default / left / right / bottom
    items: [annotation],
  });
}
