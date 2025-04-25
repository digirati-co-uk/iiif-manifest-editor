import { type CreatorFunctionContext, type CreatorResource, creatorHelper } from "@manifest-editor/creator-api";
import type { CreateImageUrlPayload } from "../../ContentResource/ImageUrlCreator/create-image-url";

export async function createImageUrlListAnnotation(
  payload: {
    images: CreateImageUrlPayload[];
  },
  ctx: CreatorFunctionContext,
): Promise<CreatorResource[]> {
  const items = [];
  const createAnnotation = creatorHelper(ctx, "AnnotationPage", "items", "@manifest-editor/image-url-annotation");

  for (const image of payload.images) {
    items.push(await createAnnotation(image, ctx.options));
  }

  return items as CreatorResource[];
}
