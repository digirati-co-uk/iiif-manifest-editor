import { ActionButton, Form } from "@manifest-editor/components";
import {
  type CreatorContext,
  type CreatorFunctionContext,
  type CreatorResource,
  creatorHelper,
} from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
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
        <Button type="submit">Create</Button>
      </Form.Form>
    </PaddedSidebarContainer>
  );
}
