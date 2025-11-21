import { ActionButton, Form, PaddedSidebarContainer } from "@manifest-editor/components";
import {
  type CreatorContext,
  type CreatorFunctionContext,
  type CreatorResource,
  creatorHelper,
} from "@manifest-editor/creator-api";
import type { FormEvent } from "react";
import type { CreateImageUrlPayload } from "../ImageUrlCreator/create-image-url";

export interface CreateImageUrlListPayload {
  images: CreateImageUrlPayload[];
}

export async function createImageUrlList(
  payload: CreateImageUrlListPayload,
  ctx: CreatorFunctionContext,
): Promise<CreatorResource[]> {
  const items = [];
  const createImage = creatorHelper(ctx, "Annotation", "body", "@manifest-editor/image-url-creator");

  for (const image of payload.images) {
    items.push(await createImage(image, ctx.options));
  }

  return items as CreatorResource[];
}

export function CreateImageUrlListForm(props: CreatorContext<CreateImageUrlListPayload>) {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const formData = Object.fromEntries(data.entries()) as any;

    if (formData.urls) {
      props.runCreate({ images: formData.urls.split("\n").map((url: string) => ({ url })) });
    }
  };

  return (
    <PaddedSidebarContainer>
      <Form.Form onSubmit={onSubmit}>
        <Form.InputContainer className="mb-4">
          <Form.Label>Enter a list of URLs (one per line)</Form.Label>
          <Form.TextArea name="urls" rows="10" />
        </Form.InputContainer>
        <ActionButton primary large type="submit">
          Create
        </ActionButton>
      </Form.Form>
    </PaddedSidebarContainer>
  );
}
