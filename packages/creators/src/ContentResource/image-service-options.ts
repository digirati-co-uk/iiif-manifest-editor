import type { ImageService } from "@iiif/presentation-3";

export function normalizeImageService(service: ImageService): ImageService {
  const { "@id": legacyId, "@type": legacyType, ...info } = service;
  const version = `${service["@context"] || ""} ${service.profile || ""}`.match(
    /\/(?:image|image-api)\/([123])(?:[./])/
  );
  return {
    ...info,
    id: service.id || legacyId,
    type: service.type || legacyType || `ImageService${version?.[1] || "2"}`,
  } as ImageService;
}

/** Select embedded service metadata without changing the info used to create image URLs. */
export function compactImageService(
  service: ImageService,
  config: Record<string, unknown> = {},
  thumbnail = false
): ImageService {
  const fields: Array<keyof ImageService> = [];
  if (config.compact !== "compact") fields.push("width", "height");
  if (thumbnail || config.includeSizes === true) fields.push("sizes");
  if (thumbnail || config.includeTiles === true) fields.push("tiles");
  const normalized = normalizeImageService(service);
  return {
    id: normalized.id,
    type: normalized.type,
    profile: normalized.profile,
    ...Object.fromEntries(fields.filter((key) => normalized[key] !== undefined).map((key) => [key, normalized[key]])),
  };
}
