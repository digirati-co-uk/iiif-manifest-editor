import { exhibitionNotebookConfig } from "../notebook-config";
import * as ManifestPreset from "@manifest-editor/manifest-preset";
import { extendApp, mapApp, NOTEBOOK_PANEL_ID } from "@manifest-editor/shell";
import { imageBrowserSlideCreator, keepIIIFBrowserNested } from "../creators/image-browser-slide-creator";
import { imageServiceSlideCreator } from "../creators/image-service-slide-creator";
import { imageSlideCreator } from "../creators/image-slide-creator";
import { imageUrlSlideCreator } from "../creators/image-url-slide";
import { infoBoxCreator } from "../creators/info-box-creator";
import { videoSlideCreator } from "../creators/video-slide-creator";
import { exhibitionPresetConfig } from "../exhibition-onboarding";
import { youtubeSlideCreator } from "../creators/youtube-slide-creator";
import { scrollGridLeftPanel } from "../left-panels/ExhibitionGrid";
import { exhibitionThemeLeftPanel } from "../left-panels/ExhibitionTheme";
import { exhibitionImagesEditor } from "../right-panels/ExhibitionImagesEditor";
import { exhibitionCanvasEditor } from "../right-panels/ExhibitionCanvasEditor";
import { exhibitionSummaryEdtior } from "../right-panels/ExhibitionSummaryEditor";
import { exhibitionTourSteps } from "../right-panels/ExhibitionTourSteps";
import { exhibitionWorkbenchEditor } from "../right-panels/ExhibitionWorkbenchEditor";
import { infoBoxWorkbenchEditor } from "../right-panels/InfoBoxPanel";
import { customBehaviourEditor } from "../right-panels/SlideBehaviours";
import { STANDARD_METADATA_EDITOR_ID } from "../metadata/ExhibitionMetadataPanel";
import { exhibitionManifestMetadataEditor } from "../right-panels/ExhibitionManifestMetadataEditor";

export const exhibitionEditorScrollingPreset = extendApp(
  mapApp(ManifestPreset, (app) => ({
    ...app,
    layout: {
      ...app.layout,
      creators: app.layout.creators?.map((creator) =>
        creator.id === "@manifest-editor/iiif-browser-creator" ? keepIIIFBrowserNested(creator) : creator
      ),
    },
  })),
  {
    id: "exhibition-scrolling-editor",
    title: "Exhibition Editor (scrolling)",
    project: true,
    projectType: "Manifest",
  },
  {
    preset: exhibitionPresetConfig,
    config: {
      notebook: exhibitionNotebookConfig,
      editorConfig: {
        // The exhibition metadata tab replaces the stock metadata tab.
        Manifest: { hideTabs: [STANDARD_METADATA_EDITOR_ID] },
        Canvas: { hideTabs: [STANDARD_METADATA_EDITOR_ID] },
      },
    },
    leftPanels: [
      //
      scrollGridLeftPanel,
      exhibitionThemeLeftPanel,
    ],
    leftPanelIds: ["left-panel-manifest", NOTEBOOK_PANEL_ID],
    centerPanels: [
      //
    ],
    annotations: [
      //
    ],
    // leftPanelIds: ["left-panel-manifest"],
    background: [
      //
    ],
    canvasEditors: [
      //
    ],
    editors: [
      //
      infoBoxWorkbenchEditor,
      exhibitionWorkbenchEditor,
      exhibitionCanvasEditor,
      exhibitionImagesEditor,
      customBehaviourEditor,
      exhibitionSummaryEdtior,
      exhibitionTourSteps,
      exhibitionManifestMetadataEditor,
    ],
    creators: [
      infoBoxCreator,
      youtubeSlideCreator,
      imageServiceSlideCreator,
      imageBrowserSlideCreator,
      imageSlideCreator,
      imageUrlSlideCreator,
      videoSlideCreator,
    ],
  }
);
