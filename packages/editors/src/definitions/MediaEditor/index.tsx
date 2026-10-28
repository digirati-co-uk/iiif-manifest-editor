import type { MessageReference } from "@manifest-editor/i18n";
import { EditorDefinition } from "@manifest-editor/shell";
import { MediaEditor } from "./MediaEditor";

export const mediaEditor: EditorDefinition & { labelMessage?: MessageReference; summaryMessage?: MessageReference } = {
  id: "@manifest-editor/media-editor",
  label: "Media",
  labelMessage: { namespace: "editors", key: "ui.media" },
  supports: {
    edit: true,
    sortKey: "annotation-target",
    properties: ["items"],
    resourceTypes: ["Annotation"],
    readOnlyProperties: [],
    custom: (res, vault) => {
      const item = vault.get(res.resource);
      if (!item) {
        return false;
      }

      if (!item.body) {
        return false;
      }

      const body = vault.get(item.body);

      if (body.length > 1) {
        return false;
      }

      const firstBody = body[0] || body;

      return ["Image", "Video", "Sound"].includes(firstBody.type || "");
    },
  },
  component: () => <MediaEditor />,
};
