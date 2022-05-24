import React, { ReactElement, ReactNode, useContext, useMemo, useState } from "react";
import { ThumbnailSize } from "../../atoms/HeightWidthSwitcher";
import invariant from "tiny-invariant";
import { useManifest } from "../../hooks/useManifest";

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

export function ManifestEditorProvider({
  defaultLanguages,
  behaviorProperties,
  children,
}: {
  defaultLanguages: string[];
  behaviorProperties: string[];
  children: ReactNode;
}) {
  const [selectedProperty, setSelectedProperty] = useState("manifest");
  const [selectedPanel, setSelectedPanel] = useState(0);
  const [addCanvasModalOpen, setAddCanvasModalOpen] = useState(false);
  const [view, setView] = useState<"thumbnails" | "tree" | "grid" | "noNav" | "fullEditor">("grid");
  const changeSelectedProperty = (property: string, panelNum?: number) => {
    setSelectedProperty(property);
    if (panelNum || panelNum === 0) {
      setSelectedPanel(panelNum);
    }
  };

  const [thumbnailSize, setThumbnailSize] = useState({ w: 256, h: 256 });

  const editorSettings = useMemo(
    () => ({
      selectedProperty,
      view,
      selectedPanel,
      addCanvasModalOpen,
      thumbnailSize,
      languages: defaultLanguages,
      behaviorProperties: behaviorProperties,
      changeSelectedProperty,
      setView,
      setAddCanvasModalOpen,
      setThumbnailSize,
    }),
    [addCanvasModalOpen, behaviorProperties, defaultLanguages, selectedPanel, selectedProperty, thumbnailSize, view]
  );

  return <ManifestEditorContext.Provider value={editorSettings}>{children}</ManifestEditorContext.Provider>;
}

export default ManifestEditorContext;
