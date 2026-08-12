import type { CreatorResourceProbeHelpers } from "@manifest-editor/creator-api";
import { isSupportedDigitalCollectionPage } from "iiif-browser/digital-collections";

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function getJsonResource(value: string, helpers: CreatorResourceProbeHelpers) {
  if (!isHttpUrl(value)) return null;
  try {
    return await helpers.json(value);
  } catch {
    return null;
  }
}

export function getIIIFType(resource: any) {
  const type = resource?.type || resource?.["@type"];
  if (type === "sc:Manifest") return "Manifest";
  if (type === "sc:Collection") return "Collection";
  return type;
}

export function isImageService(resource: any) {
  const type = getIIIFType(resource);
  return (
    resource?.protocol === "http://iiif.io/api/image" ||
    type === "ImageService" ||
    (typeof type === "string" && type.startsWith("ImageService"))
  );
}

export async function isDigitalCollectionPage(value: string) {
  return isHttpUrl(value) && (await isSupportedDigitalCollectionPage(value));
}

export async function getContentType(value: string, helpers: CreatorResourceProbeHelpers) {
  try {
    return await helpers.contentType(value);
  } catch {
    return "";
  }
}

export function matchesExtension(value: string, extensions: string[]) {
  const pathname = new URL(value).pathname.toLowerCase();
  return extensions.some((extension) => pathname.endsWith(extension));
}
