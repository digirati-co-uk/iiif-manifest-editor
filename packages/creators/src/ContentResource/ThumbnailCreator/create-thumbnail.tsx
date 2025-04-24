import type { ImageService } from "@iiif/presentation-3";
import { ActionButton } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext, CreatorResource } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { type FormEvent, useMemo, useState } from "react";
import { getCanonicalUrl, serviceImageAtSize } from "./thumbnail-helpers";

export interface CreateThumbnailPayload {
  service: ImageService;
  thumbnailUrl?: string;
  width: number;
  height?: number;
}

export async function createThumbnail(data: CreateThumbnailPayload, ctx: CreatorFunctionContext) {
  // Here is where we can add a thumbnail, if appropriate.
  const service = { ...data.service };
  const sizes = service.sizes;
  if (service["@id"]) {
    service.id = service["@id"];
  }
  if (service["@type"]) {
    service.type = service["@type"];
  }

  if (data.thumbnailUrl) {
    return ctx.embed({
      id: data.thumbnailUrl,
      type: "Image",
      format: "image/jpeg",
      width: data.width,
      height: data.height,
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
      });
    }
  }

  // Otherwise we have nothing..
  return null;
}

// @todo cover a lot more things - like offering size dropdown.
export function CreateThumbnailForm(props: CreatorContext) {
  const [url, setUrl] = useState("");
  const [service, setService] = useState<ImageService | null>(null);
  const [selectedSize, setSelectedSize] = useState({ width: 0, height: 0 });
  const previewUrl = useMemo(() => {
    if (!service) return null;
    if (!selectedSize.width || !selectedSize.height) return null;

    return serviceImageAtSize(service, selectedSize);
  }, [selectedSize, service]);

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
          setService(service);
          const size0 = service.sizes?.[0];
          if (size0) {
            setSelectedSize(size0);
          }
        });
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
                  {size.width}x{size.height}
                </ActionButton>
              );
            })}
          </div>

          {previewUrl ? <img src={previewUrl} alt="preview of selected resource" /> : null}
        </div>

        <ActionButton
          primary
          large
          isDisabled={!previewUrl}
          onPress={() => {
            if (!service) return;
            props.runCreate({ service, width: selectedSize.width, height: selectedSize.height });
          }}
        >
          Add thumbnail
        </ActionButton>
      </PaddedSidebarContainer>
    );
  }

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
        <div>
          <ActionButton primary large type="submit" isDisabled={!url}>
            Select size
          </ActionButton>
        </div>
      </form>
    </PaddedSidebarContainer>
  );
}

function ImageSelectionPreview({ url }: { url: string }) {
  return null;
}
