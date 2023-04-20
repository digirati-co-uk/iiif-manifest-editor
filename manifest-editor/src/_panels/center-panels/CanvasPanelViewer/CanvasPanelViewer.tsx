import { CanvasPanel, CanvasContext, useManifest, AnnotationContext, useVault, useCanvas } from "react-iiif-vault";
import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { DefaultPresetOptions, Runtime } from "@atlas-viewer/atlas";
import { ErrorBoundary } from "react-error-boundary";
import { useAppState } from "@/shell/AppContext/AppContext";
import { useLayoutState } from "@/shell/Layout/Layout.context";
import { CanvasContainer, GhostCanvas } from "@/components/layout/CanvasContainer";
import { EmptyCanvasState } from "@/components/organisms/EmptyCanvasState/EmptyCanvasState";
import { BlockIcon } from "@/icons/BlockIcon";
import { PaddingComponentMedium, PaddingComponentSmall } from "@/atoms/PaddingComponent";
import { Loading } from "@/atoms/Loading";
import { ViewControls } from "./components/ViewControls";
import { Annotations } from "./components/Annotations";
import { MediaControls } from "./components/MediaControls";
import * as S from "./CanvasPanelViewer.styles";
import { useHighlightedImageResource } from "@/state/highlighted-image-resources";
import { Highlight } from "@/_panels/center-panels/CanvasPanelViewer/components/Highlight";
import { useAnnotationEditing } from "@/state/annotationg-editing";
import { AnnotationTargetEditor } from "@/_panels/center-panels/CanvasPanelViewer/components/AnnotationTargetEditor";
import { useTaskRunner } from "@/shell/TaskBridge/TaskBridge";

export interface CanvasPanelViewerProps {
  onEditAnnotation?: (id: string) => void;
}

export function CanvasPanelViewer({ onEditAnnotation }: CanvasPanelViewerProps) {
  const { state } = useAppState();
  const runtime = useRef<Runtime>();
  const manifest = useManifest(); // @todo remove.
  const canvas = useCanvas();
  const { rightPanel } = useLayoutState();
  const [editMode, toggleEditMode] = useReducer((a) => !a, false);
  const [refreshKey, refresh] = useReducer((s) => s + 1, 0);
  const config = useMemo(
    () => ["default-preset", { runtimeOptions: { visibilityRatio: 1.2 } } as DefaultPresetOptions] as any,
    []
  );
  const { resources } = useHighlightedImageResource();
  const { setAnnotation, annotationId: currentlyEditingAnnotation } = useAnnotationEditing();
  const [complete] = useTaskRunner("refresh-canvas", () => {
    refresh();
    complete();
  });

  const canvasId = canvas?.id;

  console.log("canvas id", canvasId);

  const onClickPaintingAnnotation = useCallback(
    (id: string) => {
      console.log("on click painting", id);

      //if (editMode) {
      setAnnotation(id);
      //}
      if (onEditAnnotation) {
        onEditAnnotation(id);
      }
    },
    [editMode]
  );

  useEffect(() => {
    if (!editMode) {
      setAnnotation(null);
    }
  }, [editMode]);

  useEffect(() => {
    runtime.current?.goHome();
  }, [state.canvasId]);

  if (!manifest) {
    return <Loading />;
  }

  if (!manifest || manifest?.items.length === 0) {
    return <EmptyCanvasState />;
  }

  if (!canvasId) {
    return (
      <CanvasContainer>
        <GhostCanvas>
          <BlockIcon color="grey" />
          <PaddingComponentSmall> No canvas selected </PaddingComponentSmall>
          <PaddingComponentMedium />
          <PaddingComponentSmall>Manage your canvases on the left </PaddingComponentSmall>
          <PaddingComponentSmall>Edit your manifest properties on the right</PaddingComponentSmall>
        </GhostCanvas>
      </CanvasContainer>
    );
  }

  return (
    <ErrorBoundary
      resetKeys={[state.canvasId, refreshKey]}
      fallbackRender={() => (
        <CanvasContainer>
          <GhostCanvas>Something went wrong</GhostCanvas>
        </CanvasContainer>
      )}
    >
      <S.Container key={refreshKey}>
        <style>{`
        .atlas-container {
          min-width: 0;
          min-height: 0;
          --atlas-container-flex: 1 1 0px;
          --atlas-background:  #f9f9f9;
        }
      `}</style>
        <S.ViewerContainer>
          <CanvasPanel.Viewer
            key={canvasId}
            onCreated={(preset) => void (runtime.current = preset.runtime)}
            renderPreset={config}
            mode={editMode ? "sketch" : "explore"}
          >
            <CanvasContext canvas={canvasId}>
              <CanvasPanel.RenderCanvas
                strategies={["empty", "images", "media", "textual-content"]}
                renderViewerControls={() => (
                  <ViewControls refresh={refresh} editIcon editMode={editMode} toggleEditMode={toggleEditMode} />
                )}
                viewControlsDeps={[editMode]}
                renderMediaControls={() => <MediaControls />}
                backgroundStyle={{ background: "#fff" }}
                alwaysShowBackground
                onClickPaintingAnnotation={onClickPaintingAnnotation}
              >
                {!currentlyEditingAnnotation && resources.length
                  ? resources.map((resource) => <Highlight key={resource} id={resource} />)
                  : null}
                {currentlyEditingAnnotation && editMode ? (
                  <AnnotationContext annotation={currentlyEditingAnnotation}>
                    <AnnotationTargetEditor />
                  </AnnotationContext>
                ) : null}
              </CanvasPanel.RenderCanvas>
            </CanvasContext>
            {rightPanel.current === "canvas-properties" && rightPanel.state.current === 5 && (
              <Annotations canvasId={canvasId} />
            )}
          </CanvasPanel.Viewer>
        </S.ViewerContainer>
      </S.Container>
    </ErrorBoundary>
  );
}
