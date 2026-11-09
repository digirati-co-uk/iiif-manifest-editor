import type { MessageReference } from "@manifest-editor/i18n";
import { EditorDefinition } from "@manifest-editor/shell";
import { DescriptiveProperties } from "./DescriptiveProperties";

export const descriptiveProperties: EditorDefinition & {
  labelMessage?: MessageReference;
  summaryMessage?: MessageReference;
} = {
  id: "@manifest-editor/descriptive-properties",
  label: "Descriptive",
  labelMessage: { namespace: "editors", key: "ui.descriptive" },
  supports: {
    edit: true,
    properties: ["label", "summary", "language", "navDate", "provider", "requiredStatement", "rights", "thumbnail"],
    resourceTypes: [
      "Collection",
      "Manifest",
      "Canvas",
      "ContentResource",
      "Agent",
      "Annotation",
      "AnnotationPage",
      "Range",
    ],
    readOnlyProperties: ["provider"],
  },
  component: () => <DescriptiveProperties />,
};
