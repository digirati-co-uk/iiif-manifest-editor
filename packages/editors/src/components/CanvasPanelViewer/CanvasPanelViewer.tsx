import { type DefaultPresetOptions, DrawBox, ModeProvider, type Runtime } from "@atlas-viewer/atlas";
import { AtlasBanner } from "@manifest-editor/components";
import {
  useApp,
  useAppState,
  useAtlasStore,
  useEmitter,
  useHighlightedImageResource,
  useLayoutState,
  useTaskRunner,
} from "@manifest-editor/shell";
import { Loading } from "@manifest-editor/ui/atoms/Loading";
import { PaddingComponentMedium, PaddingComponentSmall } from "@manifest-editor/ui/atoms/PaddingComponent";
import { CanvasContainer, GhostCanvas } from "@manifest-editor/ui/components/layout/CanvasContainer";
import { EmptyCanvasState } from "@manifest-editor/ui/EmptyCanvasState";
import { BlockIcon } from "@manifest-editor/ui/icons/BlockIcon";
import { MediaControls } from "@manifest-editor/ui/MediaControls";
import { ViewControls } from "@manifest-editor/ui/ViewControls";
import { Fragment, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  AnnotationContext,
  AuthProvider,
  CanvasContext,
  CanvasPanel,
  RenderAnnotationEditing,
  useAnnotation,
  useCanvas,
  useManifest,
} from "react-iiif-vault";
import { useStore } from "zustand";
import { useAnnotationEditing } from "../../helpers/annotation-editing";
import { useEditingMode } from "../../helpers/editing-mode";
import { DrawPolygon } from "../DrawPolygon/DrawPolygon";
import * as S from "./CanvasPanelViewer.styles";
import { AdditionalContextBridge, AdditionalContextBridgeInner } from "./components/AdditionalContextBridge";
import { AnnotationEditingTools } from "./components/AnnotationEditingTools";
import { Annotations } from "./components/Annotations";
import { Highlight } from "./components/Highlight";
import { InternalRenderCanvas } from "./components/InternalRenderCanvas";
import { NonAtlasStrategyRenderer } from "./components/NonAtlasStrategyRenderer";
import { CustomStrategyProvider } from "./components/StrategyContext";

export interface CanvasPanelViewerProps {
  asFallback?: boolean;
  onEditAnnotation?: (id: string) => void;
  highlightAnnotation?: string;
  createAnnotation?: (data: any) => void;
}

