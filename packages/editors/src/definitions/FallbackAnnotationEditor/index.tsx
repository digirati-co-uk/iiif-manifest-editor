import type { MessageReference } from "@manifest-editor/i18n";
import { EditorDefinition } from "@manifest-editor/shell";
import { FallbackAnnotationEditor } from "./FallbackAnnotationEditor";

export const fallbackAnnotationEditor: EditorDefinition & {
  labelMessage?: MessageReference;
  summaryMessage?: MessageReference;
} = {
  id: "@manifest-editor/fallback-annotation-editor",
  label: "Target",
  labelMessage: { namespace: "editors", key: "ui.target" },
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
