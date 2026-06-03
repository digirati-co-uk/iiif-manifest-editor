import { useCallback } from "react";
import {
  useLayoutActions,
  useLayoutState,
  useLocalStorage,
} from "@manifest-editor/shell";
import type { PresetUrlSearchParamsPreset } from "./exhibition-preview-url-helper";

export const exhibitionRemotePreviewPanelId =
  "@exhibitions/remote-preview-panel";

export const defaultExhibitionPreviewPreset: PresetUrlSearchParamsPreset =
  "exhibition";

export const exhibitionPreviewPresetStorageKey = "exhibition-preview-preset";

export const exhibitionPreviewPresetOptions: Array<{
  value: PresetUrlSearchParamsPreset;
  label: string;
}> = [
  { value: "exhibition", label: "Full page" },
  { value: "scroll", label: "Scroll" },
  { value: "slideshow", label: "Slideshow" },
];

export function useExhibitionPreviewPreset() {
  const [storedPreset, setStoredPreset] =
    useLocalStorage<PresetUrlSearchParamsPreset>(
      exhibitionPreviewPresetStorageKey,
      defaultExhibitionPreviewPreset,
    );
  const { centerPanel } = useLayoutState();
  const { centerPanel: centerPanelActions } = useLayoutActions();

  const previewPreset = storedPreset || defaultExhibitionPreviewPreset;

  const setPreviewPreset = useCallback(
    (preset: PresetUrlSearchParamsPreset) => {
      setStoredPreset(preset);

      if (centerPanel.current === exhibitionRemotePreviewPanelId) {
        centerPanelActions.open({
          id: exhibitionRemotePreviewPanelId,
          state: { preset },
        });
      }
    },
    [centerPanel.current, centerPanelActions, setStoredPreset],
  );

  return [previewPreset, setPreviewPreset] as const;
}