export function CanvasPanelViewer({
  asFallback,
  onEditAnnotation,
  highlightAnnotation,
  createAnnotation,
}: CanvasPanelViewerProps) {
  const app = useApp();
  const { state } = useAppState();
  const runtime = useRef<Runtime>();
  const manifest = useManifest(); // @todo remove.
  const canvas = useCanvas();
  const annotation = useAnnotation(highlightAnnotation ? { id: highlightAnnotation } : undefined);
  const customAnnotationComponents = useMemo(() => {
    return app.layout.annotations || [];
  }, [app.layout.annotations]);

  const store = useAtlasStore();
  const mode = useStore(store, (state) => state.mode);

  const { rightPanel } = useLayoutState();
  const { editMode, toggleEditMode } = useEditingMode();
  const [createMode, toggleCreateAnnotation] = useReducer(
    (a: boolean, action?: boolean) => (typeof action === "undefined" ? !a : action),
    false,
  );
  const [refreshKey, refresh] = useReducer((s) => s + 1, 0);
  const config = useMemo(
    () =>
      [
        "default-preset",
        {
          runtimeOptions: {
            visibilityRatio: 0.45,
            maxOverZoom: 5,
          },
        } as DefaultPresetOptions,
      ] as any,
    [],
  );
  const { resources, regions } = useHighlightedImageResource();
  const { setAnnotation, annotationId: currentlyEditingAnnotation } = useAnnotationEditing();
  const [complete] = useTaskRunner("refresh-canvas", () => {
    refresh();
    complete();
  });
  const timeout = useRef<any>();
  const editModeRef = useRef(editMode);

  useEffect(() => {
    store.getState().reset();
  }, [canvas]);

  editModeRef.current = editMode;

  // Turn this off for now.
  // useEffect(() => {
  //   if (runtime.current) {
  //     if (!annotation) {
  //       runtime?.current.world.goHome();
  //     } else {
  //       if (
  //         annotation.target &&
  //         (annotation.target as any).selector &&
  //         (annotation.target as any).selector.type === "BoxSelector"
  //       ) {
  //         runtime.current.world.gotoRegion({
  //           ...((annotation.target as any).selector.spatial as any),
  //           padding: 100,
  //         });
  //       }
  //       // runtime.current?.
  //     }
  //   }
  // }, [annotation?.id]);

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
          <PaddingComponentSmall> No canvas selected</PaddingComponentSmall>
          <PaddingComponentMedium />
          <PaddingComponentSmall>Manage your canvases on the left </PaddingComponentSmall>
          <PaddingComponentSmall>Edit your manifest properties on the right</PaddingComponentSmall>
        </GhostCanvas>
      </CanvasContainer>
    );
  }

  const chosenMode = editMode || createMode ? "sketch" : mode;

  const innerViewer = (
    <ModeProvider mode={chosenMode}>
      <AdditionalContextBridge>
        <S.Container key={refreshKey} className="animate-fadeIn relative">
          <style>{`
      .atlas-container {
        min-width: 0;
        min-height: 0;
        --atlas-container-flex: 1 1 0px;
        --atlas-background:  #E5E7F0;
      }
    `}</style>
          <S.ViewerContainer>
            {(createMode && createAnnotation && !editMode) ||
            ((currentlyEditingAnnotation || annotation) && editMode) ? (
              <AtlasBanner controlsId="atlas-controls">Draw a box or select a shape</AtlasBanner>
            ) : null}
            <AuthProvider>
              <CanvasPanel.Viewer
                key={`${canvasId}/${canvas?.width}/${canvas?.height}`}
                onCreated={(preset) => {
                  runtime.current = preset.runtime as any;
                  store.getState().setAtlasRuntime(preset.runtime);
                }}
                renderPreset={config}
                mode={chosenMode}
                runtimeOptions={config[1].runtimeOptions}
                updateViewportTimeout={500}
              >
                <AdditionalContextBridgeInner>
                  <CanvasContext canvas={canvasId}>
                    <InternalRenderCanvas
                      backgroundStyle={{ background: "#fff" }}
                      alwaysShowBackground
                      onClickPaintingAnnotation={annotation ? () => void 0 : onClickPaintingAnnotation}
                    >
                      {customAnnotationComponents.map((custom) => {
                        return <Fragment key={custom.id}>{custom.render()}</Fragment>;
                      })}

                      {!currentlyEditingAnnotation && resources.length
                        ? resources.map((resource) => <Highlight key={resource} id={resource} />)
                        : null}

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
                    </InternalRenderCanvas>
                  </CanvasContext>
                  {rightPanel.current === "canvas-properties" && rightPanel.state.current === 5 && (
                    <Annotations canvasId={canvasId} />
                  )}

                  {createMode && createAnnotation && !editMode ? (
                    <DrawPolygon
                      onCreate={(data) => {
                        createAnnotation({
                          type: "polygon",
                          shape: data,
                        });
                        (toggleCreateAnnotation as any)(false);
                      }}
                    />
                  ) : null}
                </AdditionalContextBridgeInner>
              </CanvasPanel.Viewer>
            </AuthProvider>
            <AnnotationEditingTools />
          </S.ViewerContainer>
        </S.Container>
        <div id="floating-ui" />
      </AdditionalContextBridge>
    </ModeProvider>
  );

  if (asFallback) {
    return innerViewer;
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
      <CustomStrategyProvider
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
        viewControlsDeps={[editMode, createMode, createAnnotation, annotation]}
        renderMediaControls={() => <MediaControls />}
      >
        <NonAtlasStrategyRenderer>{innerViewer}</NonAtlasStrategyRenderer>
      </CustomStrategyProvider>
    </ErrorBoundary>
  );
}
