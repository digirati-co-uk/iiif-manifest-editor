import React, { useContext } from "react";
import { ThumbnailSize } from "../../atoms/HeightWidthSwitcher";
import invariant from "tiny-invariant";

interface EditorContextInterface {
  selectedProperty: string;
  selectedPanel?: number;
  changeSelectedProperty: (property: string, key?: number) => void;
  setView: (view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor") => void;
  view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor";
  languages: string[];
  behaviorProperties: string[] | null;
  addCanvasModalOpen: boolean;
  setAddCanvasModalOpen: (boolean: boolean) => void;
  thumbnailSize: ThumbnailSize;
  setThumbnailSize: (size: ThumbnailSize) => void;
}

export const ManifestEditorContext = React.createContext<EditorContextInterface | null>(null);

export function useManifestEditor() {
  const ctx = useContext(ManifestEditorContext);

  invariant(ctx, "Can only be called from <ManifestEditorProvider />");

  return ctx;
}

export default ManifestEditorContext;
