import { emptyCanvas } from "@iiif/parser";
import type { ContentResource } from "@iiif/presentation-3";
import { type CreatorFunctionContext, creatorHelper, defineCreator } from "@manifest-editor/creator-api";
import { type CreateVideoAnnotationPayload, videoAnnotation } from "@manifest-editor/creators";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@exhibitions/video-creator": typeof videoSlideCreator;
    }
  }
}

export const videoSlideCreator = defineCreator({
  ...videoAnnotation,
  id: "@exhibitions/video-creator",
  create: createVideo,
  tags: ["video", "exhibition-slide"],
  label: "Video",
  summary: "A video for an exhibition",
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
});

async function createVideo(data: CreateVideoAnnotationPayload, ctx: CreatorFunctionContext): any {
  const canvasId = ctx.generateId("canvas");
  const pageId = ctx.generateId("annotation-page", {
    id: canvasId,
    type: "Canvas",
  });

  const annotation = await ctx.create("@manifest-editor/video-annotation", data, {
    target: {
      id: canvasId,
      type: "Canvas",
    },
    targetType: "Annotation",
    parent: {
      resource: { id: pageId, type: "AnnotationPage" },
      property: "items",
    },
  });

  const page = ctx.embed({
    id: pageId,
    type: "AnnotationPage",
    items: [annotation],
  });

  // Add thumbnail?

  const createSlide = creatorHelper(ctx, "Manifest", "items", "@exhibitions/image-slide-creator");

  // 2. Pass that to an empty slide.
  return await createSlide({
    canvasId,
    height: data.height || 1080,
    width: data.width || 1920,
    duration: data.duration,
    type: "bottom", // default / left / right / bottom
    items: [annotation as any],
  });
}
