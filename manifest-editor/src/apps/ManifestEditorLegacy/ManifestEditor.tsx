import { useState } from "react";
import { useManifest } from "@/hooks/useManifest";
import { Editor } from "@/atoms/Editor";
import { ErrorBoundary } from "@/atoms/ErrorBoundary";
import { ExpandTab } from "@/atoms/ExpandTab";
import { ThumbnailStripView } from "@/components/layout/ThumbnailStripView";
import { EditorPanel } from "@/components/layout/EditorPanel";
import { Toolbar } from "@/components/layout/Toolbar";
import { GridView } from "@/components/organisms/GridView/GridView";
import { useManifestEditor } from "./ManifestEditor.context";
import { ManifestEditorToolbar } from "@/apps/ManifestEditorLegacy/components/ManifestEditorToolbar";
import { CanvasPanelViewer } from "@/_panels/center-panels/CanvasPanelViewer/CanvasPanelViewer";
import { useAppState } from "@/shell";
import { CanvasContext } from "react-iiif-vault";

export function ManifestEditor() {
  const editorContext = useManifestEditor();
  const [editorPanelOpen, setEditorPanelOpen] = useState(true);
  const manifest = useManifest();
  const { view } = useManifestEditor();
  const appState = useAppState();

  if (!manifest) {
    return null;
  }

  return (
    <CanvasContext canvas={appState.state?.canvasId}>
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
            <CanvasPanelViewer />
            <EditorPanel open={editorPanelOpen} close={() => setEditorPanelOpen(false)} />
          </ErrorBoundary>
        )}
        {view === "grid" && (
          <ErrorBoundary>
            <GridView
              handleChange={(itemId, thumbnail) => {
                appState.setState({ canvasId: itemId });
                editorContext?.changeSelectedProperty("canvas");
                if (thumbnail) {
                  editorContext?.setView("thumbnails");
                }
              }}
            />
            <EditorPanel open={editorPanelOpen} close={() => setEditorPanelOpen(false)} />
          </ErrorBoundary>
        )}
        {view === "fullEditor" && (
          <ErrorBoundary>
            <EditorPanel open={editorPanelOpen} close={() => setEditorPanelOpen(false)} />
          </ErrorBoundary>
        )}
      </Editor>
    </CanvasContext>
  );
}
