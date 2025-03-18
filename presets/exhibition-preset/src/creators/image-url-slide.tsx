import { imageServiceCreator } from "@manifest-editor/creators";
import { CreatorDefinition, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { ImageService, InternationalString } from "@iiif/presentation-3";

export const imageUrlSlide: CreatorDefinition = {
  ...imageServiceCreator,
  id: "@exhibitions/image-service-creator",
  create: createUrlSlide,
  tags: ["image", "exhibition-slide"],
  label: "Image",
  summary: "Image from URL",
}

interface CreateImageUrlSlidePayload {
  label?: InternationalString;
  motivation?: string;
  url: string;
  format?: string;
  height?: number;
  width?: number;
  service?: ImageService | ImageService[];
}

async function createUrlSlide (
  data: CreateImageUrlSlidePayload,
  ctx: CreatorFunctionContext,
) {
  const annotation = {
    id: ctx.generateId("annotation"),
    type: "Annotation",
  };
  const targetType = ctx.options.targetType as "Annotation" | "Canvas";

  const resource = await ctx.create("@manifest-editor/image-url-creator", data, {
    parent: { resource: annotation, property: "body" },
  });

  if (targetType === "Annotation") {
    return {
      ...annotation,
      body: [resource],
      motivation: data.motivation || "painting",
      target: ctx.getTarget(),
    };
  }

  if (targetType === "Canvas") {
    const canvasId = ctx.generateId("canvas");
    const pageId = ctx.generateId("annotation-page", { id: canvasId, type: "Canvas" });

    const annotationResource = ctx.embed({
      ...annotation,
      motivation: "painting",
      body: [resource],
      target: { type: "SpecificResource", source: { id: canvasId, type: "Canvas" } },
    });

    const page = ctx.embed({
      id: pageId,
      type: "AnnotationPage",
      items: [annotationResource],
    });

    return ctx.embed({
      id: canvasId,
      type: "Canvas",
      label: data.label || { en: ["Untitled canvas"] },
      height: resource.resource.height || 1000,
      width: resource.resource.width || 1000,
      items: [page],
    });
  }
}

