import React from "react";

interface EditorContextInterface {
  selectedProperty: string;
  changeSelectedProperty: (property: string) => void;
  setView: (view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor") => void;
  view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor";
}

const ManifestEditorContext =
  React.createContext<EditorContextInterface | null>(null);

export default ManifestEditorContext;
