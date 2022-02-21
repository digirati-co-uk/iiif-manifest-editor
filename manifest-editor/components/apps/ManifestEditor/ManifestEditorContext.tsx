import React from "react";

interface EditorContextInterface {
  selectedProperty: string;
  changeSelectedProperty: (property: string) => void;
}

const ManifestEditorContext = React.createContext<EditorContextInterface | null>(
  null
);


export default ManifestEditorContext;
