import { allCreators } from "@manifest-editor/creators";
import { allEditors, CanvasPanelEditor } from "@manifest-editor/editors";
import * as ocrClassificationPlugin from "@manifest-editor/ocr-classification";
import * as ocrDoclingPlugin from "@manifest-editor/ocr-docling";
import {
  type AnnotationPanel,
  type BackgroundActionDefinition,
  type BackgroundPanel,
  baseCreator,
  baseEditor,
  ExportPanel,
  type LayoutPanel,
} from "@manifest-editor/shell";
import { canvasAnnotations } from "./annotations/CanvasAnnotations";
import { demoBackgroundActions } from "./background-actions";
import { manifestOverview } from "./center-panels/manifest-overview";
import { rangeWorkbench } from "./center-panels/range-workbench";
import { contextMenus } from "./context-menus";
import { annotationsPanel } from "./left-panels/annotations";
import { canvasListing } from "./left-panels/canvas-listing";
import { manifestPanel } from "./left-panels/manifest";
import { rangesPanel } from "./left-panels/range-listing";
import * as manifestQualityChecksPlugin from "./plugins/manifest-quality-checks";
import { queryStringTask } from "./query-string";
import "./index.css";

export default { id: "manifest-editor", title: "Manifest Editor", project: true, projectType: "Manifest" };

export const centerPanels: LayoutPanel[] = [
  manifestOverview,
  {
    id: "current-canvas",
    label: "Current canvas",
    icon: "",
    render: (state, { actions }) => <CanvasPanelEditor />,
  },
  rangeWorkbench,
  {
    id: "export",
    label: "Export",
    icon: "",
    render: () => <ExportPanel />,
  },
];

export const leftPanels: LayoutPanel[] = [
  manifestPanel,
  canvasListing,
  rangesPanel,
  annotationsPanel,
  // @todo we will come back to the image grid
  // {
  //   id: "image-grid",
  //   label: "Image grid",
  //   render: () => <ManifestItemsGrid />,
  // },
];

export const annotations: AnnotationPanel[] = [canvasAnnotations];

export const background: BackgroundPanel[] = [contextMenus, queryStringTask];

export const backgroundActions: BackgroundActionDefinition[] = demoBackgroundActions;

export const rightPanels: LayoutPanel[] = [baseEditor];

export const modals: LayoutPanel[] = [baseCreator];

export const editors = allEditors;

export const creators = allCreators;

export const resources = ["Manifest", "Canvas", "ContentResource", "Agent", "AnnotationPage", "Annotation", "Range"];

export { manifestQualityChecksPlugin };
export { ocrClassificationPlugin };
export { ocrDoclingPlugin };

export const plugins = [manifestQualityChecksPlugin, ocrClassificationPlugin, ocrDoclingPlugin];
