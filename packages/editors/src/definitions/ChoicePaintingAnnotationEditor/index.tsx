import type { MessageReference } from "@manifest-editor/i18n";
import { EditorDefinition } from "@manifest-editor/shell";
import { getChoiceBodyInfo } from "../../helpers/choice-painting-annotations";
import { ChoicePaintingAnnotationEditor } from "./ChoicePaintingAnnotationEditor";

export const choicePaintingAnnotationEditor: EditorDefinition & {
  labelMessage?: MessageReference;
  summaryMessage?: MessageReference;
} = {
  id: "@manifest-editor/choice-painting-annotation-editor",
  label: "Choice",
  labelMessage: { namespace: "editors", key: "ui.choice" },
  supports: {
    edit: true,
    sortKey: "annotation-target",
    properties: ["body", "target"],
    resourceTypes: ["Annotation"],
    readOnlyProperties: [],
    custom: (res, vault) => {
      const annotation = vault.get(res.resource);
      return !!getChoiceBodyInfo(annotation, vault as any);
    },
  },
  component: () => <ChoicePaintingAnnotationEditor />,
};
