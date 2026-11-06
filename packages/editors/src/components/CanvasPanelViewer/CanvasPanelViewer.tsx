import {
  canResizeCanvas,
  getCanvasOrigin,
  canvasBackground,
  canvasWorkspaceBackground,
} from "@manifest-editor/editor-api";
import { type DefaultPresetOptions, DrawBox, ModeProvider, type Runtime } from "@atlas-viewer/atlas";
import { useAddCanvasImage } from "../CanvasLayout/useAddCanvasImage";
import { AtlasBanner, AddImageIcon } from "@manifest-editor/components";
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
import { HomeIcon } from "@manifest-editor/ui/icons/HomeIcon";
import { MinusIcon } from "@manifest-editor/ui/icons/MinusIcon";
import { PlusIcon } from "@manifest-editor/ui/icons/PlusIcon";
import { BlockIcon } from "@manifest-editor/ui/icons/BlockIcon";
import { MediaControls } from "@manifest-editor/ui/MediaControls";
import { CanvasViewerButton, ViewControls } from "@manifest-editor/ui/ViewControls";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
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
  useVault,
  useVaultSelector,
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
import { ResizeCanvasOnCanvas } from "./components/ResizeCanvasOnCanvas";
import { CustomStrategyProvider } from "./components/StrategyContext";

export interface CanvasPanelViewerProps {
  /** Enable direct positioning of painting images and layout placeholders. */
  moveMode?: boolean;
  enableAddMedia?: boolean;
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
  moveMode = false,
  enableAddMedia = false,
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
  const vault = useVault();
  const addImage = useAddCanvasImage();
  const [resizing, setResizing] = useState(false);
  const { state } = useAppState();
  const runtime = useRef<Runtime | undefined>(undefined);
  const manifest = useManifest(); // @todo remove.
  const canvas = useCanvas();
  const origin = useVaultSelector((_, v) => (canvas ? getCanvasOrigin(v, canvas.id) : { x: 0, y: 0 }), [canvas?.id]);
  const fittedRuntime = useRef<Runtime | undefined>(undefined);
  const previousOrigin = useRef({ id: canvas?.id, ...origin });
  useLayoutEffect(() => {
    const previous = previousOrigin.current;
    if (runtime.current && previous.id === canvas?.id && (previous.x !== origin.x || previous.y !== origin.y)) {
      const viewport = runtime.current.getViewport();
      runtime.current.setViewport({
        ...viewport,
        x: viewport.x + origin.x - previous.x,
        y: viewport.y + origin.y - previous.y,
      });
    }
    previousOrigin.current = { id: canvas?.id, ...origin };
  }, [canvas?.id, origin.x, origin.y]);
  const annotation = useAnnotation(highlightAnnotation ? { id: highlightAnnotation } : undefined);
  const { edit } = useLayoutActions();
  const customAnnotationComponents = useMemo(() => {
    return app.layout.annotations || [];
  }, [app.layout.annotations]);

