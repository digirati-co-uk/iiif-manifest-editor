import { EditorDefinition } from "@manifest-editor/shell";
import { FallbackAnnotationEditor } from "./FallbackAnnotationEditor";

export const fallbackAnnotationEditor: EditorDefinition = {
  id: "@manifest-editor/fallback-annotation-editor",
  label: "Target",
  supports: {
    edit: true,
    sortFallback: true,
    sortKey: "annotation-target",
    properties: ["target"],
    resourceTypes: ["Annotation"],
    readOnlyProperties: [],
  },
  component: () => <FallbackAnnotationEditor />,
};
