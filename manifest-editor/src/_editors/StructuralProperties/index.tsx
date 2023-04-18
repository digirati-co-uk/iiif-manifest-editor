import { ManifestStructuralProperties } from "./ManifestStructuralProperties";
import { EditorDefinition } from "@/shell/Layout/Layout.types";
import { CanvasStructuralProperties } from "./CanvasStructuralProperties";

export const manifestStructuralProperties: EditorDefinition = {
  id: "@manifest-editor/manifest-structural",
  label: "Structure",
  supports: {
    edit: true,
    properties: ["items", "structures"],
    resourceTypes: ["Manifest"],
  },
  component: () => <ManifestStructuralProperties />,
};

export const canvasStructuralProperties: EditorDefinition = {
  id: "@manifest-editor/canvas-structural",
  label: "Structure",
  supports: {
    edit: true,
    properties: ["items", "structures"],
    resourceTypes: ["Canvas"],
  },
  component: () => <CanvasStructuralProperties />,
};
