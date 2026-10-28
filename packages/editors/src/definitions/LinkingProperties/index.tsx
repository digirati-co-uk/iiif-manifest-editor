import type { MessageReference } from "@manifest-editor/i18n";
import { LinkingProperties } from "./LinkingProperties";
import { EditorDefinition } from "@manifest-editor/shell";

export const linkingProperties: EditorDefinition & {
  labelMessage?: MessageReference;
  summaryMessage?: MessageReference;
} = {
  id: "@manifest-editor/linking-properties",
  label: "Linking",
  labelMessage: { namespace: "editors", key: "ui.linking" },
  supports: {
    edit: true,
    properties: ["seeAlso", "rendering", "supplementary", "homepage", "logo"],
    resourceTypes: ["Manifest", "Canvas", "ContentResource", "Agent", "Range", "Collection"],
    readOnlyProperties: [],
  },
  component: () => <LinkingProperties />,
};
