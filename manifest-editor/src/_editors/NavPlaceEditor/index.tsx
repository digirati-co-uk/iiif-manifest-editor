import { EditorDefinition } from "@/shell/Layout/Layout.types";
import React from "react";
import { NavPlaceEditor } from "@/_editors/NavPlaceEditor/NavPlaceEditor";

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
