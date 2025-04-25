import {
  type CreatorFunctionContext,
  creatorHelper,
  type CreatorResource,
  defineCreator,
} from "@manifest-editor/creator-api";
import { type CreateImageUrlPayload, imageUrlCreator } from "@manifest-editor/creators";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@exhibitions/image-url-creator": typeof imageUrlSlideCreator;
    }
  }
}

export const imageUrlSlideCreator = defineCreator({
  ...imageUrlCreator,
  id: "@exhibitions/image-url-creator",
  create: createUrlSlide,
  tags: ["exhibition-slide"],
  label: "Image",
  summary: "Image from URL",
  resourceType: "Canvas",
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
});

async function createUrlSlide(data: CreateImageUrlPayload, ctx: CreatorFunctionContext): Promise<CreatorResource> {
  const canvasId = ctx.generateId("canvas");
  const pageId = ctx.generateId("annotation-page", {
    id: canvasId,
    type: "Canvas",
  });
  const annotationId = ctx.generateId("annotation");

  const createImageUrl = creatorHelper(
    ctx,
    { id: annotationId, type: "Annotation" },
    "body",
    "@manifest-editor/image-url-creator",
  );

  // 1. Call the original creator to get the annotation
  const resource = await createImageUrl(data, {
    target: {
      id: canvasId,
      type: "Canvas",
    },
    targetType: "Annotation",
  });

  const { width, height } = resource.get();

  const annotation = ctx.embed({
    id: annotationId,
    type: "Annotation",
    motivation: "painting",
    body: [resource],
    target: {
      type: "SpecificResource",
      source: { id: canvasId, type: "Canvas" },
    },
  });

  // 2. Pass that to an empty slide.
  const createSlide = creatorHelper(ctx, "Manifest", "items", "@exhibitions/image-slide-creator");
  return await createSlide({
    canvasId,
    width,
    height,
    type: "default", // default / left / right / bottom
    items: [annotation],
  });
}
