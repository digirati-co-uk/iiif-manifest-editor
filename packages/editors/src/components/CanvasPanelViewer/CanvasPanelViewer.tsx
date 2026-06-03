import { type DefaultPresetOptions, DrawBox, ModeProvider, type Runtime } from "@atlas-viewer/atlas";
import { AtlasBanner } from "@manifest-editor/components";
import {
  FLAG_TAG,
  ManifestEditorTagIcon,
  useApp,
  useAppState,
  useAtlasStore,
  useEmitter,
  useHighlightedImageResource,
  useLayoutActions,
  useLayoutState,
  useResourceTagActions,
  useResourceTags,
  useTaskRunner,
} from "@manifest-editor/shell";
import { Loading } from "@manifest-editor/ui/atoms/Loading";
import { PaddingComponentMedium, PaddingComponentSmall } from "@manifest-editor/ui/atoms/PaddingComponent";
import { CanvasContainer, GhostCanvas } from "@manifest-editor/ui/components/layout/CanvasContainer";
import { EmptyCanvasState } from "@manifest-editor/ui/EmptyCanvasState";
import { BlockIcon } from "@manifest-editor/ui/icons/BlockIcon";
import { MediaControls } from "@manifest-editor/ui/MediaControls";
import { CanvasViewerButton, ViewControls } from "@manifest-editor/ui/ViewControls";
import { Fragment, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  AnnotationContext,
  AuthProvider,
  CanvasContext,
  CanvasPanel,
  useAnnotation,
  useCanvas,
  useCanvasChoices,
  useManifest,
} from "react-iiif-vault";
import { useTheme } from "styled-components";
import { useStore } from "zustand";
import { useAnnotationEditing } from "../../helpers/annotation-editing";
import { getInternationalStringText } from "../../helpers/choice-painting-annotations";
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

  /**
   * Optional controlled create mode for consumers that embed the Atlas viewer
   * outside the standard CanvasPanelEditor shell.
   */
  createMode?: boolean;
  onCreateModeChange?: (createMode: boolean) => void;

  /**
   * Optional controlled edit mode for consumers that need the annotation tools
   * without the normal ViewControls wrapper.
   */
  controlledEditMode?: boolean;
  onControlledEditModeChange?: (editMode: boolean) => void;

  /**
   * When provided with controlledEditMode, this annotation is pushed into the
   * annotation editing store so the SVG tools can edit its target.
   */
  editingAnnotationId?: string | null;

  /**
   * Forces the Atlas annotation toolbar to be visible even if the request store
   * has not explicitly enabled it yet. Useful in embedded workbench modes.
   */
  forceAnnotationTools?: boolean;
}

