import { Metadata } from "./Metadata";
import { EditorDefinition } from "@/shell/Layout/Layout.types";

export const metadata: EditorDefinition = {
  id: "@manifest-editor/metadata",
  label: "Metadata",
  supports: {
    edit: true,
    properties: ["metadata"],
    resourceTypes: ["Collection", "Manifest", "Canvas", "Range"],
  },
  component: () => <Metadata />,
};
