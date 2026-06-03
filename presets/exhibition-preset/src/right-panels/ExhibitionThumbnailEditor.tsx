import { createImageServiceRequest, imageServiceRequestToString } from "@iiif/parser/image-3";
import type { ImageService } from "@iiif/presentation-3";
import { ActionButton, AddIcon } from "@manifest-editor/components";
import { createAppActions, InputContainer, LinkingPropertyList } from "@manifest-editor/editors";
import { useCreator, useEditingResource, useEditor, useInlineCreator } from "@manifest-editor/shell";
import { useEffect, useMemo, useState } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
import { getPaintingAnnotations, getResolvedAnnotationBody } from "../slideshow-content-positioning";

type ThumbnailCandidate = {
  id: string;
  label: string;
  imageId?: string;
  service: ImageService;
};

export function ExhibitionThumbnailEditor() {
  const canvas = useCanvas();
  const resource = useEditingResource();
  const thumbnailCreator = useInlineCreator();
  const [canCreateThumbnail, thumbnailActions] = useCreator(resource?.resource.source, "thumbnail", "ContentResource");
  const { descriptive } = useEditor();
  const { thumbnail } = descriptive;
  const thumbnails = thumbnail.get() || [];
  const vault = useVault();
  const thumbnailCandidates = useMemo(() => (canvas ? getThumbnailCandidates(vault, canvas) : []), [canvas, vault]);

  if (!canvas || !resource) {
    return null;
  }

  return !thumbnails.length && thumbnailCandidates.length ? (
    <QuickThumbnailFromCanvasImages
      candidates={thumbnailCandidates}
      canCreateThumbnail={canCreateThumbnail}
      onCreateThumbnail={() => thumbnailActions.create()}
      onAddThumbnail={({ service, width, height }) =>
        thumbnailCreator.create(
          "@manifest-editor/thumbnail-image",
          { service, width, height },
          thumbnailCreatorParent(canvas),
        )
      }
    />
  ) : (
    <LinkingPropertyList
      containerId={thumbnail.containerId()}
      label="Thumbnail"
      property="thumbnail"
      items={thumbnails}
      singleMode
      reorder={(ctx) => thumbnail.reorder(ctx.startIndex, ctx.endIndex)}
      createActions={createAppActions(thumbnail)}
      creationType="ContentResource"
      emptyLabel="No thumbnail"
      parent={resource.resource}
    />
  );
}

