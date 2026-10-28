import type { CreatorValidationMessage } from "@manifest-editor/creator-api";

/** Only known first-party failures are mapped. Technical/third-party errors retain shell handling. */
export function creatorValidationError(error: unknown): CreatorValidationMessage | undefined {
  if (!(error instanceof Error)) return undefined;
  const keys: Record<string, string> = {
    "Enter an absolute HTTP or HTTPS URL for the WebVTT file.": "vttUrl",
    "WebVTT captions must belong to a Canvas.": "vttCanvas",
    "Could not load the image service": "service",
    "Could not find Manifest": "manifest",
    "Could not find Manifest ID": "manifest",
    "Manifest not found": "manifest",
    "Collection not found": "collection",
    "Canvas not found": "canvas",
  };
  const key = keys[error.message];
  return key ? { code: key, message: { namespace: "creators", key: `errors.${key}` } } : undefined;
}
