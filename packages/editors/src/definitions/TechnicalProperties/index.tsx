import { EditorDefinition } from "@manifest-editor/shell";
import { TechnicalProperties } from "./TechnicalProperties";

export const technicalProperties: EditorDefinition = {
  id: "@manifest-editor/technical-properties",
  label: "Technical",
  supports: {
    edit: true,
    readOnlyProperties: ["id"],
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
