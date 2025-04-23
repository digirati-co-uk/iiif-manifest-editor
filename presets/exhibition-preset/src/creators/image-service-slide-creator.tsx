import {
  type CreatorFunctionContext,
  creatorHelper,
  type CreatorResource,
  defineCreator,
} from "@manifest-editor/creator-api";
import { type CreateImageServicePayload, imageServiceCreator } from "@manifest-editor/creators";
import { imageSlideCreator } from "./image-slide-creator";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@exhibitions/image-service-creator": typeof imageServiceSlideCreator;
    }
  }
}

export const imageServiceSlideCreator = defineCreator({
  ...imageServiceCreator,
  id: "@exhibitions/image-service-creator",
  create: createImageService,
  tags: ["image", "exhibition-slide"],
  label: "IIIF Image",
  summary: "IIIF Image service",
  resourceType: "Canvas",
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
});

async function createImageService(
  data: CreateImageServicePayload,
  ctx: CreatorFunctionContext,
): Promise<CreatorResource> {
  const canvasId = ctx.generateId("canvas");
  const pageId = ctx.generateId("annotation-page", {
    id: canvasId,
    type: "Canvas",
  });
  const annotationId = ctx.generateId("annotation");

  const createImageService = creatorHelper(
    ctx,
    { id: annotationId, type: "Annotation" },
    "body",
    "@manifest-editor/image-service-creator",
  );

  // 1. Call the original creator to get the annotation
  const resource = await createImageService(data, {
    target: {
      id: canvasId,
      type: "Canvas",
    },
  });

  const { width, height } = resource.get();

  const annotation = ctx.embed({
    id: ctx.generateId("annotation"),
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
