import { FormEvent } from "react";
import { ImageService } from "@iiif/presentation-3";
import { CreatorContext, CreatorFunctionContext, CreatorResource } from "@manifest-editor/creator-api";
import { InputContainer, InputLabel, Input } from "@manifest-editor/editors";
import { getImageDimensions, getFormat } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";

export interface CreateImageUrlPayload {
  url: string;
  format?: string;
  height?: number;
  width?: number;
  service?: ImageService | ImageService[];
}

export async function createImageUrl(
  data: CreateImageUrlPayload,
  ctx: CreatorFunctionContext
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

        <Button type="submit">Create</Button>
      </form>
    </PaddedSidebarContainer>
  );
}
