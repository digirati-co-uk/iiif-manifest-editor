import type { ToolMode } from "@manifest-editor/tools";
import type { ManifestEditorAiResourceSummary } from "./types";

export function detectManifestEditorMode(options: {
  rootResource: { id: string; type: string };
  creators: Array<{ id: string; tags?: string[] }>;
}): ToolMode {
  const hasExhibitionCreators = options.creators.some((creator) => {
    return creator.id.startsWith("@exhibitions/") || (creator.tags || []).includes("exhibition-slide");
  });

  if (hasExhibitionCreators && options.rootResource.type === "Manifest") {
    return "exhibition";
  }

  return "manifest";
}

export function getFirstLanguageValue(value: any): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : null;
  }

  if (typeof value === "object") {
    for (const languageValue of Object.values(value)) {
      const resolved = getFirstLanguageValue(languageValue);
      if (resolved) {
        return resolved;
      }
    }
  }

  return null;
}

export function summariseResource(resource: any): ManifestEditorAiResourceSummary {
  return {
    id: resource?.id || "",
    type: resource?.type || "Unknown",
    label: getFirstLanguageValue(resource?.label),
    summary: getFirstLanguageValue(resource?.summary),
    itemCount: Array.isArray(resource?.items) ? resource.items.length : undefined,
    structureCount: Array.isArray(resource?.structures) ? resource.structures.length : undefined,
    annotationCount: Array.isArray(resource?.annotations) ? resource.annotations.length : undefined,
    behavior: Array.isArray(resource?.behavior) ? resource.behavior : undefined,
  };
}

export function safeJsonStringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}
