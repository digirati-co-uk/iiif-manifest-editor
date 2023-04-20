import { DescriptiveProperties } from "./DescriptiveProperties";
import { EditorDefinition } from "@/shell/Layout/Layout.types";

export const descriptiveProperties: EditorDefinition = {
  id: "@manifest-editor/technical-properties",
  label: "Descriptive",
  supports: {
    edit: true,
    properties: ["label", "summary", "language", "navDate", "provider", "requiredStatement", "rights", "thumbnail"],
    resourceTypes: ["Manifest", "Canvas", "ContentResource", "Agent", "Annotation", "AnnotationPage", "Range"],
    readOnlyProperties: ["provider"],
  },
  component: () => <DescriptiveProperties />,
};
