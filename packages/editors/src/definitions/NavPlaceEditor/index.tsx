import { EditorDefinition } from "@manifest-editor/shell";
import { NavPlaceEditor } from "./NavPlaceEditor";

export const navPlaceEditor: EditorDefinition = {
  id: "@manifest-editor/nav-place-editor",
  label: "Nav place",
  supports: {
    edit: true,
    properties: ["navPlace"],
    resourceTypes: ["Collection", "Manifest", "Canvas", "Range"],
    readOnlyProperties: [],
  },
  component: () => <NavPlaceEditor />,
};
