import { useState } from "react";
import { useManifest } from "../../../hooks/useManifest";
import { WarningMessage } from "../../atoms/callouts/WarningMessage";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { ContentSelector } from "../../layout/ContentSelector";
import { EditorPanel } from "../../layout/EditorPanel";
import { FlexContainerRow } from "../../layout/FlexContainer";
import { Toolbar } from "../../layout/Toolbar";
import { CanvasView } from "../../organisms/CanvasView";
import ManifestEditorContext from "./ManifestEditorContext";
import { ManifestEditorToolbar } from "./ManifestEditorToolbar";

export const ManifestEditor: React.FC<{ defaultLanguages: string[] }> = ({
  defaultLanguages,
}) => {
  const [selectedProperty, setSelectedProperty] = useState("id");

  const [editorPanelOpen, setEditorPanelOpen] = useState(false);
  const [view, setView] = useState<"thumbnails" | "tree">("tree");
  const changeSelectedProperty = (property: string) => {
    setSelectedProperty(property);
  };

  const editorSettings = { selectedProperty, changeSelectedProperty };

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
                setView={(selectedView: "thumbnails" | "tree") =>
                  setView(selectedView)
                }
              />
            </Toolbar>
          </ErrorBoundary>
          <FlexContainerRow>
            <ErrorBoundary>
              <ContentSelector view={view} />
              <CanvasView />
              <EditorPanel
                open={editorPanelOpen}
                close={() => setEditorPanelOpen(false)}
                languages={defaultLanguages}
              ></EditorPanel>
            </ErrorBoundary>
          </FlexContainerRow>
        </ManifestEditorContext.Provider>
      )}
    </>
  );
};