  const store = useAtlasStore();
  const onViewerCreated = useCallback(
    (preset: { runtime: Runtime }) => {
      runtime.current = preset.runtime;
      store.getState().setAtlasRuntime(preset.runtime);
    },
    [store, canvas?.id]
  );
  const atlasRuntime = useStore(store, (state) => state.runtime);
  // Fit once when this viewer has its real world size. Later resizes retain zoom and pan.
  useEffect(() => {
    if (!atlasRuntime || atlasRuntime !== runtime.current || !canvas) return;
    const fit = () => {
      if (
        fittedRuntime.current === atlasRuntime ||
        atlasRuntime.world.width < canvas.width ||
        atlasRuntime.world.height < canvas.height
      )
        return;
      fittedRuntime.current = atlasRuntime;
      atlasRuntime.setHomePosition(
        moveMode
          ? {
              x: -canvas.width * 0.06,
              y: -canvas.height * 0.06,
              width: canvas.width * 1.12,
              height: canvas.height * 1.12,
            }
          : { x: 0, y: 0, width: canvas.width, height: canvas.height }
      );
      atlasRuntime.goHome();
    };
    const unsubscribe = atlasRuntime.world.addLayoutSubscriber((type) => {
      if (type === "recalculate-world-size") fit();
    });
    const frame = requestAnimationFrame(fit);
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [atlasRuntime, canvas?.id]);
  const mode = useStore(store, (state) => state.mode);
  const otherRequest = useStore(
    store,
    (state) => state.tool.enabled && !state.requests[state.tool.requestId || ""]?.arguments?.canvasComposition
  );

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
    false
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
    [controlledEditMode, editMode, onControlledEditModeChange, toggleInternalEditMode]
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
    [controlledCreateMode, createMode, onCreateModeChange]
  );
  const [refreshKey, refresh] = useReducer((s) => s + 1, 0);
  const config = useMemo(
    () =>
      [
        "default-preset",
        {
          runtimeOptions: {
            visibilityRatio: 0.65,
            maxOverZoom: 5,
            maxUnderZoom: 0.7,
          },
        } as DefaultPresetOptions,
      ] as any,
    []
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
  const timeout = useRef<any>(undefined);
  const editModeRef = useRef(editMode);

  useEffect(() => {
    store.getState().reset();
  }, [canvas?.id, store]);

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
  const canvasBackgroundColor = canvasBackground((canvas as any)?.backgroundColor);

  const homePosition = useMemo(() => {
    const width = canvas?.width ?? 0;
    const height = canvas?.height ?? 0;
    return moveMode
      ? { x: -width * 0.06, y: -height * 0.06, width: width * 1.12, height: height * 1.12 }
      : { x: 0, y: 0, width, height };
  }, [canvas?.width, canvas?.height, moveMode]);

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
      }
    `}</style>
          <S.ViewerContainer
            style={
              {
                "--canvas-workspace-background": canvasWorkspaceBackground(canvasBackgroundColor),
                "--atlas-background": canvasWorkspaceBackground(canvasBackgroundColor),
              } as any
            }
          >
            {(createMode && createAnnotation && !editMode) ||
            ((currentlyEditingAnnotation || annotation) && editMode) ? (
              <AtlasBanner controlsId="atlas-controls">Draw a box or select a shape</AtlasBanner>
            ) : null}
            <AuthProvider>
              <CanvasPanel.Viewer
                key={canvasId}
                onCreated={onViewerCreated}
                background={canvasWorkspaceBackground(canvasBackgroundColor)}
                resetWorldOnChange={false}
                renderPreset={config}
                mode={chosenMode}
                runtimeOptions={config[1].runtimeOptions}
                updateViewportTimeout={0}
                homePosition={homePosition}
                readyResetKey={canvasId}
              >
                <AdditionalContextBridgeInner>
                  <CanvasContext canvas={canvasId}>
                    <InternalRenderCanvas
                      moveMode={moveMode}
                      resizing={resizing}
                      onResizeDone={() => setResizing(false)}
                      backgroundStyle={{ backgroundColor: canvasBackgroundColor }}
                      alwaysShowBackground
                      onClickPaintingAnnotation={moveMode || annotation ? () => void 0 : onClickPaintingAnnotation}
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
                    {/*<ResizeCanvasOnCanvas />*/}
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
            {moveMode && (
              <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6, zIndex: 20 }}>
                {enableAddMedia && (
                  <CanvasViewerButton
                    type="button"
                    aria-label="Add media"
                    title="Add media"
                    onClick={() => void addImage()}
                  >
                    <AddImageIcon />
                  </CanvasViewerButton>
                )}
                {canvas && canResizeCanvas(vault, canvas) && (
                  <CanvasViewerButton
                    type="button"
                    aria-label="Resize canvas"
                    aria-pressed={resizing}
                    style={{
                      fontSize: 13,
                      transition: "none",
                      background: resizing ? "#b84c74" : "white",
                      color: resizing ? "white" : "#332f2c",
                    }}
                    onClick={() => setResizing((value) => !value)}
                  >
                    Resize canvas
                  </CanvasViewerButton>
                )}
                <CanvasViewerButton type="button" aria-label="Home" onClick={() => runtime.current?.world.goHome()}>
                  <HomeIcon />
                </CanvasViewerButton>
                <CanvasViewerButton
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => runtime.current?.world.zoomTo(1 / 0.75)}
                >
                  <MinusIcon />
                </CanvasViewerButton>
                <CanvasViewerButton
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => runtime.current?.world.zoomTo(0.75)}
                >
                  <PlusIcon />
                </CanvasViewerButton>
              </div>
            )}
            {(!moveMode || otherRequest) && (
              <AnnotationEditingTools
                forceVisible={forceAnnotationTools || editMode || createMode || Boolean(editingAnnotationId)}
              />
            )}
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
        renderViewerControls={() =>
          moveMode ? null : (
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
          )
        }
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
