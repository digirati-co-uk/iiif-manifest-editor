import type {
  CreatorDefinition,
  CreatorFunctionContext,
  GetCreatorPayload,
} from "@manifest-editor/creator-api";
import { imageServiceCreator } from "@manifest-editor/creators";
import { imageSlideCreator } from "./image-slide-creator";

export const imageServiceSlideCreator: CreatorDefinition<
  GetCreatorPayload<typeof imageServiceCreator>
> = {
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
};

async function createImageService(
  data: GetCreatorPayload<typeof imageServiceCreator>,
  ctx: CreatorFunctionContext,
) {
  const canvasId = ctx.generateId("canvas");
  const pageId = ctx.generateId("annotation-page", {
    id: canvasId,
    type: "Canvas",
  });

  // 1. Call the original creator to get the annotation
  const resource = await ctx.create<typeof imageServiceCreator>(
    imageServiceCreator.id,
    data,
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
  return await ctx.create<typeof imageSlideCreator>(imageSlideCreator.id, {
    canvasId,
    width,
    height,
    type: "default", // default / left / right / bottom
    items: [annotation],
  });
}
