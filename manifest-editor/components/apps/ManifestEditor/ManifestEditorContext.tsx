import React from "react";
import { ThumbnailSize } from "../../atoms/HeightWidthSwitcher";

interface EditorContextInterface {
  selectedProperty: string;
  selectedPanel?: number;
  changeSelectedProperty: (property: string, key?: number) => void;
  setView: (
    view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor"
  ) => void;
  view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor";
  languages: string[];
  behaviorProperties: string[] | null;
  addCanvasModalOpen: boolean;
  setAddCanvasModalOpen: (boolean: boolean) => void;
  thumbnailSize: ThumbnailSize;
  setThumbnailSize: (size: ThumbnailSize) => void;
}

const ManifestEditorContext =
  React.createContext<EditorContextInterface | null>(null);

export default ManifestEditorContext;
