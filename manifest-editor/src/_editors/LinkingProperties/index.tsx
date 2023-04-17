import { LinkingProperties } from "./LinkingProperties";
import { EditorDefinition } from "@/shell/Layout/Layout.types";

export const linkingProperties: EditorDefinition = {
  id: "@manifest-editor/linking-properties",
  label: "Linking",
  supports: {
    edit: true,
    properties: ["seeAlso", "rendering", "supplementary", "homepage", "logo"],
    resourceTypes: ["Manifest", "Canvas", "ContentResource", "Agent", "Range", "Collection"],
    readOnlyProperties: [],
  },
  component: () => <LinkingProperties />,
};
