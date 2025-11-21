import {
  canonicalServiceUrl,
  createImageServiceRequest,
  imageServiceRequestToString,
  parseImageServiceRequest,
  type RegionParameter,
  type SizeParameter,
} from "@iiif/parser/image-3";
import type { ImageService } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { type FormEvent, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ImageService as ImageServiceComponent } from "react-iiif-vault";

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
  const service = { ...data.service };
  if (service["@id"]) {
    service.id = service["@id"];
  }
  if (service["@type"]) {
    service.type = service["@type"];
  }

  const request = createImageServiceRequest(service);
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
    height: data.height || service.height,
    width: data.width || service.width,
    service: data.embedService === false ? undefined : [data.service],
  });

  // @todo add in support for the region selector (creating specific resource)

  return resource;
}

function getCanonicalUrl(url: string) {
  return url.endsWith("default.jpg")
    ? imageServiceRequestToString({
        ...parseImageServiceRequest(url),
        type: "info",
      })
    : canonicalServiceUrl(url);
}

// @todo cover a lot more things - like offering size dropdown.
export function CreateImageServerForm(props: CreatorContext<CreateImageServicePayload>) {
  const [url, setUrl] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const formData = Object.fromEntries(data.entries()) as any;

    const url = formData.url;

    if (url) {
      const info = getCanonicalUrl(url);

      if (!info) {
        throw new Error("Invalid image service request");
      }

      fetch(info)
        .then((r) => r.json())
        .then((service) => {
          props.runCreate({ url: formData.url, service });
        });
    }
  };

  return (
    <PaddedSidebarContainer>
      <form onSubmit={onSubmit}>
        <div className="flex gap-2 items-center">
          <InputContainer $wide>
            <InputLabel htmlFor="id">Link to image service</InputLabel>
            <Input
              id="url"
              name="url"
              defaultValue=""
              onPaste={(e) => {
                const text = e.clipboardData.getData("text/plain");
                setUrl(text ? getCanonicalUrl(text) : "");
              }}
              onBlur={(e) => setUrl(e.currentTarget.value ? getCanonicalUrl(e.currentTarget.value) : "")}
            />
          </InputContainer>
        </div>

        <div className="relative flex z-0 my-5 h-96 min-h-0 min-w-0 overflow-hidden bg-gray-200 rounded items-center justify-center">
          {url.trim() ? (
            <ErrorBoundary fallbackRender={() => <div>Invalid service</div>}>
              <ImageServiceComponent
                src={url}
                fluid
                errorFallback={() => <div>Invalid service</div>}
                background="rgb(229,231,235)"
                className="h-full w-full"
                containerProps={{ className: "w-full h-full z-10" }}
              />
            </ErrorBoundary>
          ) : (
            <div className="text-grey-600">Preview</div>
          )}
        </div>
        <div>
          <ActionButton primary large type="submit" isDisabled={!url}>
            Create
          </ActionButton>
        </div>
      </form>
    </PaddedSidebarContainer>
  );
}