function QuickThumbnailFromCanvasImages({
  candidates,
  canCreateThumbnail,
  onCreateThumbnail,
  onAddThumbnail,
}: {
  candidates: ThumbnailCandidate[];
  canCreateThumbnail: boolean;
  onCreateThumbnail: () => void;
  onAddThumbnail: (payload: { service: ImageService; width: number; height?: number }) => void;
}) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedSizeValue, setSelectedSizeValue] = useState<string>("");
  const [serviceInfo, setServiceInfo] = useState<Record<string, ImageService | null>>({});
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) || candidates[0];
  const selectedServiceInfo = selectedCandidate ? serviceInfo[selectedCandidate.id] : undefined;
  const selectedService = selectedCandidate
    ? selectedServiceInfo === null
      ? null
      : selectedServiceInfo || selectedCandidate.service
    : null;
  const sizes = selectedService ? getServiceSizes(selectedService) : [];
  const defaultSize = getClosestThumbnailSize(sizes, 350);
  const selectedSize = sizes.find((size) => sizeToValue(size) === selectedSizeValue) || defaultSize;
  const previewUrl = selectedService && selectedSize ? serviceImageAtSize(selectedService, selectedSize) : null;
  const isFetchingSizes =
    selectedCandidate && !selectedCandidate.service.sizes?.length && !(selectedCandidate.id in serviceInfo);

  useEffect(() => {
    if (!selectedCandidateId && candidates[0]) {
      setSelectedCandidateId(candidates[0].id);
    }
  }, [candidates, selectedCandidateId]);

  useEffect(() => {
    const missing = candidates.filter((candidate) => {
      const service = candidate.service;
      return !service.sizes?.length && getServiceId(service) && !(candidate.id in serviceInfo);
    });

    for (const candidate of missing) {
      const serviceId = getServiceId(candidate.service);
      if (!serviceId) continue;

      fetch(getServiceInfoUrl(serviceId))
        .then((response) => (response.ok ? response.json() : null))
        .then((info) => {
          setServiceInfo((current) => ({
            ...current,
            [candidate.id]: info ? { ...candidate.service, ...info } : null,
          }));
        })
        .catch(() => {
          setServiceInfo((current) => ({ ...current, [candidate.id]: null }));
        });
    }
  }, [candidates, serviceInfo]);

  useEffect(() => {
    if (defaultSize && !sizes.some((size) => sizeToValue(size) === selectedSizeValue)) {
      setSelectedSizeValue(sizeToValue(defaultSize));
    }
  }, [defaultSize, selectedSizeValue, sizes]);

  return (
    <InputContainer $wide>
      <div className="rounded-md border border-[#dcd5ce] bg-[#f8f6f3] p-4">
        <div className="text-sm font-semibold text-[#25211f]">Thumbnail</div>
        <div className="mt-1 text-sm text-[#6a625c]">Use an image service from this canvas to add a thumbnail.</div>

        {candidates.length > 1 ? (
          <div className="mt-3">
            <label className="text-xs font-semibold uppercase text-[#6a625c]" htmlFor="thumbnail-source-image">
              Image
            </label>
            <select
              id="thumbnail-source-image"
              className="mt-1 w-full rounded-md border border-[#dcd5ce] bg-white px-3 py-2 text-sm"
              value={selectedCandidate?.id || ""}
              onChange={(event) => {
                setSelectedCandidateId(event.currentTarget.value);
                setSelectedSizeValue("");
              }}
            >
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {sizes.length ? (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((size) => {
                const value = sizeToValue(size);
                const selected = selectedSize ? value === sizeToValue(selectedSize) : false;

                return (
                  <button
                    key={value}
                    type="button"
                    className="rounded-md border px-2 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: selected ? "#b84c74" : "#ffffff",
                      borderColor: selected ? "#b84c74" : "#dcd5ce",
                      color: selected ? "#ffffff" : "#332f2c",
                    }}
                    onClick={() => setSelectedSizeValue(value)}
                  >
                    {size.width}x{size.height}
                  </button>
                );
              })}
            </div>

            {previewUrl ? (
              <div className="mt-3 overflow-hidden rounded-md border border-[#dcd5ce] bg-white">
                <img src={previewUrl} alt="" className="max-h-40 w-full object-contain" />
              </div>
            ) : null}

            <button
              type="button"
              className="mt-3 rounded-md px-3 py-2 text-sm font-semibold shadow-sm"
              style={{
                backgroundColor: "#b84c74",
                border: "1px solid #a13e63",
                color: "#ffffff",
              }}
              disabled={!previewUrl || !selectedSize}
              onClick={() => {
                if (!selectedService || !selectedSize) return;
                onAddThumbnail({
                  service: selectedService,
                  width: selectedSize.width,
                  height: selectedSize.height,
                });
              }}
            >
              Add thumbnail from image
            </button>
          </>
        ) : isFetchingSizes ? (
          <div className="mt-3 text-sm text-[#6a625c]">Finding available sizes...</div>
        ) : (
          <div className="mt-3 text-sm text-[#6a625c]">No fixed thumbnail sizes were found for this image service.</div>
        )}
        {canCreateThumbnail ? (
          <div className="mt-4 border-t border-[#dcd5ce] pt-3">
            <ActionButton onPress={onCreateThumbnail}>
              <AddIcon /> Create thumbnail
            </ActionButton>
          </div>
        ) : null}
      </div>
    </InputContainer>
  );
}

function thumbnailCreatorParent(canvas: any) {
  return {
    parent: {
      property: "thumbnail",
      resource: { id: canvas.id, type: "Canvas" },
    },
  };
}

function getThumbnailCandidates(vault: any, canvas: any): ThumbnailCandidate[] {
  const candidates: ThumbnailCandidate[] = [];
  const seen = new Set<string>();
  const annotations = getPaintingAnnotations(vault, canvas);

  annotations.forEach((annotation: any, index: number) => {
    const body = getResolvedAnnotationBody(vault, annotation);
    const images = collectImageResources(vault, body);

    images.forEach((image, imageIndex) => {
      const service = getImageService(image);
      const serviceId = service ? getServiceId(service) : "";
      if (!service || !serviceId || seen.has(serviceId)) {
        return;
      }

      seen.add(serviceId);
      candidates.push({
        id: `${annotation.id || index}-${image.id || serviceId}-${imageIndex}`,
        label:
          getLanguageMapText(image.label) || getLanguageMapText(annotation.label) || `Image ${candidates.length + 1}`,
        imageId: image.id,
        service,
      });
    });
  });

  return candidates;
}

