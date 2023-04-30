import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { canvasListing } from "@/apps/ManifestEditor/left-panels/canvas-listing";
import { baseEditor } from "@/_panels/right-panels/BaseEditor";
import { technicalProperties } from "@/_editors/TechnicalProperties";
import { descriptiveProperties } from "@/_editors/DescriptiveProperties";
import { imageEditor } from "@/_editors/ImageEditor";
import { CompatibilityTable } from "@/_panels/center-panels/CompatibilityTable/CompatibilityTable";
import { metadata } from "@/_editors/Metadata";
import { baseCreator } from "@/_panels/right-panels/BaseCreator";
import { linkingProperties } from "@/_editors/LinkingProperties";
import { ManifestItemsGrid } from "@/_panels/left-panels/CanvasGrid/CanvasGrid";
import {
  canvasStructuralProperties,
  manifestStructuralProperties,
  rangeStructuralProperties,
} from "@/_editors/StructuralProperties";
import { mediaEditor } from "@/_editors/MediaEditor";
import { allCreators } from "@/_creators";
import { htmlBodyEditor } from "@/_editors/HTMLBodyEditor";
import { inlineAnnotationPageEditor } from "@/_editors/InlineAnnotationPageEditor";
import React from "react";
import { CanvasPanelEditor } from "@/_components/ui/CanvasPanelEditor/CanvasPanelEditor";
import { tutorial } from "@/_panels/right-panels/Tutotiral";
import { overviewCanvasEditor } from "@/_editors/OverviewCanvasEditor";
import { combinedProperties } from "@/_editors/CombinedEditor";
import { allEditors } from "@/_editors";

export default { id: "manifest-editor", title: "Manifest Editor", project: true, projectType: "Manifest" };

export const centerPanels: LayoutPanel[] = [
  {
    id: "current-canvas",
    label: "Current canvas",
    icon: "",
    render: (state, { actions }) => <CanvasPanelEditor />,
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
  tutorial,
  baseEditor,
  baseCreator,
];

export const editors = allEditors;

export const creators = allCreators;

export const resources = ["Manifest", "Canvas", "ContentResource", "Agent", "AnnotationPage", "Annotation", "Range"];
