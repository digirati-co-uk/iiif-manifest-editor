import { useApp } from "@manifest-editor/shell";
import { useExhibitionTemplate } from "./exhibition-template";
import type { PresetUrlSearchParamsPreset } from "./exhibition-preview-url-helper";

export const exhibitionRemotePreviewPanelId = "@exhibitions/remote-preview-panel";

export function useConfiguredExhibitionPreviewPreset() {
  const selectedTemplate = useExhibitionTemplate();
  const app = useApp();

  const presetType =
    selectedTemplate?.type || (app.metadata.id === "exhibition-slideshow-editor" ? "slideshow" : undefined);
  switch (presetType) {
    case "slideshow":
      return "slideshow" satisfies PresetUrlSearchParamsPreset;
    case "scroll":
      return "scroll" satisfies PresetUrlSearchParamsPreset;
    case "fullpage":
    default:
      return "exhibition" satisfies PresetUrlSearchParamsPreset;
  }
}
