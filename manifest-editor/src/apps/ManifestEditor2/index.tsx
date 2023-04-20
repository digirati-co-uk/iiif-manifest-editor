import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { canvasListing } from "@/apps/ManifestEditor2/left-panels/canvas-listing";
import { baseEditor } from "@/_panels/right-panels/BaseEditor";
import { technicalProperties } from "@/_editors/TechnicalProperties";
import { descriptiveProperties } from "@/_editors/DescriptiveProperties";
import { imageEditor } from "@/_editors/ImageEditor";
import { CompatibilityTable } from "@/_panels/center-panels/CompatibilityTable/CompatibilityTable";
import { metadata } from "@/_editors/Metadata";
import { baseCreator } from "@/_panels/right-panels/BaseCreator";
import { linkingProperties } from "@/_editors/LinkingProperties";
import { ManifestItemsGrid } from "@/_panels/left-panels/CanvasGrid/CanvasGrid";
import { canvasStructuralProperties, manifestStructuralProperties } from "../../_editors/StructuralProperties";
import { mediaEditor } from "../../_editors/MediaEditor";
import { allCreators } from "@/_creators";
import { htmlBodyEditor } from "@/_editors/HTMLBodyEditor";
import { CanvasPanelViewer } from "@/_panels/center-panels/CanvasPanelViewer/CanvasPanelViewer";
import { useEditingResource, useEditingResourceStack, useEditingStack } from "@/shell/EditingStack/EditingStack";
import { CanvasContext } from "react-iiif-vault";

export default { id: "manifest-editor-2", title: "Manifest Editor 2", dev: true };

function CanvasPanelEditingCtx() {
  const stack = useEditingResourceStack();
  const current = useEditingResource();
  const canvas =
    current?.resource.source.type === "Canvas" ? current : stack.find((t) => t.resource.source.type === "Canvas");
  const canvasId = canvas?.resource.source.id;

  if (canvas) {
    return (
      <CanvasContext canvas={canvasId} key={canvasId}>
        <CanvasPanelViewer />
      </CanvasContext>
    );
  }
  return <div>No canvas selected</div>;
}

export const centerPanels: LayoutPanel[] = [
  {
    id: "current-canvas",
    label: "Current canvas",
    icon: "",
    render: (state, { actions }) => <CanvasPanelEditingCtx />,
  },
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

export const editors = [
  imageEditor,
  mediaEditor,
  htmlBodyEditor,
  descriptiveProperties,
  metadata,
  technicalProperties,
  linkingProperties,
  manifestStructuralProperties,
  canvasStructuralProperties,
];

export const creators = allCreators;

export const resources = ["Manifest", "Canvas", "ContentResource", "Agent", "AnnotationPage", "Annotation"];
