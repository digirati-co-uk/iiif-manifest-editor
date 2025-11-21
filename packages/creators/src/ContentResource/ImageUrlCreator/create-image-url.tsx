import type { ImageService } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext, CreatorResource } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { getFormat, getImageDimensions } from "@manifest-editor/shell";
import type { FormEvent } from "react";

export interface CreateImageUrlPayload {
  url: string;
  format?: string;
  height?: number;
  width?: number;
  service?: ImageService | ImageService[];
}

export async function createImageUrl(
  data: CreateImageUrlPayload,
  ctx: CreatorFunctionContext,
): Promise<CreatorResource> {
  if (!data.height || !data.width) {
    const dimensions = await getImageDimensions(data.url);
    if (dimensions) {
      data.height = dimensions.height;
      data.width = dimensions.width;
    }
  }

  return ctx.embed({
    id: data.url,
    type: "Image",
    format: data.format || (await getFormat(data.url)),
    height: data.height,
    width: data.width,
    service: data.service ? (Array.isArray(data.service) ? data.service : [data.service]) : undefined,
  });
}

export function CreateImageUrlForm(props: CreatorContext) {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const formData = Object.fromEntries(data.entries()) as any;

    if (formData.url) {
      props.runCreate({ url: formData.url });
    }
  };

  return (
    <PaddedSidebarContainer>
      <form onSubmit={onSubmit}>
        <InputContainer $wide>
          <InputLabel htmlFor="id">Link to Image</InputLabel>
          <Input id="url" name="url" defaultValue="" />
        </InputContainer>

        <ActionButton primary large type="submit">
          Create
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
