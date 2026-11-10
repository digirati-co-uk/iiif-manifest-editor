import { useServiceRequest } from "../../use-service-request";
import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import type { ImageService } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext, CreatorResource } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { type FormEvent, useMemo, useState } from "react";
import { getCanonicalUrl, serviceImageAtSize } from "./thumbnail-helpers";
import { compactImageService, normalizeImageService } from "../image-service-options";

export interface CreateThumbnailPayload {
  service: ImageService;
  thumbnailUrl?: string;
  width: number;
  height?: number;
}

export async function createThumbnail(data: CreateThumbnailPayload, ctx: CreatorFunctionContext) {
  // Here is where we can add a thumbnail, if appropriate.
  const service = normalizeImageService(data.service);
  const sizes = service.sizes;
  // Thumbnails retain available sizes/tiles regardless of the workspace's painting-image defaults.
  const embeddedService = compactImageService(service, ctx.config, true);

  if (data.thumbnailUrl) {
    return ctx.embed({
      id: data.thumbnailUrl,
      type: "Image",
      format: "image/jpeg",
      width: data.width,
      height: data.height,
      service: [embeddedService],
    });
  }

  if (sizes) {
    const thumbnailSize = data.width || 400;
    // We have something to work with for a thumbnail - could be improved to listen to height/width.
    let bestMatch: { width: number; height?: number } | null = null;
    for (const size of sizes) {
      if (!bestMatch || Math.abs(size.width - thumbnailSize) < Math.abs(bestMatch.width - thumbnailSize)) {
        bestMatch = { width: size.width, height: size.height };
      }
    }
    if (bestMatch) {
      const imageId = serviceImageAtSize(service, bestMatch);

      return ctx.embed({
        id: imageId,
        type: "Image",
        format: "image/jpeg",
        width: bestMatch.width,
        height: bestMatch.height,
        service: [embeddedService],
      });
    }
  }

  // Otherwise we have nothing..
  return null;
}

// @todo cover a lot more things - like offering size dropdown.
export function CreateThumbnailForm(props: CreatorContext) {
  const t = useTranslations("creators");
  const common = useTranslations("common");
  const { locale } = useEditorI18n();
  const [url, setUrl] = useState(props.options.initialData?.url || "");
  const [service, setService] = useState<ImageService | null>(props.options.initialData?.service || null);
  const [selectedSize, setSelectedSize] = useState({
    width: props.options.initialData?.width || 0,
    height: props.options.initialData?.height || 0,
  });
  const previewUrl = useMemo(() => {
    if (!service) return null;
    if (!selectedSize.width || !selectedSize.height) return null;

    return serviceImageAtSize(service, selectedSize);
  }, [selectedSize, service]);

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
          setService(service);
          const size0 = service.sizes?.[0];
          if (size0) setSelectedSize(size0);
        }
      );
    }
  };

  // https://dlcs.digirati.io/iiif-img/58/2/20-carina_nebula~orig.png

  if (service) {
    return (
      <PaddedSidebarContainer>
        <div className="mb-4">
          <div className="mb-2">{service["@id"] || service.id}</div>
          <div className="flex gap-2 mb-4">
            {service.sizes?.map((size) => {
              const isSelected = size.width === selectedSize.width;
              return (
                <ActionButton
                  key={size.width}
                  primary={isSelected}
                  isDisabled={isSelected}
                  large
                  onPress={() => setSelectedSize(size)}
                >
                  {t("form.dimensions", {
                    width: new Intl.NumberFormat(locale).format(size.width),
                    height: size.height === undefined ? "" : new Intl.NumberFormat(locale).format(size.height),
                  })}
                </ActionButton>
              );
            })}
          </div>

          {previewUrl ? <img src={previewUrl} alt={t("image.previewAlt")} /> : null}
        </div>

        <ActionButton
          primary
          large
          isDisabled={!previewUrl}
          onPress={() => {
            if (!service) return;
            props.runCreate({
              service,
              width: selectedSize.width,
              height: selectedSize.height,
              thumbnailUrl: previewUrl,
            });
          }}
        >
          {t("form.addThumbnail")}
        </ActionButton>
      </PaddedSidebarContainer>
    );
  }

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
              defaultValue={props.options.initialData?.url || ""}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text/plain");
                setUrl(text ? getCanonicalUrl(text) : "");
              }}
              onBlur={(e) => setUrl(e.currentTarget.value ? getCanonicalUrl(e.currentTarget.value) : "")}
            />
          </InputContainer>
        </div>
        <div>
          <ActionButton primary large type="submit" isDisabled={!url || loading}>
            {t("form.selectSize")}
          </ActionButton>
        </div>
      </form>
    </PaddedSidebarContainer>
  );
}

function ImageSelectionPreview({ url }: { url: string }) {
  return null;
}
