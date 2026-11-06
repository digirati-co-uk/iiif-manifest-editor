import type { MessageReference } from "@manifest-editor/i18n";
import { EditorDefinition } from "@manifest-editor/shell";
import { ImageEditor } from "./ImageEditor";

export const imageEditor: EditorDefinition & { labelMessage?: MessageReference; summaryMessage?: MessageReference } = {
  id: "@manifest-editor/image-editor",
  label: "Image",
  labelMessage: { namespace: "editors", key: "ui.image" },
  supports: {
    edit: true,
    properties: ["label", "height", "width", "format" /*"service"*/],
    resourceTypes: ["ContentResource"],
    custom: (item, vault) => vault.get(item.resource).type === "Image",
  },
  component: () => <ImageEditor />,
};
