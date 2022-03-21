import { useState } from "react";
import { useManifest } from "../../../hooks/useManifest";
import { WarningMessage } from "../../atoms/callouts/WarningMessage";
import { Editor } from "../../atoms/Editor";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { ExpandTab } from "../../atoms/ExpandTab";
import { ContentSelector } from "../../layout/ContentSelector";
import { EditorPanel } from "../../layout/EditorPanel";
import { Toolbar } from "../../layout/Toolbar";
import { CanvasView } from "../../organisms/CanvasView";
import { GridView } from "../../organisms/GridView";
import ManifestEditorContext from "./ManifestEditorContext";
import { ManifestEditorToolbar } from "./ManifestEditorToolbar";

export const ManifestEditor: React.FC<{
  defaultLanguages: string[];
  behaviorProperties: string[];
}> = ({ defaultLanguages, behaviorProperties }) => {
  const [selectedProperty, setSelectedProperty] = useState("manifest");
  const [selectedPanel, setSelectedPanel] = useState(0);

  const [editorPanelOpen, setEditorPanelOpen] = useState(true);
  const [view, setView] =
    useState<"thumbnails" | "tree" | "grid" | "noNav" | "fullEditor">("grid");
  const changeSelectedProperty = (property: string, panelNum?: number) => {
    setSelectedProperty(property);
    if (panelNum || panelNum === 0) {
      setSelectedPanel(panelNum);
    }
  };

  const editorSettings = {
    selectedProperty,
    changeSelectedProperty,
    view,
    setView,
    languages: defaultLanguages,
    behaviorProperties: behaviorProperties,
    selectedPanel,
  };

  const manifest = useManifest();

  return (
    <>
      {!manifest ? (
        <WarningMessage>
          Oops, it looks like you don't have a manifest loaded. Click File, then
          open to get started.
        </WarningMessage>
      ) : (
        <ManifestEditorContext.Provider value={editorSettings}>
          <ErrorBoundary>
            <Toolbar>
              <ManifestEditorToolbar
                setEditorPanelOpen={(bool: boolean) => setEditorPanelOpen(bool)}
                setView={(
                  selectedView:
                    | "thumbnails"
                    | "tree"
                    | "grid"
                    | "noNav"
                    | "fullEditor"
                ) => setView(selectedView)}
              />
            </Toolbar>
          </ErrorBoundary>
          <Editor>
            {view !== "grid" && view !== "fullEditor" && (
              <ErrorBoundary>
                <ContentSelector view={view} />
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
