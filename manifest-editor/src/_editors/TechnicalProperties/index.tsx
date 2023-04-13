import { TechnicalProperties } from "./TechnicalProperties";
import { EditorDefinition } from "@/shell/Layout/Layout.types";

export const technicalProperties: EditorDefinition = {
  id: "@manifest-editor/technical-properties",
  label: "Technical",
  supports: {
    edit: true,
    properties: [
      "id",
      "viewingDirection",
      "height",
      "width",
      "duration",
      "behavior",
      "format",
      "motivation",
      "profile",
      "timeMode",
    ],
    resourceTypes: [
      "Collection",
      "Manifest",
      "Canvas",
      "Annotation",
      "AnnotationPage",
      "Range",
      "AnnotationCollection",
      "ContentResource",
      "Agent",
    ],
  },
  component: () => <TechnicalProperties />,
};
