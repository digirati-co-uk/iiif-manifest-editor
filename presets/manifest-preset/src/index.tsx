import * as annotationsPlugin from "@manifest-editor/annotations";
import * as canvasLabelGeneratorPlugin from "@manifest-editor/canvas-label-generator";
import { allCreators } from "@manifest-editor/creators";
import { allEditors, CanvasPanelEditor } from "@manifest-editor/editors";
import * as ocrClassificationPlugin from "@manifest-editor/ocr-classification";
import * as ocrDoclingPlugin from "@manifest-editor/ocr-docling";

import {
  type BackgroundActionDefinition,
  type BackgroundPanel,
  baseCreator,
  baseEditor,
  type LayoutPanel,
} from "@manifest-editor/shell";
import * as translationPlugin from "@manifest-editor/translation";
import { createBulkThumbnailBuilderBackgroundAction } from "./bulk-thumbnail-builder/background-action";
import { manifestOverview } from "./center-panels/manifest-overview";
import { rangeWorkbench } from "./center-panels/range-workbench";
import { contextMenus } from "./context-menus";
import { canvasListing } from "./left-panels/canvas-listing";
import { manifestPanel } from "./left-panels/manifest";
import { rangesPanel } from "./left-panels/range-listing";
import { tagsPanel } from "./left-panels/tags";
import { CanvasesListIcon } from "./icons";
import * as avRangesPlugin from "./plugins/av-ranges";
import * as manifestQualityChecksPlugin from "./plugins/manifest-quality-checks";
import { queryStringTask } from "./query-string";
import "./index.css";

export default {
  id: "manifest-editor",
  title: "Manifest Editor",
  project: true,
  projectType: "Manifest",
};

export const centerPanels: LayoutPanel[] = [
  manifestOverview,
  {
    id: "current-canvas",
    label: "Current canvas",
    icon: <CanvasesListIcon />,
    render: (state, { actions }) => <CanvasPanelEditor />,
  },
  rangeWorkbench,
];

export const leftPanels: LayoutPanel[] = [
  manifestPanel,
  canvasListing,
  tagsPanel,
  rangesPanel,
  // @todo we will come back to the image grid
  // {
  //   id: "image-grid",
  //   label: "Image grid",
  //   render: () => <ManifestItemsGrid />,
  // },
];

export const background: BackgroundPanel[] = [contextMenus, queryStringTask];

export const backgroundActions: BackgroundActionDefinition[] = [
  createBulkThumbnailBuilderBackgroundAction(),
];

export const rightPanels: LayoutPanel[] = [baseEditor];

export const modals: LayoutPanel[] = [baseCreator];

export const editors = allEditors;

export const creators = allCreators;

export const resources = [
  "Manifest",
  "Canvas",
  "ContentResource",
  "Agent",
  "AnnotationPage",
  "Annotation",
  "Range",
];

export {
  annotationsPlugin,
  avRangesPlugin,
  canvasLabelGeneratorPlugin,
  manifestQualityChecksPlugin,
  ocrClassificationPlugin,
  ocrDoclingPlugin,
  translationPlugin,
};

export const plugins = [
  annotationsPlugin,
  avRangesPlugin,
  manifestQualityChecksPlugin,
  canvasLabelGeneratorPlugin,
  translationPlugin,
  ocrClassificationPlugin,
  ocrDoclingPlugin,
];
