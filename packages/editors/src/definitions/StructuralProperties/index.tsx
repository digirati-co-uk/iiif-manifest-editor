import type { MessageReference } from "@manifest-editor/i18n";
import { ManifestStructuralProperties } from "./ManifestStructuralProperties";
import { EditorDefinition } from "@manifest-editor/shell";
import { CanvasStructuralProperties } from "./CanvasStructuralProperties";
import { RangeStructuralProperties } from "./RangeStructuralProperties";

export const manifestStructuralProperties: EditorDefinition & {
  labelMessage?: MessageReference;
  summaryMessage?: MessageReference;
} = {
  id: "@manifest-editor/manifest-structural",
  label: "Structure",
  labelMessage: { namespace: "editors", key: "ui.structure" },
  supports: {
    edit: true,
    properties: ["items", "structures"],
    resourceTypes: ["Manifest"],
  },
  component: () => <ManifestStructuralProperties />,
};
export const rangeStructuralProperties: EditorDefinition & {
  labelMessage?: MessageReference;
  summaryMessage?: MessageReference;
} = {
  id: "@manifest-editor/range-structural",
  label: "Structure",
  labelMessage: { namespace: "editors", key: "ui.structure" },
  supports: {
    edit: true,
    properties: ["items"],
    resourceTypes: ["Range"],
  },
  component: () => <RangeStructuralProperties />,
};

export const canvasStructuralProperties: EditorDefinition & {
  labelMessage?: MessageReference;
  summaryMessage?: MessageReference;
} = {
  id: "@manifest-editor/canvas-structural",
  label: "Structure",
  labelMessage: { namespace: "editors", key: "ui.structure" },
  supports: {
    edit: true,
    properties: ["items", "structures"],
    resourceTypes: ["Canvas"],
  },
  component: () => <CanvasStructuralProperties />,
};
