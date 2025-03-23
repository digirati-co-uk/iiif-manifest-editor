import type {
  CreatorDefinition,
  CreatorFunctionContext,
  GetCreatorPayload,
} from "@manifest-editor/creator-api";
import { imageUrlCreator } from "@manifest-editor/creators";
import { imageSlideCreator } from "./image-slide-creator";

export const imageUrlSlideCreator: CreatorDefinition<
  GetCreatorPayload<typeof imageUrlCreator>
> = {
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
};

async function createUrlSlide(
  data: GetCreatorPayload<typeof imageUrlCreator>,
  ctx: CreatorFunctionContext,
) {
  const canvasId = ctx.generateId("canvas");
  const pageId = ctx.generateId("annotation-page", {
    id: canvasId,
    type: "Canvas",
  });

  // 1. Call the original creator to get the annotation
  const resource = await ctx.create<typeof imageUrlCreator>(
    imageUrlCreator.id,
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