export function CanvasPanelViewer({
  asFallback,
  onEditAnnotation,
  highlightAnnotation,
  createAnnotation,
  createMode: controlledCreateMode,
  onCreateModeChange,
  controlledEditMode,
  onControlledEditModeChange,
  editingAnnotationId,
  forceAnnotationTools = false,
}: CanvasPanelViewerProps) {
  const app = useApp();
  const { state } = useAppState();
  const runtime = useRef<Runtime>();
  const manifest = useManifest(); // @todo remove.
  const canvas = useCanvas();
  const annotation = useAnnotation(highlightAnnotation ? { id: highlightAnnotation } : undefined);
  const { edit } = useLayoutActions();
  const customAnnotationComponents = useMemo(() => {
    return app.layout.annotations || [];
  }, [app.layout.annotations]);

  const store = useAtlasStore();
  const mode = useStore(store, (state) => state.mode);

  const onNextCanvas = useMemo(() => {
    //
    const currentCanvasIndex = manifest?.items?.findIndex((item) => item.id === canvas?.id);
    const nextCanvas = typeof currentCanvasIndex === "number" ? manifest?.items?.[currentCanvasIndex + 1] : undefined;
    if (nextCanvas) {
      return () => {
        edit({ id: nextCanvas.id, type: "Canvas" }, undefined, { forceOpen: false });
      };
    }
  }, []);

  const onPreviousCanvas = useMemo(() => {
    //
    const currentCanvasIndex = manifest?.items?.findIndex((item) => item.id === canvas?.id);
    const previousCanvas =
      typeof currentCanvasIndex === "number" ? manifest?.items?.[currentCanvasIndex - 1] : undefined;
    if (previousCanvas) {
      return () => {
        edit({ id: previousCanvas.id, type: "Canvas" }, undefined, { forceOpen: false });
      };
    }
  }, []);

  const { rightPanel } = useLayoutState();
  const { editMode: internalEditMode, toggleEditMode: toggleInternalEditMode } = useEditingMode();
  const [internalCreateMode, setInternalCreateMode] = useReducer(
    (a: boolean, action?: boolean) => (typeof action === "undefined" ? !a : action),
    false,
  );

  const editMode = typeof controlledEditMode === "boolean" ? controlledEditMode : internalEditMode;
  const createMode = typeof controlledCreateMode === "boolean" ? controlledCreateMode : internalCreateMode;

  const toggleEditMode = useCallback(
    (next?: boolean) => {
      const nextValue = typeof next === "undefined" ? !editMode : next;

      if (typeof controlledEditMode === "boolean") {
        onControlledEditModeChange?.(nextValue);
        return;
      }

      if (typeof next === "boolean") {
        (toggleInternalEditMode as any)(next);
        return;
      }

      toggleInternalEditMode();
    },
    [controlledEditMode, editMode, onControlledEditModeChange, toggleInternalEditMode],
  );

  const toggleCreateAnnotation = useCallback(
    (next?: boolean) => {
      const nextValue = typeof next === "undefined" ? !createMode : next;

      if (typeof controlledCreateMode === "boolean") {
        onCreateModeChange?.(nextValue);
        return;
      }

      setInternalCreateMode(nextValue);
    },
    [controlledCreateMode, createMode, onCreateModeChange],
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

  useEffect(() => {
    if (!editingAnnotationId || !editMode) {
      return;
    }

    setAnnotation(editingAnnotationId);
  }, [editingAnnotationId, editMode, setAnnotation]);
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
            <AnnotationEditingTools
              forceVisible={forceAnnotationTools || editMode || createMode || Boolean(editingAnnotationId)}
            />
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
            enableNavigation={!!(onNextCanvas || onPreviousCanvas)}
            onNext={onNextCanvas}
            onPrevious={onPreviousCanvas}
            toggleCreateAnnotation={createAnnotation ? toggleCreateAnnotation : undefined}
            extraControls={
              <>
                <CanvasChoiceControls canvasId={canvasId} />
                <CanvasViewerFlagButton canvasId={canvasId} />
              </>
            }
          />
        )}
        viewControlsDeps={[editMode, createMode, createAnnotation, annotation, onNextCanvas, onPreviousCanvas]}
        renderMediaControls={() => <MediaControls />}
      >
        <NonAtlasStrategyRenderer>{innerViewer}</NonAtlasStrategyRenderer>
      </CustomStrategyProvider>
    </ErrorBoundary>
  );
}

function CanvasViewerFlagButton({ canvasId }: { canvasId: string }) {
  const resource = { id: canvasId, type: "Canvas" };
  const tags = useResourceTags(resource);
  const { toggleTag } = useResourceTagActions(resource);
  const flagged = tags.some((tag) => tag.type === FLAG_TAG.type && tag.id === FLAG_TAG.id);

  return (
    <CanvasViewerButton
      type="button"
      data-control="flag"
      aria-label={flagged ? "Remove flag" : "Flag canvas"}
      aria-pressed={flagged}
      title={flagged ? "Remove flag" : "Flag canvas"}
      $active={flagged}
      onClick={() => toggleTag(FLAG_TAG)}
    >
      <ManifestEditorTagIcon icon={FLAG_TAG.icon} />
    </CanvasViewerButton>
  );
}

function CanvasChoiceControls({ canvasId }: { canvasId: string }) {
  const { choices, actions } = useCanvasChoices({ canvasId });

  if (!choices.length) {
    return null;
  }

  return (
    <>
      {choices.flatMap((choiceSet, choiceSetIndex) => {
        const complexChoice = choiceSet.choice as any;
        const choiceGroups = complexChoice?.type === "complex-choice" ? complexChoice.items || [] : [complexChoice];

        return choiceGroups.map((choice: any, choiceIndex: number) => {
          const selected = choice.items?.find((item: any) => item.selected)?.id || choice.items?.[0]?.id || "";
          return (
            <select
              key={`${choiceSet.canvasId}-${choiceSetIndex}-${choiceIndex}`}
              aria-label="Canvas choice"
              className="rounded border border-gray-200 bg-white px-2 py-2 text-sm shadow-sm"
              value={selected}
              onChange={(event) => actions.makeChoice(event.target.value, { deselectOthers: true })}
            >
              {(choice.items || []).map((item: any, itemIndex: number) => (
                <option key={item.id} value={item.id}>
                  {getInternationalStringText(item.label, `Option ${itemIndex + 1}`)}
                </option>
              ))}
            </select>
          );
        });
      })}
    </>
  );
}
