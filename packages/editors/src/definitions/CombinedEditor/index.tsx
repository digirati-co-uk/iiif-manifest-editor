import { EditorDefinition } from "@manifest-editor/shell";
import { CombinedEditor } from "../CombinedEditor/CombinedEditor";

export const combinedProperties: EditorDefinition = {
  id: "@manifest-editor/overview",
  label: "Overview",
  supports: {
    edit: true,
    properties: [], // Empty, since you shouldn't navigate directly to this one I don't think.
    resourceTypes: [
      "Collection",
      "Manifest",
      "Canvas",
      "ContentResource",
      "Agent",
      // Ignore for annotations as they already have a combined editor.
      // "Annotation",
      "AnnotationPage",
      "Range",
    ],
  },
  component: (config) => <CombinedEditor config={config} />,
};
