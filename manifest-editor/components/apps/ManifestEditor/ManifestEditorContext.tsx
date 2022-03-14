import React from "react";

interface EditorContextInterface {
  selectedProperty: string;
  changeSelectedProperty: (property: string) => void;
  setView: (view: "thumbnails" | "tree" | "grid") => void;
}

const ManifestEditorContext =
  React.createContext<EditorContextInterface | null>(null);

export default ManifestEditorContext;
