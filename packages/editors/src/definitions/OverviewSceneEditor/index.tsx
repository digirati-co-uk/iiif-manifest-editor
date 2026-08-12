import type { EditorDefinition } from "@manifest-editor/shell";
import { OverviewSceneEditor } from "./OverviewSceneEditor";

export const overviewSceneEditor: EditorDefinition = {
  id: "@manifest-editor/overview-scene-editor",
  label: "Scene",
  supports: {
    edit: true,
    properties: ["items", "label", "backgroundColor"],
    resourceTypes: ["Scene"],
    readOnlyProperties: [],
  },
  component: () => <OverviewSceneEditor />,
};
