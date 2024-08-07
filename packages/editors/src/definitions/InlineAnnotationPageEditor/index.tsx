import { EditorDefinition } from "@manifest-editor/shell";
import { isExternal } from "../../helpers";
import { InlineAnnotationPageEditor } from "./InlineAnnotationPageEditor";

export const inlineAnnotationPageEditor: EditorDefinition = {
  id: "@manifest-editor/annotation-list-editor",
  label: "Annotations",
  supports: {
    edit: true,
    properties: ["items"],
    resourceTypes: ["AnnotationPage"],
    readOnlyProperties: [],
    custom: (res, vault) => {
      const item = vault.get(res.resource);
      if (!item) {
        return false;
      }

      return !isExternal(item);
    },
  },
  component: () => <InlineAnnotationPageEditor />,
};
