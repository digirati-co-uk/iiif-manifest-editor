import type { InternationalString } from "@iiif/presentation-3";
import {
  type CreatorContext,
  type CreatorFunctionContext,
  type CreatorResource,
  creatorHelper,
} from "@manifest-editor/creator-api";
import {
  CreateImageServerForm,
  type CreateImageServicePayload,
} from "../../ContentResource/ImageServiceCreator/create-image-service";

export interface CreateImageServiceAnnotationPayload extends CreateImageServicePayload {
  label?: InternationalString;
  motivation?: string;
  thumbnailSize?: number;
}

export async function createImageServiceAnnotation(
  data: CreateImageServiceAnnotationPayload,
  ctx: CreatorFunctionContext,
): Promise<any> {
  const annotation = {
    id: ctx.generateId("annotation"),
    type: "Annotation",
  };
  const targetType = ctx.options.targetType as "Annotation" | "Canvas";

  const createImage = creatorHelper(ctx, "Annotation", "body", "@manifest-editor/image-service-creator");

  const resource = await createImage(data, {
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

    let thumbnail: CreatorResource | undefined = undefined;
    if (data.service?.sizes) {
      // We can use the creator declaratively to get a thumbnail from the service.
      const createThumbnail = creatorHelper(ctx, "Canvas", "thumbnail", "@manifest-editor/thumbnail-image");
      thumbnail = await createThumbnail({
        service: data.service,
        width: data.thumbnailSize || 400,
      });
    }

    return ctx.embed({
      id: canvasId,
      type: "Canvas",
      label: data.label || { en: ["Untitled canvas"] },
      height: resource.resource.height || 1000,
      width: resource.resource.width || 1000,
      thumbnail: thumbnail ? [thumbnail] : undefined,
      items: [page],
    });
  }
}

export function CreateImageServiceAnnotationForm(props: CreatorContext<CreateImageServicePayload>) {
  return <CreateImageServerForm {...props} />;
}
