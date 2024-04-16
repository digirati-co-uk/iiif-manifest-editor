import { ManifestStructuralProperties } from "./ManifestStructuralProperties";
import { EditorDefinition } from "@manifest-editor/shell";
import { CanvasStructuralProperties } from "./CanvasStructuralProperties";
import { RangeStructuralProperties } from "./RangeStructuralProperties";

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
export const rangeStructuralProperties: EditorDefinition = {
  id: "@manifest-editor/range-structural",
  label: "Structure",
  supports: {
    edit: true,
    properties: ["items"],
    resourceTypes: ["Range"],
  },
  component: () => <RangeStructuralProperties />,
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
