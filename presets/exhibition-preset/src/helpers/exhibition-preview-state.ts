import { useExhibitionTemplate } from "./exhibition-template";
import type { PresetUrlSearchParamsPreset } from "./exhibition-preview-url-helper";

export const exhibitionRemotePreviewPanelId =
  "@exhibitions/remote-preview-panel";

export function useConfiguredExhibitionPreviewPreset() {
  const selectedTemplate = useExhibitionTemplate();

  switch (selectedTemplate?.type) {
    case "slideshow":
      return "slideshow" satisfies PresetUrlSearchParamsPreset;
    case "scroll":
      return "scroll" satisfies PresetUrlSearchParamsPreset;
    case "fullpage":
    default:
      return "exhibition" satisfies PresetUrlSearchParamsPreset;
  }
}
