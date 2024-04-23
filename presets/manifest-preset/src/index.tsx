import { CanvasPanelEditor, allEditors } from "@manifest-editor/editors";
import { allCreators } from "@manifest-editor/creators";
import { LayoutPanel, ExportPanel, baseCreator, baseEditor } from "@manifest-editor/shell";
import { canvasListing } from "./left-panels/canvas-listing";
import { overviewPanel } from "./left-panels/overview";
import { manifestPanel } from "./left-panels/manifest";

export default { id: "manifest-editor", title: "Manifest Editor", project: true, projectType: "Manifest" };

export const centerPanels: LayoutPanel[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "",
    render: () => <div>Overview of manifest?</div>,
  },
  {
    id: "current-canvas",
    label: "Current canvas",
    icon: "",
    render: (state, { actions }) => <CanvasPanelEditor />,
  },
  {
    id: "export",
    label: "Export",
    icon: "",
    render: () => <ExportPanel />,
  },
];

export const leftPanels: LayoutPanel[] = [
  overviewPanel,
  manifestPanel,
  canvasListing,
  // @todo we will come back to the image grid
  // {
  //   id: "image-grid",
  //   label: "Image grid",
  //   render: () => <ManifestItemsGrid />,
  // },
];
export const rightPanels: LayoutPanel[] = [
  {
    id: "right-panel-empty",
    label: "Right panel",
    icon: "",
    render: () => <div />,
  },
  baseEditor,
  baseCreator,
];

export const editors = allEditors;

export const creators = allCreators;

export const resources = ["Manifest", "Canvas", "ContentResource", "Agent", "AnnotationPage", "Annotation", "Range"];
