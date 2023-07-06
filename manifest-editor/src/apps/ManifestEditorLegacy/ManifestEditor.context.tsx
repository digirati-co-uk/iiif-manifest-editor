import React, { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ThumbnailSize } from "@/atoms/HeightWidthSwitcher";
import invariant from "tiny-invariant";
import { parse } from "query-string";
import { useProjectCreators } from "@/shell";

interface EditorContextInterface {
  // Layouts
  selectedProperty: string; // 11 usages
  selectedPanel?: number; // 16 usages
  changeSelectedProperty: (property: string, key?: number) => void; // 62 usages
  setView: (view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor") => void; // 9 usages
  view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor"; // 10 usages

  // This is just a modal.
  addCanvasModalOpen: boolean; // 2 usages
  setAddCanvasModalOpen: (boolean: boolean) => void; // 4 usages

  // This is panel state.
  thumbnailSize: ThumbnailSize; // 8 usages
  setThumbnailSize: (size: ThumbnailSize) => void; // 1 usages
}

export const ManifestEditorContext = React.createContext<EditorContextInterface | null>(null);

export function useManifestEditor() {
  const ctx = useContext(ManifestEditorContext);

  invariant(ctx, "Can only be called from <ManifestEditorProvider />");

  return ctx;
}

export function ManifestEditorProvider({
  children,
  ignoreQueryString,
}: {
  children: ReactNode;
  ignoreQueryString?: boolean;
}) {
  const [selectedProperty, setSelectedProperty] = useState("manifest");
  const [selectedPanel, setSelectedPanel] = useState(0);
  const [addCanvasModalOpen, setAddCanvasModalOpen] = useState(false);
  const [view, setView] = useState<"thumbnails" | "tree" | "grid" | "noNav" | "fullEditor">("grid");
  const { createProjectFromManifestId } = useProjectCreators();
  const changeSelectedProperty = (property: string, panelNum?: number) => {
    setSelectedProperty(property);
    if (panelNum || panelNum === 0) {
      setSelectedPanel(panelNum);
    }
  };

  useEffect(() => {
    if (!ignoreQueryString) {
      const parsed = parse(window.location.hash.slice(1));
      if (parsed && parsed.manifest && typeof parsed.manifest === "string") {
        createProjectFromManifestId(parsed.manifest).then(() => {
          window.location.hash = "";
        });
        return;
      }
    }
  }, []);

  const [thumbnailSize, setThumbnailSize] = useState({ w: 128, h: 128 });

  const editorSettings = useMemo(
    () => ({
      selectedProperty,
      view,
      selectedPanel,
      addCanvasModalOpen,
      thumbnailSize,
      languages: [],
      behaviorProperties: [],
      changeSelectedProperty,
      setView,
      setAddCanvasModalOpen,
      setThumbnailSize,
    }),
    [addCanvasModalOpen, selectedPanel, selectedProperty, thumbnailSize, view]
  );

  return <ManifestEditorContext.Provider value={editorSettings}>{children}</ManifestEditorContext.Provider>;
}

export default ManifestEditorContext;
