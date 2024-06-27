import { EditorDefinition } from "@manifest-editor/shell";
import { DescriptiveProperties } from "./DescriptiveProperties";

export const descriptiveProperties: EditorDefinition = {
  id: "@manifest-editor/descriptive-properties",
  label: "Descriptive",
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
