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
import { Spinner } from "@manifest-editor/ui/madoc/components/icons/Spinner";
import { type FormEvent, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useImage } from "react-iiif-vault";

export interface CreateImageServicePayload {
  url?: string;
  height?: number;
  width?: number;
  format?: string;
  service?: ImageService;
  size?: SizeParameter;
  embedService?: boolean;
  selector?: RegionParameter;
}

export function getCanonicalImageServiceUrl(url: string) {
  try {
    return url.endsWith("default.jpg")
      ? imageServiceRequestToString({
          ...parseImageServiceRequest(url),
          type: "info",
        })
      : canonicalServiceUrl(url);
  } catch (error) {
    return null;
  }
}

export async function resolveImageServicePayload<T extends CreateImageServicePayload>(
  data: T,
): Promise<T & { service: ImageService }> {
  if (data.service) {
    return data as T & { service: ImageService };
  }

  if (!data.url) {
    throw new Error("Invalid image service request");
  }

  const info = getCanonicalImageServiceUrl(data.url);
  if (!info) {
    throw new Error("Invalid image service request");
  }

  const response = await fetch(info);
  if (!response.ok) {
    throw new Error(`Unable to fetch image service metadata from ${info}`);
  }

  const service = (await response.json()) as ImageService;
  return {
    ...data,
    service,
  };
}

export async function createImageServer(data: CreateImageServicePayload, ctx: CreatorFunctionContext) {
  const resolvedData = await resolveImageServicePayload(data);
  const service = { ...resolvedData.service! };
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
      max: !resolvedData.size?.width && !resolvedData.size?.height,
      confined: false,
      upscaled: false,
      ...(resolvedData.size || {}),
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
    format: resolvedData.format || "image/jpeg",
    height: resolvedData.height || service.height,
    width: resolvedData.width || service.width,
    service: resolvedData.embedService === false ? undefined : [resolvedData.service!],
  });

  // @todo add in support for the region selector (creating specific resource)

  return resource;
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
      const info = getCanonicalImageServiceUrl(url);

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
                setUrl(text ? getCanonicalImageServiceUrl(text) || "" : "");
              }}
              onBlur={(e) =>
                setUrl(e.currentTarget.value ? getCanonicalImageServiceUrl(e.currentTarget.value) || "" : "")
              }
            />
          </InputContainer>
        </div>

        <div className="relative flex z-0 my-5 h-96 min-h-0 min-w-0 overflow-hidden bg-gray-200 rounded items-center justify-center">
          {url.trim() ? (
            <ErrorBoundary fallbackRender={() => <div>Invalid service</div>}>
              <ImageComponent key={url} src={url} />
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

function ImageComponent({ src }: { src: string }) {
  const image = useImage({ id: src } as any, {
    size: { width: 512 },
  });

  if (!image) {
    return <Spinner />;
  }

  return (
    <div className="h-full">
      <img className="w-full h-full object-contain" src={image} />
    </div>
  );
}
