import { FormEvent } from "react";
import { ImageService } from "@iiif/presentation-3";
import {
  imageServiceRequestToString,
  createImageServiceRequest,
  RegionParameter,
  SizeParameter,
  canonicalServiceUrl,
} from "@iiif/parser/image-3";
import { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { InputContainer, InputLabel, Input } from "@manifest-editor/editors";
import { Button } from "@manifest-editor/ui/atoms/Button";

export interface CreateImageServicePayload {
  url: string;
  height?: number;
  width?: number;
  format?: string;
  service: ImageService;
  size?: SizeParameter;
  embedService?: boolean;
  selector?: RegionParameter;
}

export async function createImageServer(data: CreateImageServicePayload, ctx: CreatorFunctionContext) {
  const request = createImageServiceRequest(data.service);
  const imageId = imageServiceRequestToString({
    identifier: request.identifier,
    server: request.server,
    scheme: request.scheme,
    type: "image",
    size: {
      max: !data.size?.width && !data.size?.height,
      confined: false,
      upscaled: false,
      ...(data.size || {}),
    },
    format: "jpg",
    // This isn't how it should be modelled, always full,
    // region: data.selector ? data.selector : { full: true },
    region: { full: true },
    rotation: { angle: 0 },
    quality: "default",
    prefix: request.prefix,
    originalPath: (request as any).originalPath,
  });

  const resource = ctx.embed({
    id: imageId,
    type: "Image",
    format: data.format || "image/jpeg",
    height: data.height || data.service.height,
    width: data.width || data.service.width,
    service: data.embedService === false ? undefined : [data.service],
  });

  // @todo add in support for the region selector (creating specific resource)

  return resource;
}

// @todo cover a lot more things - like offering size dropdown.
export function CreateImageServerForm(props: CreatorContext<CreateImageServicePayload>) {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const formData = Object.fromEntries(data.entries()) as any;

    const url = formData.url;

    if (url) {
      const canon = canonicalServiceUrl(url);
      fetch(canon)
        .then((r) => r.json())
        .then((service) => {
          if (service["@id"]) {
            service.id = service["@id"];
          }
          if (service["@type"]) {
            service.type = service["@type"];
          }
          props.runCreate({ url: formData.url, service });
        });
    }
  };

  return (
    <PaddedSidebarContainer>
      <form onSubmit={onSubmit}>
        <InputContainer $wide>
          <InputLabel htmlFor="id">Link to image service</InputLabel>
          <Input id="url" name="url" defaultValue="" />
        </InputContainer>

        <Button type="submit">Create</Button>
      </form>
    </PaddedSidebarContainer>
  );
}