function collectImageResources(vault: any, resource: any): any[] {
  const resolved = resolveResource(vault, resource);

  if (!resolved) {
    return [];
  }

  if (resolved.type === "Choice" && Array.isArray(resolved.items)) {
    return resolved.items.flatMap((item: any) => collectImageResources(vault, item));
  }

  if (resolved.type === "SpecificResource") {
    return collectImageResources(vault, resolved.source);
  }

  if (resolved.type === "Canvas") {
    return getPaintingAnnotations(vault, resolved).flatMap((annotation: any) =>
      collectImageResources(vault, getResolvedAnnotationBody(vault, annotation)),
    );
  }

  return getImageService(resolved) ? [resolved] : [];
}

function resolveResource(vault: any, resource: any): any {
  if (!resource) return null;
  if (resource.id && !resource.service && !resource.items && !resource.value) {
    return vault.get(resource as any, { skipSelfReturn: false } as any) || resource;
  }
  return resource;
}

function getImageService(resource: any): ImageService | null {
  const services = Array.isArray(resource?.service) ? resource.service : resource?.service ? [resource.service] : [];

  return (
    services.find((service: any) => {
      const profile = Array.isArray(service.profile) ? service.profile.join(" ") : service.profile || "";
      const type = service.type || service["@type"] || "";
      return type.includes("ImageService") || profile.includes("level") || profile.includes("iiif.io/api/image");
    }) || null
  );
}

function getServiceId(service: ImageService): string {
  return ((service as any).id || (service as any)["@id"] || "").replace(/\/info\.json$/, "");
}

function getServiceInfoUrl(serviceId: string): string {
  return serviceId.endsWith("/info.json") ? serviceId : `${serviceId.replace(/\/$/, "")}/info.json`;
}

function getServiceSizes(service: ImageService): Array<{ width: number; height: number }> {
  const sizes = Array.isArray(service.sizes)
    ? service.sizes
        .filter((size: any) => Number(size.width) && Number(size.height))
        .map((size: any) => ({
          width: Number(size.width),
          height: Number(size.height),
        }))
    : [];

  if (sizes.length) {
    return sizes.sort((a, b) => a.width - b.width).slice(0, 8);
  }

  const width = Number(service.width);
  const height = Number(service.height);
  if (!width || !height) {
    return [];
  }

  return [256, 512, 1024]
    .filter((targetWidth) => targetWidth < width)
    .map((targetWidth) => ({
      width: targetWidth,
      height: Math.round((height / width) * targetWidth),
    }))
    .concat([{ width, height }])
    .slice(0, 4);
}

function sizeToValue(size: { width: number; height?: number }) {
  return `${size.width},${size.height || ""}`;
}

function getClosestThumbnailSize(sizes: Array<{ width: number; height: number }>, target: number) {
  return sizes.reduce<(typeof sizes)[number] | undefined>((closest, size) => {
    if (!closest) return size;

    const currentDistance = Math.hypot(size.width - target, size.height - target);
    const closestDistance = Math.hypot(closest.width - target, closest.height - target);

    return currentDistance < closestDistance ? size : closest;
  }, undefined);
}

function serviceImageAtSize(service: ImageService, size: { width: number; height?: number }) {
  const normalisedService = { ...service } as any;
  if (normalisedService["@id"]) {
    normalisedService.id = normalisedService["@id"];
  }
  if (normalisedService["@type"]) {
    normalisedService.type = normalisedService["@type"];
  }

  const request = createImageServiceRequest(normalisedService);

  return imageServiceRequestToString({
    identifier: request.identifier,
    server: request.server,
    scheme: request.scheme,
    type: "image",
    size: {
      max: false,
      confined: false,
      upscaled: false,
      width: size.width,
      height: size.height,
    },
    format: "jpg",
    region: { full: true },
    rotation: { angle: 0 },
    quality: "default",
    prefix: request.prefix,
    originalPath: (request as any).originalPath,
  });
}

function getLanguageMapText(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(" ");

  if (typeof value === "object") {
    const values = Object.values(value).flatMap((item) => (Array.isArray(item) ? item : [item]));

    return values.filter((item): item is string => typeof item === "string").join(" ");
  }

  return "";
}
