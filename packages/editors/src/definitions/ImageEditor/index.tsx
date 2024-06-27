import { EditorDefinition } from "@manifest-editor/shell";
import { ImageEditor } from "./ImageEditor";

export const imageEditor: EditorDefinition = {
  id: "@manifest-editor/image-editor",
  label: "Image",
  supports: {
    edit: true,
    properties: ["label", "height", "width", "format" /*"service"*/],
    resourceTypes: ["ContentResource"],
    custom: (item, vault) => vault.get(item.resource).type === "Image",
  },
  component: () => <ImageEditor />,
};
