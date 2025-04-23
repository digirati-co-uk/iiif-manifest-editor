import type { InternationalString } from "@iiif/presentation-3";
import {
  type CreatorContext,
  type CreatorFunctionContext,
  type CreatorResource,
  creatorHelper,
} from "@manifest-editor/creator-api";
import { CreateImageUrlForm, type CreateImageUrlPayload } from "../../ContentResource/ImageUrlCreator/create-image-url";

export interface CreateImageUrlAnnotationPayload extends CreateImageUrlPayload {
  label?: InternationalString;
  motivation?: string;
}

export async function createImageUrlAnnotation(
  data: CreateImageUrlAnnotationPayload,
  ctx: CreatorFunctionContext,
): Promise<CreatorResource> {
  const annotation = {
    id: ctx.generateId("annotation"),
    type: "Annotation",
  };
  const targetType = ctx.options.targetType as "Annotation" | "Canvas";

  const createImage = creatorHelper(ctx, "Annotation", "body", "@manifest-editor/image-url-creator");

  const resource = await createImage(data, {
    parent: { resource: annotation, property: "body" },
  });

  if (targetType === "Annotation") {
    return ctx.embed({
      ...annotation,
      body: [resource],
      motivation: data.motivation || "painting",
      target: ctx.getTarget(),
    });
  }

  if (targetType === "Canvas") {
    const canvasId = ctx.generateId("canvas");
    const pageId = ctx.generateId("annotation-page", {
      id: canvasId,
      type: "Canvas",
    });

    const annotationResource = ctx.embed({
      ...annotation,
      motivation: "painting",
      body: [resource],
      target: {
        type: "SpecificResource",
        source: { id: canvasId, type: "Canvas" },
      },
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

  throw new Error("Unsupported target type");
}

export function CreateImageUrlAnnotationForm(props: CreatorContext<CreateImageUrlPayload>) {
  return <CreateImageUrlForm {...props} />;
}
