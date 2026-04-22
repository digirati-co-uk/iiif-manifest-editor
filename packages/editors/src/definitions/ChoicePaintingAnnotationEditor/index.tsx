import { EditorDefinition } from "@manifest-editor/shell";
import { getChoiceBodyInfo } from "../../helpers/choice-painting-annotations";
import { ChoicePaintingAnnotationEditor } from "./ChoicePaintingAnnotationEditor";

export const choicePaintingAnnotationEditor: EditorDefinition = {
  id: "@manifest-editor/choice-painting-annotation-editor",
  label: "Choice",
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
