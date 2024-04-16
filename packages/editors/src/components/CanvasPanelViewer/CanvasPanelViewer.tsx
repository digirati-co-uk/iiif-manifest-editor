import {
  CanvasPanel,
  CanvasContext,
  useManifest,
  AnnotationContext,
  useCanvas,
  useAnnotation,
  AuthProvider,
} from "react-iiif-vault";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { DefaultPresetOptions, DrawBox, Runtime } from "@atlas-viewer/atlas";
import { useAppState, useLayoutState, useHighlightedImageResource, useTaskRunner } from "@manifest-editor/shell";
import { ErrorBoundary } from "react-error-boundary";
import { PaddingComponentSmall, PaddingComponentMedium } from "@manifest-editor/ui/atoms/PaddingComponent";
import { BlockIcon } from "@manifest-editor/ui/icons/BlockIcon";
import { AnnotationTargetEditor } from "./components/AnnotationTargetEditor";
import { Annotations } from "./components/Annotations";
import { Highlight } from "./components/Highlight";
import { useAnnotationEditing } from "../../helpers/annotation-editing";
import * as S from "./CanvasPanelViewer.styles";
import { Loading } from "@manifest-editor/ui/atoms/Loading";
import { CanvasContainer, GhostCanvas } from "@manifest-editor/ui/components/layout/CanvasContainer";
import { EmptyCanvasState } from "@manifest-editor/ui/EmptyCanvasState";
import { ViewControls } from "@manifest-editor/ui/ViewControls";
import { MediaControls } from "@manifest-editor/ui/MediaControls";

export interface CanvasPanelViewerProps {
  onEditAnnotation?: (id: string) => void;
  highlightAnnotation?: string;
  createAnnotation?: (data: any) => void;
}

export function CanvasPanelViewer({ onEditAnnotation, highlightAnnotation, createAnnotation }: CanvasPanelViewerProps) {
  const { state } = useAppState();
  const runtime = useRef<Runtime>();
  const manifest = useManifest(); // @todo remove.
  const canvas = useCanvas();
  const annotation = useAnnotation(highlightAnnotation ? { id: highlightAnnotation } : undefined);
  const { rightPanel } = useLayoutState();
  const [editMode, toggleEditMode] = useReducer((a) => !a, false);
  const [createMode, toggleCreateAnnotation] = useReducer(
    (a: boolean, action?: boolean) => (typeof action === "undefined" ? !a : action),
    false
  );
  const [refreshKey, refresh] = useReducer((s) => s + 1, 0);
  const config = useMemo(
    () => ["default-preset", { runtimeOptions: { visibilityRatio: 1.2 } } as DefaultPresetOptions] as any,
    []
  );
  const { resources, regions } = useHighlightedImageResource();
  const { setAnnotation, annotationId: currentlyEditingAnnotation } = useAnnotationEditing();
  const [complete] = useTaskRunner("refresh-canvas", () => {
    refresh();
    complete();
  });
  const timeout = useRef<any>();
  const editModeRef = useRef(editMode);

  editModeRef.current = editMode;

  useEffect(() => {
    if (runtime.current) {
      if (!annotation) {
        runtime?.current.world.goHome();
      } else {
        if (
          annotation.target &&
          (annotation.target as any).selector &&
          (annotation.target as any).selector.type === "BoxSelector"
        ) {
          runtime.current.world.gotoRegion({
            ...((annotation.target as any).selector.spatial as any),
            padding: 100,
          });
        }
        // runtime.current?.
      }
    }
  }, [annotation?.id]);

  const canvasId = canvas?.id;

  const onClickPaintingAnnotation = useCallback((id: string) => {
    if (!editModeRef.current) {
      return;
    }
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      setAnnotation(id);
      if (onEditAnnotation) {
        onEditAnnotation(id);
      }
      timeout.current = 0;
    }, 100);
  }, []);

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
      // resetKeys={[state.canvasId, refreshKey]}
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
          --atlas-background:  #E5E7F0;
        }
      `}</style>
        <S.ViewerContainer>
          <AuthProvider>
            <CanvasPanel.Viewer
              key={`${canvasId}/${canvas?.width}/${canvas?.height}`}
              onCreated={(preset) => void (runtime.current = preset.runtime)}
              renderPreset={config}
              mode={editMode || createMode ? "sketch" : "explore"}
            >
              <CanvasContext canvas={canvasId}>
                <CanvasPanel.RenderCanvas
                  strategies={["empty", "images", "media", "textual-content"]}
                  renderViewerControls={() => (
                    <ViewControls
                      refresh={refresh}
                      editIcon
                      editMode={editMode}
                      toggleEditMode={toggleEditMode}
                      createMode={createMode}
                      toggleCreateAnnotation={createAnnotation ? toggleCreateAnnotation : undefined}
                    />
                  )}
                  viewControlsDeps={[editMode, createMode, createAnnotation]}
                  renderMediaControls={() => <MediaControls />}
                  backgroundStyle={{ background: "#fff" }}
                  alwaysShowBackground
                  onClickPaintingAnnotation={annotation ? () => void 0 : onClickPaintingAnnotation}
                >
                  {!currentlyEditingAnnotation && resources.length
                    ? resources.map((resource) => <Highlight key={resource} id={resource} />)
                    : null}
                  {(currentlyEditingAnnotation || annotation) && editMode ? (
                    <AnnotationContext annotation={annotation?.id || (currentlyEditingAnnotation as string)}>
                      <AnnotationTargetEditor />
                    </AnnotationContext>
                  ) : null}

                  {annotation && !editMode ? (
                    <Highlight
                      key={annotation.id}
                      style={{ border: "4px solid #D45380", boxShadow: "0px 3px 10px 2px #000" }}
                      id={annotation.id}
                    />
                  ) : null}

                  {Object.keys(regions).map((key) => {
                    return regions[key] ? (
                      <box
                        id={key}
                        key={key}
                        html
                        relativeStyle
                        interactive={false}
                        target={regions[key] as any}
                        style={{ border: "2px solid #488afc" }}
                      />
                    ) : null;
                  })}
                </CanvasPanel.RenderCanvas>
              </CanvasContext>
              {rightPanel.current === "canvas-properties" && rightPanel.state.current === 5 && (
                <Annotations canvasId={canvasId} />
              )}

              {createMode && createAnnotation && !editMode ? (
                <DrawBox
                  onCreate={(data) => {
                    createAnnotation(data);
                    (toggleCreateAnnotation as any)(false);
                  }}
                />
              ) : null}
            </CanvasPanel.Viewer>
          </AuthProvider>
        </S.ViewerContainer>
      </S.Container>
    </ErrorBoundary>
  );
}
