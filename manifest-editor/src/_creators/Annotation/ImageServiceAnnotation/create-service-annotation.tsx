import { CreatorContext, CreatorFunctionContext } from "@/creator-api/types";
import React from "react";
import {
  CreateImageServerForm,
  CreateImageServicePayload,
} from "@/_creators/ContentResource/ImageServiceCreator/create-image-service";

export interface CreateImageServiceAnnotationPayload extends CreateImageServicePayload {
  motivation?: string;
}

export async function createImageSericeAnnotation(
  data: CreateImageServiceAnnotationPayload,
  ctx: CreatorFunctionContext
) {
  const annotation = {
    id: ctx.generateId("annotation"),
    type: "Annotation",
  };

  const resource = await ctx.create("@manifest-editor/image-service-creator", data, {
    parent: { resource: annotation, property: "body" },
  });

  return {
    ...annotation,
    body: [resource],
    motivation: data.motivation || "painting",
    target: ctx.getTarget(),
  };
}

export function CreateImageServiceAnnotationForm(props: CreatorContext<CreateImageServicePayload>) {
  return <CreateImageServerForm {...props} />;
}
