import * as ManifestPreset from "@manifest-editor/manifest-preset";
import { extendApp, mapApp } from "@manifest-editor/shell";
import "./index.css";
import { tourStepAnnotations } from "./annotations/TourStepAnnotations";
import { imageBlockEditor } from "./canvas-editors/image-block-editor";
import { infoBlockEditor } from "./canvas-editors/info-block-editor";
import { youtubeMainEdtior } from "./canvas-editors/youtube-editor";
import {
  imageSlideBottomCreator,
  imageSlideCreator,
  imageSlideLeftCreator,
  imageSlideRightCreator,
} from "./creators/image-slide-creator";
import { infoBoxCreator } from "./creators/info-box-creator";
import { youtubeSlideCreator } from "./creators/youtube-slide-creator";
import { exhibitionGridLeftPanel } from "./left-panels/ExhibitionGrid";
import { customBehaviourEditor } from "./left-panels/SlideBehaviours";
import { exhibitionCanvasEditor } from "./right-panels/ExhibitionCanvasEditor";
import { exhibitionSummaryEdtior } from "./right-panels/ExhibitionSummaryEditor";
import { exhibitionTourSteps } from "./right-panels/ExhibitionTourSteps";

export const exhibitionEditorPreset = extendApp(
  mapApp(ManifestPreset),
  {
    id: "exhibition-editor",
    title: "Exhibition Editor",
    project: true,
    projectType: "Manifest",
  },
  {
    config: {
      editorConfig: {
        Canvas: {
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
      exhibitionGridLeftPanel,
    ],
    annotations: [
      //
      tourStepAnnotations,
    ],
    leftPanelIds: ["left-panel-manifest"],
    canvasEditors: [
      //
      imageBlockEditor,
      youtubeMainEdtior,
      infoBlockEditor,
    ],
    editors: [
      exhibitionCanvasEditor,
      customBehaviourEditor,
      exhibitionSummaryEdtior,
      exhibitionTourSteps,
    ],
    creators: [
      infoBoxCreator,
      imageSlideBottomCreator,
      imageSlideCreator,
      imageSlideLeftCreator,
      imageSlideRightCreator,
      youtubeSlideCreator,
    ],
  },
);
