import { useMemo, useState } from "react";
import { useManifest } from "../../hooks/useManifest";
import { WarningMessage } from "../../atoms/callouts/WarningMessage";
import { Editor } from "../../atoms/Editor";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { ExpandTab } from "../../atoms/ExpandTab";
import { ThumbnailStripView } from "../../components/layout/ThumbnailStripView";
import { EditorPanel } from "../../components/layout/EditorPanel";
import { Toolbar } from "../../components/layout/Toolbar";
import { NewCanvasModal } from "../../components/modals/NewCanvasModal";
import { CanvasView } from "../../components/organisms/CanvasView";
import { GridView } from "../../components/organisms/GridView";
import { ManifestEditorContext } from "./ManifestEditor.context";
import { ManifestEditorToolbar } from "./components/ManifestEditorToolbar";

export const ManifestEditor: React.FC<{
  defaultLanguages: string[];
  behaviorProperties: string[];
}> = ({ defaultLanguages, behaviorProperties }) => {
  const [selectedProperty, setSelectedProperty] = useState("manifest");
  const [selectedPanel, setSelectedPanel] = useState(0);
  const [editorPanelOpen, setEditorPanelOpen] = useState(true);
  const [addCanvasModalOpen, setAddCanvasModalOpen] = useState(false);
  const [view, setView] = useState<"thumbnails" | "tree" | "grid" | "noNav" | "fullEditor">("grid");
  const changeSelectedProperty = (property: string, panelNum?: number) => {
    setSelectedProperty(property);
    if (panelNum || panelNum === 0) {
      setSelectedPanel(panelNum);
    }
  };

  const [thumbnailSize, setThumbnailSize] = useState({ w: 256, h: 256 });

  const manifest = useManifest();

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

  return (
    <>
      {addCanvasModalOpen && <NewCanvasModal close={() => setAddCanvasModalOpen(false)} />}
      {!manifest ? (
        <WarningMessage>
          Oops, it looks like you don't have a manifest loaded. Click File, then new to get started.
        </WarningMessage>
      ) : (
        <ManifestEditorContext.Provider value={editorSettings}>
          <ErrorBoundary>
            <Toolbar>
              <ManifestEditorToolbar setEditorPanelOpen={(bool: boolean) => setEditorPanelOpen(bool)} />
            </Toolbar>
          </ErrorBoundary>
          <Editor>
            {view !== "grid" && view !== "fullEditor" && (
              <ErrorBoundary>
                <ThumbnailStripView view={view} />
                <ExpandTab />
                <CanvasView />
                <EditorPanel
                  open={editorPanelOpen}
                  close={() => setEditorPanelOpen(false)}
                  languages={defaultLanguages}
                />
              </ErrorBoundary>
            )}
            {view === "grid" && (
              <ErrorBoundary>
                <GridView />
                <EditorPanel
                  open={editorPanelOpen}
                  close={() => setEditorPanelOpen(false)}
                  languages={defaultLanguages}
                />
              </ErrorBoundary>
            )}
            {view === "fullEditor" && (
              <ErrorBoundary>
                <EditorPanel
                  open={editorPanelOpen}
                  close={() => setEditorPanelOpen(false)}
                  languages={defaultLanguages}
                />
              </ErrorBoundary>
            )}
          </Editor>
        </ManifestEditorContext.Provider>
      )}
    </>
  );
};
