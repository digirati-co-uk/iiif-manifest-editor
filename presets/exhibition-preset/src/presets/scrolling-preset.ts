import * as ManifestPreset from "@manifest-editor/manifest-preset";
import { extendApp, mapApp } from "@manifest-editor/shell";
import { imageBrowserSlideCreator } from "../creators/image-browser-slide-creator";
import { imageServiceSlideCreator } from "../creators/image-service-slide-creator";
import { imageSlideCreator } from "../creators/image-slide-creator";
import { imageUrlSlideCreator } from "../creators/image-url-slide";
import { infoBoxCreator } from "../creators/info-box-creator";
import { videoSlideCreator } from "../creators/video-slide-creator";
import { youtubeSlideCreator } from "../creators/youtube-slide-creator";
import { exhibitionCanvasEditor } from "../right-panels/ExhibitionCanvasEditor";
import { exhibitionSummaryEdtior } from "../right-panels/ExhibitionSummaryEditor";
import { exhibitionTourSteps } from "../right-panels/ExhibitionTourSteps";
import { exhibitionWorkbenchEditor } from "../right-panels/ExhibitionWorkbenchEditor";
import { infoBoxWorkbenchEditor } from "../right-panels/InfoBoxPanel";
import { customBehaviourEditor } from "../right-panels/SlideBehaviours";

export const exhibitionEditorScrollingPreset = extendApp(
  mapApp(ManifestPreset),
  {
    id: "exhibition-scrolling-editor",
    title: "Exhibition Editor (scrolling)",
    project: true,
    projectType: "Manifest",
  },
  {
    config: {
      editorConfig: {},
    },
    leftPanels: [
      //
    ],
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
      customBehaviourEditor,
      exhibitionSummaryEdtior,
      exhibitionTourSteps,
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
  },
);
