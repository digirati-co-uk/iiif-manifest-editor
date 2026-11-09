import { manifestMessage } from "./i18n";
import * as annotationsPlugin from "@manifest-editor/annotations";
import * as canvasLabelGeneratorPlugin from "@manifest-editor/canvas-label-generator";
import { allCreators } from "@manifest-editor/creators";
import { allEditors, CanvasPanelEditor } from "@manifest-editor/editors";
import {
  type BackgroundActionDefinition,
  type BackgroundPanel,
  baseCreator,
  baseEditor,
  type LayoutPanel,
  type PluginInput,
  ProjectNotebookPanel,
  NotebookIcon,
  NOTEBOOK_PANEL_ID,
} from "@manifest-editor/shell";
import { createBulkThumbnailBuilderBackgroundAction } from "./bulk-thumbnail-builder/background-action";
import { manifestOverview } from "./center-panels/manifest-overview";
import { rangeWorkbench } from "./center-panels/range-workbench";
import { contextMenus } from "./context-menus";
import { CanvasesListIcon } from "./icons";
import { canvasListing } from "./left-panels/canvas-listing";
import { manifestPanel } from "./left-panels/manifest";
import { rangesPanel } from "./left-panels/range-listing";
import { tagsPanel } from "./left-panels/tags";
import * as avRangesPlugin from "./plugins/av-ranges";
import { queryStringTask } from "./query-string";
import "./index.css";
import * as remoteInference from "./plugins/remote-inference";

export default {
  id: "manifest-editor",
  title: "Manifest Editor",
  titleMessage: manifestMessage("app.title"),
  project: true,
  projectType: "Manifest",
};

export const localisation = {
  requiredNamespaces: [
    "manifest",
    "common",
    "editor-api",
    "shell",
    "editors",
    "creators",
    "components",
    "ui",
    "plugin-annotations",
    "plugin-canvas-label-generator",
  ],
};

export const config = { notebook: { enabled: true } };

export const centerPanels: LayoutPanel[] = [
  manifestOverview,
  {
    id: "current-canvas",
    label: "Current canvas",
    labelMessage: manifestMessage("panels.currentCanvas"),
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
  {
    id: NOTEBOOK_PANEL_ID,
    label: "Notebook",
    labelMessage: manifestMessage("panels.notebook"),
    icon: <NotebookIcon />,
    options: { minWidth: 360, maxWidth: 720 },
    render: () => <ProjectNotebookPanel />,
  },
  // @todo we will come back to the image grid
  // {
  //   id: "image-grid",
  //   label: "Image grid",
  //   render: () => <ManifestItemsGrid />,
  // },
];

export const background: BackgroundPanel[] = [contextMenus, queryStringTask];

export const backgroundActions: BackgroundActionDefinition[] = [createBulkThumbnailBuilderBackgroundAction()];

export const rightPanels: LayoutPanel[] = [baseEditor];

export const modals: LayoutPanel[] = [baseCreator];

export const editors = allEditors;

export const creators = allCreators;

export const resources = ["Manifest", "Canvas", "ContentResource", "Agent", "AnnotationPage", "Annotation", "Range"];

export { annotationsPlugin, avRangesPlugin, canvasLabelGeneratorPlugin };

export const plugins: PluginInput[] = [
  //
  annotationsPlugin,
  avRangesPlugin,
  canvasLabelGeneratorPlugin,
  remoteInference,
];
