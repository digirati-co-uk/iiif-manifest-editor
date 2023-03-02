import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { useStore } from "zustand";
import { AnnotationContext, CanvasContext, CanvasPanel, useCanvas, useVaultSelector } from "react-iiif-vault";
import { CanvasNormalized } from "@iiif/presentation-3";
import React from "react";
import { MediaControls } from "@/_panels/center-panels/CanvasPanelViewer/components/MediaControls";
import invariant from "tiny-invariant";
import { ViewerContainer } from "@/_panels/center-panels/CanvasPanelViewer/CanvasPanelViewer.styles";

export function CanvasViewInner() {
  const canvas = useCanvas();

  invariant(canvas);

  return (
    <>
      <style>{`
        .atlas-container {
          min-width: 0;
          --atlas-container-flex: 1 1 0px;
          --atlas-background:  #f9f9f9;
        }
      `}</style>
      <ViewerContainer style={{ flex: 1, minHeight: 0 }}>
        <CanvasPanel.Viewer
          key={canvas.id}
          // onCreated={(preset) => void (runtime.current = preset.runtime)}
          // renderPreset={config}
          // mode={editMode ? "sketch" : "explore"}
        >
          <CanvasContext canvas={canvas.id}>
            <CanvasPanel.RenderCanvas
              strategies={["empty", "images", "media", "textual-content"]}
              // renderViewerControls={() => (
              //   <ViewControls refresh={refresh} editMode={editMode} toggleEditMode={toggleEditMode} />
              // )}
              renderMediaControls={() => <MediaControls />}
              backgroundStyle={{ background: "#fff" }}
              alwaysShowBackground
              // onClickPaintingAnnotation={onClickPaintingAnnotation}
            >
              {/*{!currentlyEditingAnnotation && resources.length*/}
              {/*  ? resources.map((resource) => <Highlight key={resource} id={resource} />)*/}
              {/*  : null}*/}
              {/*{currentlyEditingAnnotation && editMode ? (*/}
              {/*  <AnnotationContext annotation={currentlyEditingAnnotation}>*/}
              {/*    <AnnotationTargetEditor />*/}
              {/*  </AnnotationContext>*/}
              {/*) : null}*/}
            </CanvasPanel.RenderCanvas>
          </CanvasContext>
          {/*{rightPanel.current === "canvas-properties" && rightPanel.state.current === 5 && (*/}
          {/*  <Annotations canvasId={state.canvasId} />*/}
          {/*)}*/}
        </CanvasPanel.Viewer>
      </ViewerContainer>
    </>
  );
}

export function CanvasView() {
  const store = useExplorerStore();
  const selected = useStore(store, (s) => s.selected);
  const canvas = useVaultSelector<CanvasNormalized | null>(
    (state, vault) => (selected ? vault.get(selected, { skipSelfReturn: false }) : null),
    [selected]
  );

  if (!selected || !canvas || (canvas && canvas.type !== "Canvas")) {
    return null;
  }

  return (
    <CanvasContext canvas={selected}>
      <CanvasViewInner />
    </CanvasContext>
  );
}
