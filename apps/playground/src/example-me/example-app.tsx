import { CreatorDefinition } from "@manifest-editor/creator-api";
import { EditorDefinition, LayoutPanel } from "@manifest-editor/shell";

export default { id: "example-app", title: "Example app" };

export const centerPanels: LayoutPanel[] = [
  {
    id: "example-center-panel",
    label: "Example center panel",
    render: () => {
      return <div>Example center panel</div>;
    },
  },
];

export const leftPanels: LayoutPanel[] = [];

export const rightPanels: LayoutPanel[] = [];

export const editors: EditorDefinition[] = [];

export const resources: string[] = [];

export const creators: CreatorDefinition[] = [];
