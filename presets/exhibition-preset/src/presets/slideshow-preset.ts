import { exhibitionNotebookConfig } from "../notebook-config";
import * as ManifestPreset from "@manifest-editor/manifest-preset";
import { extendApp, mapApp, NOTEBOOK_PANEL_ID } from "@manifest-editor/shell";
import { tourStepAnnotations } from "../annotations/TourStepAnnotations";
import { exhibitionBackgroundTask } from "../background-panel";
import { slideshowCanvasEditor } from "../canvas-editors/slideshow-canvas-editor";
import { slideshowCenterPanel } from "../center-panels/SlideshowCenterPanel";
import { imageBrowserSlideCreator } from "../creators/image-browser-slide-creator";
import { imageServiceSlideCreator } from "../creators/image-service-slide-creator";
import { slideshowImageOnlyCreator, slideshowImageTextCreator } from "../creators/image-slide-creator";
import { imageUrlSlideCreator } from "../creators/image-url-slide";
import { slideshowLongEditorialCreator } from "../creators/info-box-creator";
import { slideshowVideoCreator } from "../creators/video-slide-creator";
import { slideshowYoutubeCreator } from "../creators/youtube-slide-creator";
import { exhibitionPresetConfig } from "../exhibition-onboarding";
import { slideshowGridLeftPanel } from "../left-panels/ExhibitionGrid";
import { exhibitionOverviewLeftPanel } from "../left-panels/ExhibitionOverview";
import { exhibitionThemeLeftPanel } from "../left-panels/ExhibitionTheme";
import { exhibitionCanvasEditor } from "../right-panels/ExhibitionCanvasEditor";
import { exhibitionSummaryEdtior } from "../right-panels/ExhibitionSummaryEditor";
import { exhibitionTourSteps } from "../right-panels/ExhibitionTourSteps";
import { slideshowWorkbenchEditor } from "../right-panels/ExhibitionWorkbenchEditor";
import { infoBoxWorkbenchEditor } from "../right-panels/InfoBoxPanel";
import { customBehaviourEditor } from "../right-panels/SlideBehaviours";
import { STANDARD_METADATA_EDITOR_ID } from "../metadata/ExhibitionMetadataPanel";
import { exhibitionManifestMetadataEditor } from "../right-panels/ExhibitionManifestMetadataEditor";

export const exhibitionEditorSlideshowPreset = extendApp(
  mapApp(ManifestPreset),
  {
    id: "exhibition-slideshow-editor",
    title: "Exhibition Editor (slideshow)",
    project: true,
    projectType: "Manifest",
  },
  {
    preset: exhibitionPresetConfig,
    config: {
      notebook: exhibitionNotebookConfig,
      editorConfig: {
        // The exhibition metadata tab replaces the stock metadata tab (slide metadata is at the bottom of "Text content").
        Manifest: { hideTabs: [STANDARD_METADATA_EDITOR_ID] },
        Canvas: {
          singleTab: "@exhibition/slideshow-workbench-editor",
          hideTabs: [
            "@manifest-editor/overview",
            "@manifest-editor/technical-properties",
            "@manifest-editor/linking-properties",
            "@manifest-editor/nav-place-editor",
            "@manifest-editor/canvas-structural",
            "@manifest-editor/descriptive-properties",
            "@manifest-editor/overview-canvas-editor",
            "@manifest-editor/metadata",
          ],
        },
      },
    },
    leftPanels: [
      //
      slideshowGridLeftPanel,
      exhibitionThemeLeftPanel,
      // exhibitionOverviewLeftPanel,
    ],
    centerPanels: [
      //
      slideshowCenterPanel,
    ],
    annotations: [
      //
      tourStepAnnotations,
    ],
    leftPanelIds: ["left-panel-manifest", NOTEBOOK_PANEL_ID],
    background: [
      //
      exhibitionBackgroundTask,
    ],
    canvasEditors: [
      //
      slideshowCanvasEditor,
    ],
    editors: [
      //
      slideshowWorkbenchEditor,
      infoBoxWorkbenchEditor,
      exhibitionCanvasEditor,
      customBehaviourEditor,
      exhibitionSummaryEdtior,
      exhibitionTourSteps,
      exhibitionManifestMetadataEditor,
    ],
    creators: [
      imageBrowserSlideCreator,
      imageServiceSlideCreator,
      imageUrlSlideCreator,
      slideshowImageOnlyCreator,
      slideshowImageTextCreator,
      slideshowVideoCreator,
      slideshowYoutubeCreator,
      slideshowLongEditorialCreator,
    ],
  }
);
