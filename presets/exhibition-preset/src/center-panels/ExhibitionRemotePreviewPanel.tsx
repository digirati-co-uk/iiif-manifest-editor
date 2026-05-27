import type { LayoutPanel } from "@manifest-editor/shell";
import { ExhibitionPreviewPanel } from "../components/ExhibitionPreviewPanel";
import type { PresetUrlSearchParamsPreset } from "../helpers/exhibition-preview-url-helper";
import { PreviewIcon } from "../icons/PreviewIcon";

export type ExhibitionRemotePreviewPanelState = {
  preset?: PresetUrlSearchParamsPreset;
};

export const defaultExhibitionRemotePreviewPreset: PresetUrlSearchParamsPreset =
  "exhibition";

export const exhibitionRemotePreviewPanel: LayoutPanel = {
  id: "@exhibitions/remote-preview-panel",
  label: "Exhibition preview",
  icon: <PreviewIcon />,
  defaultState: {
    preset: defaultExhibitionRemotePreviewPreset,
  } satisfies ExhibitionRemotePreviewPanelState,
  render: (state: ExhibitionRemotePreviewPanelState) => (
    <ExhibitionPreviewPanel
      preset={state.preset || defaultExhibitionRemotePreviewPreset}
      focusSelectedCanvas={false}
    />
  ),
  options: {
    minWidth: 350,
  },
};
