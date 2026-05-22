import * as ManifestPreset from "@manifest-editor/manifest-preset";
import { extendApp, mapApp } from "@manifest-editor/shell";
import { tourStepAnnotations } from "../annotations/TourStepAnnotations";
import { exhibitionBackgroundTask } from "../background-panel";
import { slideshowCanvasEditor } from "../canvas-editors/slideshow-canvas-editor";
import { slideshowCenterPanel } from "../center-panels/SlideshowCenterPanel";
import {
  slideshowImageOnlyCreator,
  slideshowImageTextCreator,
} from "../creators/image-slide-creator";
import { slideshowLongEditorialCreator } from "../creators/info-box-creator";
import { slideshowVideoCreator } from "../creators/video-slide-creator";
import { slideshowYoutubeCreator } from "../creators/youtube-slide-creator";
import { slideshowGridLeftPanel } from "../left-panels/ExhibitionGrid";
import { exhibitionOverviewLeftPanel } from "../left-panels/ExhibitionOverview";
import { exhibitionCanvasEditor } from "../right-panels/ExhibitionCanvasEditor";
import { exhibitionSummaryEdtior } from "../right-panels/ExhibitionSummaryEditor";
import { exhibitionTourSteps } from "../right-panels/ExhibitionTourSteps";
import { slideshowWorkbenchEditor } from "../right-panels/ExhibitionWorkbenchEditor";
import { customBehaviourEditor } from "../right-panels/SlideBehaviours";

export const exhibitionEditorSlideshowPreset = extendApp(
  mapApp(ManifestPreset),
  {
    id: "exhibition-slideshow-editor",
    title: "Exhibition Editor (slideshow)",
    project: true,
    projectType: "Manifest",
  },
  {
    config: {
      editorConfig: {
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
      exhibitionOverviewLeftPanel,
    ],
    centerPanels: [
      //
      slideshowCenterPanel,
    ],
    annotations: [
      //
      tourStepAnnotations,
    ],
    leftPanelIds: ["left-panel-manifest"],
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
      exhibitionCanvasEditor,
      customBehaviourEditor,
      exhibitionSummaryEdtior,
      exhibitionTourSteps,
    ],
    creators: [
      slideshowImageOnlyCreator,
      slideshowImageTextCreator,
      slideshowVideoCreator,
      slideshowYoutubeCreator,
      slideshowLongEditorialCreator,
    ],
  },
);
