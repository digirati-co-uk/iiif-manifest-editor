import { CanvasPanelEditor, allEditors } from "@manifest-editor/editors";
import { allCreators } from "@manifest-editor/creators";
import { LayoutPanel, ExportPanel, baseCreator, baseEditor } from "@manifest-editor/shell";
import { canvasListing } from "./left-panels/canvas-listing";
import { manifestPanel } from "./left-panels/manifest";
import { canvasThumbnails } from "./left-panels/canvas-thumbnails";
import { manifestOverview } from "./center-panels/manifest-overview";

export default { id: "manifest-editor", title: "Manifest Editor", project: true, projectType: "Manifest" };

export const centerPanels: LayoutPanel[] = [
  manifestOverview,
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
  manifestPanel,
  canvasListing,
  canvasThumbnails,
  // @todo we will come back to the image grid
  // {
  //   id: "image-grid",
  //   label: "Image grid",
  //   render: () => <ManifestItemsGrid />,
  // },
];

export const rightPanels: LayoutPanel[] = [baseEditor];

export const modals: LayoutPanel[] = [baseCreator];

export const editors = allEditors;

export const creators = allCreators;

export const resources = ["Manifest", "Canvas", "ContentResource", "Agent", "AnnotationPage", "Annotation", "Range"];
