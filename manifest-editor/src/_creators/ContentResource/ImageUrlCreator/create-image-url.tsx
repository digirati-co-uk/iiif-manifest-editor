import { Button } from "@/atoms/Button";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { CreatorContext, CreatorFunctionContext } from "@/creator-api/types";
import { InputContainer, InputLabel, Input } from "@/editors/Input";
import { FormEvent } from "react";
import { getFormat } from "@/helpers/analyse";
import { ImageService } from "@iiif/presentation-3";

export interface CreateImageUrlPayload {
  url: string;
  format?: string;
  height?: number;
  width?: number;
  service?: ImageService | ImageService[];
}

export async function createImageUrl(data: CreateImageUrlPayload, ctx: CreatorFunctionContext) {
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
        <InputContainer wide>
          <InputLabel htmlFor="id">Link to Image</InputLabel>
          <Input id="url" name="url" defaultValue="" />
        </InputContainer>

        <Button type="submit">Create</Button>
      </form>
    </PaddedSidebarContainer>
  );
}
