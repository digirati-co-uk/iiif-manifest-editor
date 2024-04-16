import { EditorDefinition } from "@manifest-editor/shell";
import { Metadata } from "./Metadata";

export const metadata: EditorDefinition = {
  id: "@manifest-editor/metadata",
  label: "Metadata",
  supports: {
    edit: true,
    properties: ["metadata"],
    resourceTypes: [
      "Collection",
      "Manifest",
      "Canvas",
      "Range",
      "ContentResource",
      "Annotation",
      "AnnotationCollection",
    ],
  },
  component: () => <Metadata />,
};
