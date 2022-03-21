import React from "react";

interface EditorContextInterface {
  selectedProperty: string;
  // This list will grow
  selectedPanel?: number;
  changeSelectedProperty: (
    property: string,
    // This list will grow
    tabPanel?: number
  ) => void;
  setView: (
    view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor"
  ) => void;
  view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor";
  languages: string[];
  behaviorProperties: string[] | null;
}

const ManifestEditorContext =
  React.createContext<EditorContextInterface | null>(null);

export default ManifestEditorContext;
