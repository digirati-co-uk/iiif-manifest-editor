import type { LayoutPanel } from "@manifest-editor/shell";
import { useManifest } from "react-iiif-vault";
import { ExhibitionPreviewPanel } from "../components/ExhibitionPreviewPanel";
import {
  exhibitionRemotePreviewPanelId,
  useExhibitionPreviewPreset,
} from "../helpers/exhibition-preview-state";
import type {
  PresetUrlSearchParamsOptions,
  PresetUrlSearchParamsPreset,
} from "../helpers/exhibition-preview-url-helper";
import { PreviewIcon } from "../icons/PreviewIcon";
import {
  getThemeConfigFromServices,
  resolveThemeConfig,
} from "../theme/theme-service";

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
  const manifest = useManifest();
  const serviceTheme =
    getThemeConfigFromServices((manifest as any)?.service) ||
    getThemeConfigFromServices((manifest as any)?.services);
  const resolvedTheme = resolveThemeConfig(serviceTheme);
  let presetOptions: Partial<PresetUrlSearchParamsOptions>;

  if (previewPreset === "scroll") {
    presetOptions = {
      ignoreCanvasBackgrounds: resolvedTheme.scroll.options.ignoreCanvasBackgrounds,
      tableOfContentsPlacement: resolvedTheme.scroll.options.tableOfContentsPlacement,
    };
  } else if (previewPreset === "slideshow") {
    presetOptions = {
      ignoreCanvasBackgrounds: resolvedTheme.delft.slideshow.ignoreCanvasBackgrounds,
    };
  } else if (previewPreset === "presentation") {
    presetOptions = {
      cutCorners: resolvedTheme.delft.presentation.cutCorners,
      floatingPosition: resolvedTheme.delft.presentation.floatingPosition,
      ignoreCanvasBackgrounds: resolvedTheme.delft.presentation.ignoreCanvasBackgrounds,
      isFloating: resolvedTheme.delft.presentation.isFloating,
      labelOnlyFloating: resolvedTheme.delft.presentation.labelOnlyFloating,
    };
  } else {
    presetOptions = {
      cutCorners: resolvedTheme.delft.exhibition.cutCorners,
      fullTitleBar: resolvedTheme.delft.exhibition.fullTitleBar,
      hideTableOfContents: resolvedTheme.delft.exhibition.hideTableOfContents,
      ignoreCanvasBackgrounds: resolvedTheme.delft.exhibition.ignoreCanvasBackgrounds,
      showNavigationControls: resolvedTheme.delft.exhibition.showNavigationControls,
      showProgressBar: resolvedTheme.delft.exhibition.showProgressBar,
      tableOfContentsPlacement: resolvedTheme.delft.exhibition.tableOfContentsPlacement,
    };
  }

  return (
    <ExhibitionPreviewPanel
      preset={previewPreset}
      presetOptions={presetOptions}
      focusSelectedCanvas={false}
    />
  );
}
