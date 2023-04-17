import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { canvasListing } from "@/apps/ManifestEditor2/left-panels/canvas-listing";
import { baseEditor } from "@/_panels/right-panels/BaseEditor";
import { technicalProperties } from "@/_editors/TechnicalProperties";
import { descriptiveProperties } from "@/_editors/DescriptiveProperties";
import { imageEditor } from "@/_editors/ImageEditor";
import { CompatibilityTable } from "@/_panels/center-panels/CompatibilityTable/CompatibilityTable";
import { metadata } from "@/_editors/Metadata";
import { baseCreator } from "@/_panels/right-panels/BaseCreator";
import { webPageCreator } from "@/_creators/WebPageCreator";
import { linkingProperties } from "@/_editors/LinkingProperties";
import { plaintextCreator } from "@/_creators/PlaintextCreator";
import { ManifestItemsGrid } from "@/_panels/left-panels/CanvasGrid/CanvasGrid";

export default { id: "manifest-editor-2", title: "Manifest Editor 2", dev: true };

export const centerPanels: LayoutPanel[] = [
  {
    id: "center-panel-empty",
    label: "Center panel",
    icon: "",
    render: () => <CompatibilityTable />,
  },
];
export const leftPanels: LayoutPanel[] = [
  canvasListing,
  {
    id: "image-grid",
    label: "Image grid",
    render: () => <ManifestItemsGrid />,
  },
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

export const editors = [imageEditor, descriptiveProperties, metadata, technicalProperties, linkingProperties];

export const creators = [webPageCreator, plaintextCreator];

export const resources = ["Manifest", "Canvas", "ContentResource", "Agent"];
