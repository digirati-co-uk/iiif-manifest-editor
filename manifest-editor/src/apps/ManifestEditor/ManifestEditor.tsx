import { useEffect, useMemo, useState } from "react";
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
import { useManifestEditor } from "./ManifestEditor.context";
import { ManifestEditorToolbar } from "./components/ManifestEditorToolbar";
import { useShell } from "../../context/ShellContext/ShellContext";
import { useProjectContext } from "../../shell/ProjectContext/ProjectContext";

export function ManifestEditor() {
  const [editorPanelOpen, setEditorPanelOpen] = useState(true);
  const manifest = useManifest();
  const project = useProjectContext();
  const { addCanvasModalOpen, setAddCanvasModalOpen, view, languages } = useManifestEditor();
  const shell = useShell();

  useEffect(() => {
    if (!manifest) {
      // shell.changeSelectedApplication("Splash");
    }
  }, [manifest, shell]);

  if (!manifest) {
    return null;
  }

  return (
    <>
      {addCanvasModalOpen && <NewCanvasModal close={() => setAddCanvasModalOpen(false)} />}
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
            <EditorPanel open={editorPanelOpen} close={() => setEditorPanelOpen(false)} languages={languages} />
          </ErrorBoundary>
        )}
        {view === "grid" && (
          <ErrorBoundary>
            <GridView />
            <EditorPanel open={editorPanelOpen} close={() => setEditorPanelOpen(false)} languages={languages} />
          </ErrorBoundary>
        )}
        {view === "fullEditor" && (
          <ErrorBoundary>
            <EditorPanel open={editorPanelOpen} close={() => setEditorPanelOpen(false)} languages={languages} />
          </ErrorBoundary>
        )}
      </Editor>
    </>
  );
}
