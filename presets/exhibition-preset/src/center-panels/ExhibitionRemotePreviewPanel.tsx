import type { LayoutPanel } from "@manifest-editor/shell";
import { ExhibitionPreviewPanel } from "../components/ExhibitionPreviewPanel";
import {
  exhibitionRemotePreviewPanelId,
  useExhibitionPreviewPreset,
} from "../helpers/exhibition-preview-state";
import type { PresetUrlSearchParamsPreset } from "../helpers/exhibition-preview-url-helper";
import { PreviewIcon } from "../icons/PreviewIcon";

export type ExhibitionRemotePreviewPanelState = {
  preset?: PresetUrlSearchParamsPreset;
};

export const defaultExhibitionRemotePreviewPreset: PresetUrlSearchParamsPreset =
  "exhibition";

export const exhibitionRemotePreviewPanel: LayoutPanel = {
  id: exhibitionRemotePreviewPanelId,
  label: "Exhibition preview",
  icon: <PreviewIcon />,
  defaultState: {} satisfies ExhibitionRemotePreviewPanelState,
  render: () => <ExhibitionRemotePreviewPanel />,
  options: {
    minWidth: 350,
  },
};

function ExhibitionRemotePreviewPanel() {
  const [previewPreset] = useExhibitionPreviewPreset();

  return (
    <ExhibitionPreviewPanel
      preset={previewPreset}
      focusSelectedCanvas={false}
    />
  );
}
