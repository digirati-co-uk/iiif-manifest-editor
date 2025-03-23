import type {
  CreatorDefinition,
  CreatorFunctionContext,
  GetCreatorPayload,
} from "@manifest-editor/creator-api";
import { iiifBrowserCreator } from "@manifest-editor/creators";
import { imageSlideCreator } from "./image-slide-creator";

export const imageBrowserSlideCreator: CreatorDefinition = {
  ...iiifBrowserCreator,
  id: "@exhibitions/browser-creator",
  create: createBrowser,
  tags: ["image", "exhibition-slide"],
  label: "IIIF Browser",
  summary: "Browse IIIF Resources",
};

async function createBrowser(
  data: GetCreatorPayload<typeof iiifBrowserCreator>,
  ctx: CreatorFunctionContext,
) {
  const canvasId = ctx.generateId("canvas");
  const pageId = ctx.generateId("annotation-page", {
    id: canvasId,
    type: "Canvas",
  });

  const dimensions = { width: 0, height: 0 };

  // 1. Call the original creator to get the annotation
  const annotation = await ctx.create<typeof iiifBrowserCreator>(
    iiifBrowserCreator.id,
    {
      ...data,
      trackSize({ width, height }) {
        dimensions.height = height;
        dimensions.width = width;
      },
    },
    {
      target: {
        id: canvasId,
        type: "Canvas",
      },
      targetType: "Annotation",
      parent: {
        resource: { id: pageId, type: "AnnotationPage" },
        property: "items",
      },
    },
  );

  // 2. Pass that to an empty slide.
  return await ctx.create<typeof imageSlideCreator>(imageSlideCreator.id, {
    canvasId,
    width: dimensions.width,
    height: dimensions.height,
    type: "default", // default / left / right / bottom
    items: [annotation],
  });
}
