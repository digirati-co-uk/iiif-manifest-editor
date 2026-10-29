import { useServiceRequest } from "../../use-service-request";
import { useTranslations } from "@manifest-editor/i18n";
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
import { ImageService as ImageServiceComponent, useImage } from "react-iiif-vault";
import { compactImageService, normalizeImageService } from "../image-service-options";

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
  const service = normalizeImageService(data.service);

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
    service:
      data.embedService === false
        ? undefined
        : [compactImageService(service, ctx.config, ctx.options.parent?.property === "thumbnail")],
  });

  // @todo add in support for the region selector (creating specific resource)

  return resource;
}

export function getCanonicalUrl(url: string) {
  return url.endsWith("default.jpg")
    ? imageServiceRequestToString({
        ...parseImageServiceRequest(url),
        type: "info",
      })
    : canonicalServiceUrl(url);
}

// @todo cover a lot more things - like offering size dropdown.
export function CreateImageServerForm(props: CreatorContext<CreateImageServicePayload>) {
  const t = useTranslations("creators");
  const common = useTranslations("common");
  const initialData = props.options.initialData as Partial<CreateImageServicePayload>;
  const initialUrl = initialData.url ? getCanonicalUrl(initialData.url) : "";
  const [url, setUrl] = useState(initialUrl || "");

  const { load, loading, failed } = useServiceRequest();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const formData = Object.fromEntries(data.entries()) as any;

    const url = formData.url;

    if (url) {
      void load(
        () => getCanonicalUrl(url),
        (service) => {
          props.runCreate({ url: formData.url, service });
        }
      );
    }
  };

  return (
    <PaddedSidebarContainer>
      <form onSubmit={onSubmit} aria-busy={loading}>
        {failed ? <div role="alert">{t("errors.service")}</div> : null}
        {loading ? <output>{common("status.loading")}</output> : null}
        <div className="flex gap-2 items-center">
          <InputContainer $wide>
            <InputLabel htmlFor="url">{t("form.serviceUrl")}</InputLabel>
            <Input
              id="url"
              name="url"
              defaultValue={initialData.url || ""}
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
            <ErrorBoundary fallbackRender={() => <div>{t("form.invalidService")}</div>}>
              <ImageComponent key={url} src={url} />
            </ErrorBoundary>
          ) : (
            <div className="text-grey-600">{common("actions.preview")}</div>
          )}
        </div>
        <div>
          <ActionButton primary large type="submit" isDisabled={!url || loading}>
            {common("actions.create")}
          </ActionButton>
        </div>
      </form>
    </PaddedSidebarContainer>
  );
}

function ImageComponent({ src }: { src: string }) {
  const t = useTranslations("creators");
  const common = useTranslations("common");
  const image = useImage({ id: src } as any, {
    size: { width: 512 },
  });

  if (!image) {
    return (
      <output aria-label={common("status.loading")}>
        <Spinner />
      </output>
    );
  }

  return (
    <div className="h-full">
      <img className="w-full h-full object-contain" src={image} alt={t("image.previewAlt")} />
    </div>
  );
}
