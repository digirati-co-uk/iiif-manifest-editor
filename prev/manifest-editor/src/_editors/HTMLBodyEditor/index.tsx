import { EditorDefinition } from "@/shell/Layout/Layout.types";
import { HTMLEditor } from "@/_editors/HTMLBodyEditor/HTMLEditor";

export const htmlBodyEditor: EditorDefinition = {
  id: "@manifest-editor/html-body-editor",
  label: "HTML",
  supports: {
    edit: true,
    properties: ["items"],
    resourceTypes: ["Annotation"],
    readOnlyProperties: [],
    custom: (res, vault) => {
      const item = vault.get(res.resource);
      if (!item || !item.body) {
        return false;
      }
      const body = vault.get(item.body);
      const firstBody = body[0] || body;

      return ["TextualBody", "Text"].includes(firstBody.type || "") && firstBody.format === "text/html";
    },
  },
  component: () => <HTMLEditor />,
};
