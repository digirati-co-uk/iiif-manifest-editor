import type { LayoutPanel } from "@manifest-editor/shell";
import { ExhibitionPreviewPanel } from "../components/ExhibitionPreviewPanel";
import {
  defaultExhibitionPreviewPreset,
  exhibitionRemotePreviewPanelId,
  useExhibitionPreviewPreset,
} from "../helpers/exhibition-preview-state";
import type { PresetUrlSearchParamsPreset } from "../helpers/exhibition-preview-url-helper";
import { PreviewIcon } from "../icons/PreviewIcon";

export type ExhibitionRemotePreviewPanelState = {
  preset?: PresetUrlSearchParamsPreset;
};

export const defaultExhibitionRemotePreviewPreset: PresetUrlSearchParamsPreset =
  defaultExhibitionPreviewPreset;

export const exhibitionRemotePreviewPanel: LayoutPanel = {
  id: exhibitionRemotePreviewPanelId,
  label: "Exhibition preview",
  icon: <PreviewIcon />,
  defaultState: {} satisfies ExhibitionRemotePreviewPanelState,
  render: (state: ExhibitionRemotePreviewPanelState) => (
    <ExhibitionRemotePreviewPanel state={state} />
  ),
  options: {
    minWidth: 350,
  },
};

function ExhibitionRemotePreviewPanel({
  state,
}: {
  state: ExhibitionRemotePreviewPanelState;
}) {
  const [storedPreset] = useExhibitionPreviewPreset();

  return (
    <ExhibitionPreviewPanel
      preset={
        state.preset || storedPreset || defaultExhibitionRemotePreviewPreset
      }
      focusSelectedCanvas={false}
    />
  );
}
