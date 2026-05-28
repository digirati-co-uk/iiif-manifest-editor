import { addMappings, importEntities } from "@iiif/helpers/vault/actions";
import { ActionButton, SidebarContent } from "@manifest-editor/components";
import { useInStack } from "@manifest-editor/editors";
import {
  type LayoutPanel,
  ResourceEditingProvider,
  useCreator,
  useInlineCreator,
  useLayoutActions,
  useManifestEditor,
} from "@manifest-editor/shell";
import MoveIcon from "@manifest-editor/ui/icons/MoveIcon";
import SlideshowIcon from "@manifest-editor/ui/icons/SlideshowIcon";
import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "react-aria-components";
import {
  AnnotationPageContext,
  CanvasContext,
  LocaleString,
  useCanvas,
  useVault,
  useVaultSelector,
} from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { SlideshowSlidePreview } from "../components/SlideshowSlidePreview";
import { TourAnnotationPageEditor } from "../components/TourAnnotationPageEditor";
import {
  createDefaultSlideContentTarget,
  getAnnotationTargetBox,
  getPaintingAnnotations,
  getSlideLayoutRegions,
  getTourStepAnnotations,
  repairSlideContentTargets,
  type SlideContentBox,
  setAnnotationTargetBox,
  setSlideTextRegionBox,
  useSlideshowContentPositioning,
  useSlideshowWorkbenchState,
} from "../slideshow-content-positioning";

const contentCreatorOptions = {
  skipEditingOnCreate: true,
};

const DEFAULT_TOUR_STEP_HTML = "<h2>New step</h2><p>Description</p>";

export const slideshowCenterPanel: LayoutPanel = {
  id: "@exhibitions/slideshow-center-panel",
  label: "Slideshow workbench",
  icon: <SlideshowIcon />,
  render: () => <SlideshowCenterPanel />,
};

function SlideshowCenterPanel() {
  const { structural, technical } = useManifestEditor();
  const items = structural.items.get();
  const manifest = { id: technical.id.get(), type: "Manifest" };
  const vault = useVault();
  const [, canvasActions] = useCreator(manifest, "items", "Canvas", undefined, {
    isPainting: true,
  });
  const editingCanvas = useInStack("Canvas");
  const { edit } = useLayoutActions();
  const clearContentPositioning = useSlideshowContentPositioning(
    (state) => state.clear,
  );

  const selectedCanvasId = editingCanvas?.resource.source.id || items[0]?.id;
  const selectedIndex = selectedCanvasId
    ? items.findIndex((item) => item.id === selectedCanvasId)
    : -1;
  const selectedSlideIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const selectedItem =
    selectedIndex >= 0 ? items[selectedIndex] : items[0] || null;

  useEffect(() => {
    for (const item of items) {
      repairSlideContentTargets(vault, vault.get(item as any));
    }
  }, [items, vault]);

  const addNewSlide = () => {
    canvasActions.createFiltered(
      "exhibition-slideshow-slide",
      items.length ? selectedSlideIndex + 1 : undefined,
    );
  };

  const openSlide = (
    item: { id: string; type?: string },
    index: number,
    forceOpen = false,
  ) => {
    edit(
      { id: item.id, type: "Canvas" },
      { parent: manifest, property: "items", index },
      { forceOpen },
    );
  };

  const selectSlide = (item: { id: string; type?: string }, index: number) => {
    clearContentPositioning();
    openSlide(item, index);
  };

  const deleteSlide = (index: number) => {
    const item = items[index];
    if (!item || !confirm("Are you sure you want to delete this slide?")) {
      return;
    }

    const nextItem = items[index + 1] || items[index - 1] || null;
    const nextIndex = items[index + 1] ? index : index - 1;

    clearContentPositioning();
    structural.items.deleteAtIndex(index);

    if (nextItem) {
      openSlide(nextItem, Math.max(0, nextIndex));
    }
  };

  const previousSlide =
    selectedSlideIndex > 0 ? items[selectedSlideIndex - 1] : undefined;
  const nextSlide =
    selectedSlideIndex < items.length - 1
      ? items[selectedSlideIndex + 1]
      : undefined;

  if (!items.length) {
    return (
      <SlideshowWorkbenchShell>
        <div className="flex min-h-full items-center justify-center px-24 py-12">
          <div className="w-full max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-me-primary-500">
              Slideshow exhibition
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Create your first slideshow slide
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Add a new slide and choose one of the supported slideshow slide
              types. You can add images, text, media, and tour steps after the
              slide is created.
            </p>
            <div className="mt-8">
              <ActionButton primary large onPress={addNewSlide}>
                Add new slide
              </ActionButton>
            </div>
          </div>
        </div>
      </SlideshowWorkbenchShell>
    );
  }

  return (
    <SlideshowWorkbenchShell>
      <div className="exhibition-slideshow-main flex min-h-full flex-col gap-6 pb-12 pt-16">
        <div
          className="flex flex-wrap items-center gap-3 px-8"
          style={{
            paddingInlineStart:
              "calc(2rem + var(--manifest-editor-layout-left-sidebar-small, 0px))",
            paddingInlineEnd:
              "calc(2rem + var(--manifest-editor-layout-right-sidebar-small, 0px))",
          }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-me-primary-500">
              Slideshow workbench
            </p>
            <h2 className="exhibition-slideshow-heading truncate text-2xl font-bold text-slate-900">
              {selectedItem ? (
                <CanvasContext canvas={selectedItem.id}>
                  <SelectedSlideTitle />
                </CanvasContext>
              ) : (
                "Slides"
              )}
            </h2>
            <p className="exhibition-slideshow-muted mt-1 text-sm font-semibold text-slate-500">
              Slide {selectedSlideIndex + 1} of {items.length}
            </p>
          </div>
          <SlideNavigation
            current={selectedSlideIndex + 1}
            total={items.length}
            onPrevious={
              previousSlide
                ? () => selectSlide(previousSlide, selectedSlideIndex - 1)
                : undefined
            }
            onNext={
              nextSlide
                ? () => selectSlide(nextSlide, selectedSlideIndex + 1)
                : undefined
            }
          />
          <div>
            <ActionButton primary onPress={addNewSlide}>
              Add new slide
            </ActionButton>
          </div>
        </div>

        <div
          className="flex flex-1 flex-col gap-5 px-8"
          style={{
            paddingInlineStart:
              "calc(1.5rem + var(--manifest-editor-layout-left-sidebar-small, 0px))",
            paddingInlineEnd:
              "calc(1.5rem + var(--manifest-editor-layout-right-sidebar-small, 0px))",
          }}
        >
          <div className="exhibition-slideshow-preview-frame flex items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            {selectedItem ? (
              <CanvasContext canvas={selectedItem.id}>
                <SelectedSlidePreview />
              </CanvasContext>
            ) : null}
          </div>

          <aside className="exhibition-slideshow-slide-strip overflow-hidden rounded-lg border border-slate-200 bg-white p-4">
            <div className="exhibition-slideshow-heading mb-3 text-sm font-semibold text-slate-700">
              Slides
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {items.map((item, index) => (
                <CanvasContext key={item.id} canvas={item.id}>
                  <SlideStripItem
                    index={index}
                    selected={selectedItem?.id === item.id}
                    onPress={() => selectSlide(item, index)}
                    onDelete={() => deleteSlide(index)}
                  />
                </CanvasContext>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </SlideshowWorkbenchShell>
  );
}

function SlideshowWorkbenchShell({ children }: { children: ReactNode }) {
  return (
    <SidebarContent className="exhibition-slideshow-workbench h-full overflow-x-hidden overflow-y-auto bg-[#f8f6f3]">
      {children}
    </SidebarContent>
  );
}

function SelectedSlideTitle() {
  const canvas = useCanvas();
  const title = getLanguageMapValue(canvas?.label, "Untitled slide");

  return <>{title || "Untitled slide"}</>;
}

function SlideNavigation({
                           current,
                           total,
                           onPrevious,
                           onNext,
                         }: {
  current: number;
  total: number;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="exhibition-slideshow-navigation flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white text-sm text-slate-800 shadow-sm">
      <Button
        className="border-none bg-white px-5 py-3 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
        isDisabled={!onPrevious}
        onPress={onPrevious}
      >
        Previous
      </Button>
      <span className="exhibition-slideshow-navigation-current flex min-w-[96px] items-center justify-center border-x border-slate-200 bg-slate-50 px-4 font-bold text-slate-900">
        {current} of {total}
      </span>
      <Button
        className="border-none bg-white px-5 py-3 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
        isDisabled={!onNext}
        onPress={onNext}
      >
        Next
      </Button>
    </div>
  );
}

function TourStepNavigation({
                              current,
                              total,
                              onPrevious,
                              onNext,
                            }: {
  current: number;
  total: number;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="exhibition-slideshow-navigation flex items-stretch overflow-hidden rounded-md border border-slate-200 bg-white text-xs text-slate-800 shadow-sm">
      <Button
        className="border-none bg-white px-3 py-2 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
        isDisabled={!onPrevious}
        onPress={onPrevious}
      >
        Previous step
      </Button>
      <span className="exhibition-slideshow-navigation-current flex min-w-[84px] items-center justify-center border-x border-slate-200 bg-slate-50 px-3 font-bold text-slate-900">
        {total ? `${current} of ${total}` : "0 of 0"}
      </span>
      <Button
        className="border-none bg-white px-3 py-2 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
        isDisabled={!onNext}
        onPress={onNext}
      >
        Next step
      </Button>
    </div>
  );
}

function SelectedSlidePreview() {
  const canvas = useCanvas();
  const vault = useVault();
  const inlineCreator = useInlineCreator();
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [targetDrawingMode, setTargetDrawingMode] = useState<
    | { type: "add" }
    | { type: "edit"; annotationId: string }
    | null
  >(null);
  const [targetDrawingTool, setTargetDrawingTool] = useState<
    "box" | "circle" | "line" | "polygon"
  >("box");
  const previousAnnotationCount = useRef<number | null>(null);
  const previousTourStepCount = useRef<number | null>(null);
  const annotationPageId = canvas?.annotations?.[0]?.id;
  const pageRef = canvas?.items?.[0]
    ? { id: canvas.items[0].id, type: "AnnotationPage" }
    : undefined;
  const [, contentActions] = useCreator(
    pageRef,
    "items",
    "Annotation",
    canvas ? (createDefaultSlideContentTarget(canvas) as any) : undefined,
    { isPainting: true },
  );
  const {
    selectedAnnotationId,
    repositioningAnnotationId,
    selectedTextRegion,
    repositioningTextRegion,
    selectedTourStepId,
    selectAnnotation,
    startRepositioning,
    stopRepositioning,
    startTextRepositioning,
    stopTextRepositioning,
    selectTourStep,
    stopTourStepRepositioning,
  } = useSlideshowContentPositioning();
  const requestWorkbenchTab = useSlideshowWorkbenchState(
    (state) => state.requestTab,
  );
  const showTourSteps = useSlideshowWorkbenchState(
    (state) => state.showTourSteps,
  );
  const setShowTourSteps = useSlideshowWorkbenchState(
    (state) => state.setShowTourSteps,
  );
  const annotations = useVaultSelector(
    (_, vaultInstance) =>
      canvas ? getPaintingAnnotations(vaultInstance, canvas) : [],
    [canvas?.id, pageRef?.id],
  );
  const selectedAnnotation = annotations.find(
    (annotation: any) => annotation.id === selectedAnnotationId,
  );
  const selectedTextRegionBox =
    selectedTextRegion === "editorial-text"
      ? getSlideLayoutRegions(canvas).text
      : null;
  const tourSteps = useVaultSelector(
    (_, vaultInstance) =>
      canvas ? getTourStepAnnotations(vaultInstance, canvas) : [],
    [canvas?.id, annotationPageId],
  );
  const selectedTourStep =
    tourSteps.find((annotation: any) => annotation.id === selectedTourStepId) ||
    tourSteps[0];
  const selectedTourStepIndex = selectedTourStep
    ? Math.max(
      0,
      tourSteps.findIndex(
        (annotation: any) => annotation.id === selectedTourStep.id,
      ),
    )
    : -1;

  const selectTourStepAtIndex = (index: number) => {
    const tourStep = tourSteps[index];

    if (tourStep?.id) {
      selectTourStep(tourStep.id);
    }
  };

  useEffect(() => {
    previousAnnotationCount.current = null;
    previousTourStepCount.current = null;
    setTargetDrawingMode(null);
    setTargetDrawingTool("box");
  }, [canvas?.id]);

  useEffect(() => {
    if (previousAnnotationCount.current === null) {
      previousAnnotationCount.current = annotations.length;
      return;
    }

    const newestAnnotation = annotations[annotations.length - 1];
    if (
      annotations.length > previousAnnotationCount.current &&
      newestAnnotation?.id
    ) {
      selectAnnotation(newestAnnotation.id);
      requestWorkbenchTab("content");
      setShowTourSteps(false);
    }

    previousAnnotationCount.current = annotations.length;
  }, [annotations, requestWorkbenchTab, selectAnnotation, setShowTourSteps]);

  useEffect(() => {
    if (previousTourStepCount.current === null) {
      previousTourStepCount.current = tourSteps.length;
      return;
    }

    const newestTourStep = tourSteps[tourSteps.length - 1];
    if (
      tourSteps.length > previousTourStepCount.current &&
      newestTourStep?.id
    ) {
      selectTourStep(newestTourStep.id);
      stopRepositioning();
      stopTextRepositioning();
      setShowTourSteps(true);
    }

    previousTourStepCount.current = tourSteps.length;
  }, [
    selectTourStep,
    setShowTourSteps,
    stopRepositioning,
    stopTextRepositioning,
    tourSteps,
  ]);

  const toggleTourSteps = () => {
    const nextShowTourSteps = !showTourSteps;
    setShowTourSteps(nextShowTourSteps);

    if (nextShowTourSteps) {
      stopRepositioning();
      stopTextRepositioning();
      if (selectedTourStep?.id) {
        selectTourStep(selectedTourStep.id);
      }
    } else {
      stopTourStepRepositioning();
    }
  };

  const createTourAnnotationPage = () => {
    if (!canvas) return;

    inlineCreator.create(
      "@manifest-editor/empty-annotation-page",
      {
        label: { en: ["Tour steps"] },
      },
      {
        target: {
          id: canvas.id,
          type: "Canvas",
        },
        targetType: "AnnotationPage",
        parent: {
          property: "annotations",
          resource: {
            id: canvas.id,
            type: "Canvas",
          },
        },
      },
    );
  };

  const startAddTourStepTarget = () => {
    if (!canvas || !annotationPageId) return;

    setShowTourSteps(true);
    stopRepositioning();
    stopTextRepositioning();
    setTargetDrawingTool("box");
    setTargetDrawingMode({ type: "add" });
  };

  const startEditSelectedTourStepTarget = () => {
    if (!selectedTourStep?.id) return;

    setShowTourSteps(true);
    stopRepositioning();
    stopTextRepositioning();
    setTargetDrawingTool("box");
    setTargetDrawingMode({
      type: "edit",
      annotationId: selectedTourStep.id,
    });
  };

  return (
    <div
      className="exhibition-slideshow-preview-card group relative flex max-h-full flex-col overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/10"
      style={{
        width: "100%",
        height: "min(68vh, 760px)",
        minHeight: 420,
      }}
    >
      <div className="exhibition-slideshow-toolbar flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <span className="exhibition-slideshow-muted text-xs font-semibold text-slate-500">
          {mode === "edit"
            ? "Click content to edit or reposition it"
            : "Slideshow layout preview (approximate)"}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {mode === "edit" ? (
            <>
              <Button
                className={twMerge(
                  "rounded-md border px-3 py-2 text-xs font-semibold shadow-sm transition",
                  showTourSteps
                    ? "border-me-primary-500 bg-me-primary-50 text-me-primary-600"
                    : "border-slate-200 bg-white text-slate-700 hover:border-me-primary-300",
                )}
                onPress={toggleTourSteps}
              >
                {showTourSteps ? "Hide tour steps" : "Show tour steps"}
              </Button>
              {showTourSteps ? (
                <>
                  <TourStepNavigation
                    current={selectedTourStepIndex + 1}
                    total={tourSteps.length}
                    onPrevious={
                      selectedTourStepIndex > 0
                        ? () => selectTourStepAtIndex(selectedTourStepIndex - 1)
                        : undefined
                    }
                    onNext={
                      selectedTourStepIndex >= 0 &&
                      selectedTourStepIndex < tourSteps.length - 1
                        ? () => selectTourStepAtIndex(selectedTourStepIndex + 1)
                        : undefined
                    }
                  />
                  {annotationPageId ? (
                    <Button
                      className="rounded-md bg-me-primary-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-me-primary-600"
                      onPress={startAddTourStepTarget}
                    >
                      Add tour step
                    </Button>
                  ) : (
                    <Button
                      className="rounded-md bg-me-primary-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-me-primary-600"
                      onPress={createTourAnnotationPage}
                    >
                      Create tour
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  className="rounded-md bg-me-primary-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-me-primary-600"
                  onPress={() => {
                    setShowTourSteps(false);
                    stopTourStepRepositioning();
                    contentActions.create(undefined, contentCreatorOptions);
                  }}
                >
                  Add content
                </Button>
              )}
            </>
          ) : null}
          <div className="flex shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold">
            <PreviewModeButton
              selected={mode === "edit"}
              onPress={() => setMode("edit")}
            >
              Edit
            </PreviewModeButton>
            <PreviewModeButton
              selected={mode === "preview"}
              onPress={() => setMode("preview")}
            >
              Preview
            </PreviewModeButton>
          </div>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 bg-black">
        <SlideshowSlidePreview
          editable={mode === "edit"}
          mode={mode}
          showTourSteps={showTourSteps}
        />

        {targetDrawingMode && canvas && annotationPageId ? (
          <TourStepTargetDrawingOverlay
            annotationPageId={annotationPageId}
            canvas={canvas}
            mode={targetDrawingMode}
            selectedTool={targetDrawingTool}
            setSelectedTool={setTargetDrawingTool}
            vault={vault}
            onCancel={() => setTargetDrawingMode(null)}
            onComplete={(annotationId) => {
              if (annotationId) {
                selectTourStep(annotationId);
              }

              setShowTourSteps(true);
              setTargetDrawingMode(null);
            }}
          />
        ) : null}

        {!targetDrawingMode &&
        mode === "edit" &&
        !showTourSteps &&
        selectedAnnotation &&
        canvas ? (
          <CentrePositionControls
            annotation={selectedAnnotation}
            canvas={canvas}
            isRepositioning={
              repositioningAnnotationId === selectedAnnotation.id
            }
            onStartReposition={() => startRepositioning(selectedAnnotation.id)}
            onStopReposition={stopRepositioning}
            vault={vault}
          />
        ) : null}

        {!targetDrawingMode &&
        mode === "edit" &&
        !showTourSteps &&
        selectedTextRegionBox &&
        canvas ? (
          <CentrePositionControls
            canvas={canvas}
            currentBox={selectedTextRegionBox}
            isRepositioning={repositioningTextRegion === selectedTextRegion}
            label="Editorial text"
            onStartReposition={() => startTextRepositioning("editorial-text")}
            onStopReposition={stopTextRepositioning}
            setBox={(box) => setSlideTextRegionBox(vault, canvas, box)}
            vault={vault}
          />
        ) : null}

        {!targetDrawingMode && mode === "edit" && showTourSteps && canvas ? (
          selectedTourStep ? (
            <CentrePositionControls
              annotation={selectedTourStep}
              canvas={canvas}
              isRepositioning={false}
              label="Selected tour step target"
              onStopReposition={stopTourStepRepositioning}
              showBoxFields
              showRepositionButton={false}
              vault={vault}
            >
              {annotationPageId ? (
                <TourStepsWorkbenchPanel
                  annotationPageId={annotationPageId}
                  canvas={canvas}
                  onAddTourStep={startAddTourStepTarget}
                  onEditTarget={startEditSelectedTourStepTarget}
                  selectedTourStepId={selectedTourStep?.id}
                />
              ) : null}
            </CentrePositionControls>
          ) : (
            <FloatingWorkbenchPanel label="Tour steps">
              {annotationPageId ? (
                <TourStepsWorkbenchPanel
                  annotationPageId={annotationPageId}
                  canvas={canvas}
                  onAddTourStep={startAddTourStepTarget}
                  onEditTarget={startEditSelectedTourStepTarget}
                  selectedTourStepId={selectedTourStep?.id}
                />
              ) : (
                <CreateTourPanel onCreate={createTourAnnotationPage} />
              )}
            </FloatingWorkbenchPanel>
          )
        ) : null}
      </div>
    </div>
  );
}

function TourStepsWorkbenchPanel({
                                   annotationPageId,
                                   canvas,
                                   onAddTourStep,
                                   onEditTarget,
                                   selectedTourStepId,
                                 }: {
  annotationPageId: string;
  canvas: any;
  onAddTourStep: () => void;
  onEditTarget: () => void;
  selectedTourStepId?: string;
}) {
  return (
    <ResourceEditingProvider resource={canvas}>
      <AnnotationPageContext annotationPage={annotationPageId}>
        <div className="space-y-3 text-slate-800">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-800">Tour steps</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTourStepId ? (
                <PositionButton label="Edit target" onPress={onEditTarget} />
              ) : null}
              <PositionButton
                primary
                label="Add step"
                onPress={onAddTourStep}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Select a step below. Use the quick box controls here, or edit the
            target with the Atlas drawing tools.
          </p>
          <div className="max-h-72 overflow-y-auto pr-1">
            <TourAnnotationPageEditor
              reorderable={false}
              useSlideshowWorkbench
            />
          </div>
        </div>
      </AnnotationPageContext>
    </ResourceEditingProvider>
  );
}

function CreateTourPanel({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="space-y-3 text-slate-800">
      <p className="text-xs text-slate-600">
        This slide does not have a tour annotation page yet.
      </p>
      <PositionButton primary label="Create tour" onPress={onCreate} />
    </div>
  );
}

function FloatingWorkbenchPanel({
                                  children,
                                  label,
                                }: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="absolute bottom-4 left-4 z-40 max-w-[min(34rem,calc(100%-2rem))] rounded-lg bg-white/95 p-3 text-xs shadow-lg ring-1 ring-black/10">
      <div className="mb-2 font-semibold text-slate-700">{label}</div>
      {children}
    </div>
  );
}

function CentrePositionControls({
                                  annotation,
                                  canvas,
                                  children,
                                  currentBox,
                                  isRepositioning,
                                  label = "Selected content",
                                  onStartReposition,
                                  onStopReposition,
                                  setBox: setBoxOverride,
                                  vault,
                                  hidePositionControls = false,
                                  showBoxFields = false,
                                  showRepositionButton = true,
                                }: {
  annotation?: any;
  canvas: any;
  children?: ReactNode;
  currentBox?: SlideContentBox;
  hidePositionControls?: boolean;
  isRepositioning: boolean;
  label?: string;
  onStartReposition?: () => void;
  onStopReposition?: () => void;
  setBox?: (box: SlideContentBox) => void;
  showBoxFields?: boolean;
  showRepositionButton?: boolean;
  vault: any;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panelX: number;
    panelY: number;
    maxX: number;
    maxY: number;
  } | null>(null);
  const [panelOffset, setPanelOffset] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const canvasWidth = Number(canvas?.width) || 1920;
  const canvasHeight = Number(canvas?.height) || 1080;
  const box = currentBox || getAnnotationTargetBox(annotation, canvas);
  const setBox =
    setBoxOverride ||
    ((next: SlideContentBox) =>
      setAnnotationTargetBox(vault, canvas, annotation.id, next));
  const halfWidth = Math.round(canvasWidth / 2);
  const halfHeight = Math.round(canvasHeight / 2);
  const startPanelDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const panel = panelRef.current;
    const boundary = panel?.offsetParent as HTMLElement | null;
    const panelRect = panel?.getBoundingClientRect();
    const boundaryRect = boundary?.getBoundingClientRect();

    if (!panel || !panelRect || !boundaryRect) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panelX: panelRect.left - boundaryRect.left,
      panelY: panelRect.top - boundaryRect.top,
      maxX: Math.max(16, boundaryRect.width - panelRect.width - 16),
      maxY: Math.max(16, boundaryRect.height - panelRect.height - 16),
    };
  };
  const dragPanel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    setPanelOffset({
      x: Math.min(
        drag.maxX,
        Math.max(16, drag.panelX + event.clientX - drag.startX),
      ),
      y: Math.min(
        drag.maxY,
        Math.max(16, drag.panelY + event.clientY - drag.startY),
      ),
    });
  };
  const stopPanelDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  };

  return (
    <div
      ref={panelRef}
      className={twMerge(
        "absolute z-40 w-[min(30rem,calc(100%-2rem))] rounded-lg bg-white/95 p-3 text-xs shadow-lg ring-1 ring-black/10",
        panelOffset ? null : "bottom-4 left-4",
      )}
      style={
        panelOffset ? { left: panelOffset.x, top: panelOffset.y } : undefined
      }
    >
      <div className="flex flex-col gap-3">
        <div className="min-w-[280px]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="font-semibold text-slate-700">{label}</span>
            <div className="flex items-center gap-2">
              <button
                className="cursor-move rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-me-primary-300 hover:text-me-primary-600"
                type="button"
                onPointerDown={startPanelDrag}
                onPointerMove={dragPanel}
                onPointerUp={stopPanelDrag}
                onPointerCancel={stopPanelDrag}
              >
                <MoveIcon />
              </button>
              <span className="text-slate-400">
                {Math.round(box.width)} x {Math.round(box.height)}
              </span>
            </div>
          </div>

          {hidePositionControls ? null : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {showRepositionButton && onStartReposition ? (
                  <PositionButton
                    onPress={onStartReposition}
                    label="Reposition"
                    primary
                  />
                ) : null}

                {isRepositioning && onStopReposition ? (
                  <PositionButton
                    onPress={onStopReposition}
                    label="Stop moving"
                  />
                ) : null}

                <PositionButton
                  onPress={() =>
                    setBox({
                      x: 0,
                      y: 0,
                      width: canvasWidth,
                      height: canvasHeight,
                    })
                  }
                  label="Fill"
                />

                <PositionButton
                  onPress={() =>
                    setBox({
                      x: Math.round(canvasWidth * 0.1),
                      y: Math.round(canvasHeight * 0.1),
                      width: Math.round(canvasWidth * 0.8),
                      height: Math.round(canvasHeight * 0.8),
                    })
                  }
                  label="Centre"
                />

                <PositionButton
                  onPress={() =>
                    setBox({
                      x: 0,
                      y: 0,
                      width: halfWidth,
                      height: canvasHeight,
                    })
                  }
                  label="Left"
                />

                <PositionButton
                  onPress={() =>
                    setBox({
                      x: halfWidth,
                      y: 0,
                      width: halfWidth,
                      height: canvasHeight,
                    })
                  }
                  label="Right"
                />

                <PositionButton
                  onPress={() =>
                    setBox({
                      x: 0,
                      y: 0,
                      width: canvasWidth,
                      height: halfHeight,
                    })
                  }
                  label="Top"
                />

                <PositionButton
                  onPress={() =>
                    setBox({
                      x: 0,
                      y: halfHeight,
                      width: canvasWidth,
                      height: halfHeight,
                    })
                  }
                  label="Bottom"
                />
              </div>

              {showBoxFields ? (
                <TargetBoxFields box={box} onChange={setBox} />
              ) : null}
            </div>
          )}
        </div>

        {children ? (
          <div className="w-full border-t border-slate-200 pt-3">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TargetBoxFields({
                           box,
                           onChange,
                         }: {
  box: SlideContentBox;
  onChange: (box: SlideContentBox) => void;
}) {
  const updateBoxField = (field: keyof SlideContentBox, value: string) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return;
    }

    onChange({
      ...box,
      [field]: Math.round(numericValue),
    });
  };

  return (
    <div className="grid grid-cols-4 gap-2 pt-1">
      <NumberField
        label="X"
        value={box.x}
        onChange={(value) => updateBoxField("x", value)}
      />
      <NumberField
        label="Y"
        value={box.y}
        onChange={(value) => updateBoxField("y", value)}
      />
      <NumberField
        label="W"
        value={box.width}
        onChange={(value) => updateBoxField("width", value)}
      />
      <NumberField
        label="H"
        value={box.height}
        onChange={(value) => updateBoxField("height", value)}
      />
    </div>
  );
}

function NumberField({
                       label,
                       value,
                       onChange,
                     }: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-[11px] font-semibold text-slate-500">
      {label}
      <input
        className="mt-1 w-full rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-900 outline-none focus:border-me-primary-400 focus:ring-1 focus:ring-me-primary-100"
        type="number"
        value={Math.round(value)}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function createTourStepAnnotation(
  vault: any,
  canvas: any,
  annotationPageId: string,
  target: any,
) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const annotationId = `${annotationPageId}/tour-step/${timestamp}-${random}`;
  const bodyId = `${annotationId}/body/en`;
  const annotationPage =
    vault.get?.({ id: annotationPageId, type: "AnnotationPage" }) || {};
  const existingItems = Array.isArray(annotationPage?.items)
    ? annotationPage.items
    : [];

  const updateVault = () => {
    vault.dispatch(
      importEntities({
        entities: {
          ContentResource: {
            [bodyId]: {
              id: bodyId,
              type: "TextualBody",
              language: "en",
              format: "text/html",
              value: DEFAULT_TOUR_STEP_HTML,
            },
          },
          Annotation: {
            [annotationId]: {
              id: annotationId,
              type: "Annotation",
              motivation: "tagging",
              label: { en: ["New step"] },
              body: [{ id: bodyId, type: "ContentResource" }],
              target,
            },
          },
        },
      }),
    );

    vault.dispatch(
      addMappings({
        mapping: {
          [bodyId]: "ContentResource",
          [annotationId]: "Annotation",
        },
      }),
    );

    vault.modifyEntityField(
      { id: annotationPageId, type: "AnnotationPage" },
      "items",
      [...existingItems, { id: annotationId, type: "Annotation" }],
    );
  };

  if (vault.batch) {
    vault.batch(updateVault);
  } else {
    updateVault();
  }

  return annotationId;
}

type TourStepShape =
  | {
  type: "box";
  x: number;
  y: number;
  width: number;
  height: number;
}
  | {
  type: "circle";
  cx: number;
  cy: number;
  r: number;
}
  | {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
  | {
  type: "polygon";
  points: Array<{ x: number; y: number }>;
};

function TourStepTargetDrawingOverlay({
                                        annotationPageId,
                                        canvas,
                                        mode,
                                        selectedTool,
                                        setSelectedTool,
                                        vault,
                                        onCancel,
                                        onComplete,
                                      }: {
  annotationPageId: string;
  canvas: any;
  mode: { type: "add" } | { type: "edit"; annotationId: string };
  selectedTool: "box" | "circle" | "line" | "polygon";
  setSelectedTool: (tool: "box" | "circle" | "line" | "polygon") => void;
  vault: any;
  onCancel: () => void;
  onComplete: (annotationId?: string) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [draftShape, setDraftShape] = useState<TourStepShape | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<
    Array<{ x: number; y: number }>
  >([]);

  const canvasWidth = Number(canvas?.width) || 1920;
  const canvasHeight = Number(canvas?.height) || 1080;

  const getPoint = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) {
      return { x: 0, y: 0 };
    }

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const matrix = svg.getScreenCTM()?.inverse();
    const transformed = matrix ? point.matrixTransform(matrix) : point;

    return {
      x: clamp(Math.round(transformed.x), 0, canvasWidth),
      y: clamp(Math.round(transformed.y), 0, canvasHeight),
    };
  };

  const startDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.preventDefault();

    if (selectedTool === "polygon") {
      const nextPoint = getPoint(event);
      setPolygonPoints((points) => [...points, nextPoint]);
      return;
    }

    const point = getPoint(event);
    setStartPoint(point);
    setDraftShape(null);
  };

  const updateDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!startPoint || selectedTool === "polygon") {
      return;
    }

    const point = getPoint(event);

    if (selectedTool === "box") {
      setDraftShape({
        type: "box",
        x: Math.min(startPoint.x, point.x),
        y: Math.min(startPoint.y, point.y),
        width: Math.abs(point.x - startPoint.x),
        height: Math.abs(point.y - startPoint.y),
      });
    }

    if (selectedTool === "circle") {
      setDraftShape({
        type: "circle",
        cx: startPoint.x,
        cy: startPoint.y,
        r: Math.round(
          Math.sqrt(
            Math.pow(point.x - startPoint.x, 2) +
            Math.pow(point.y - startPoint.y, 2),
          ),
        ),
      });
    }

    if (selectedTool === "line") {
      setDraftShape({
        type: "line",
        x1: startPoint.x,
        y1: startPoint.y,
        x2: point.x,
        y2: point.y,
      });
    }
  };

  const stopDrawing = () => {
    setStartPoint(null);
  };

  const activeShape =
    selectedTool === "polygon" && polygonPoints.length
      ? ({
        type: "polygon",
        points: polygonPoints,
      } as TourStepShape)
      : draftShape;

  const clearDraft = () => {
    setStartPoint(null);
    setDraftShape(null);
    setPolygonPoints([]);
  };

  const saveTarget = () => {
    if (!activeShape) {
      return;
    }

    const target = makeTourStepTarget(canvas.id, activeShape);

    if (mode.type === "edit") {
      vault.modifyEntityField(
        { id: mode.annotationId, type: "Annotation" },
        "target",
        target,
      );

      onComplete(mode.annotationId);
      return;
    }

    const annotationId = createTourStepAnnotation(
      vault,
      canvas,
      annotationPageId,
      target,
    );

    onComplete(annotationId);
  };

  return (
    <div className="absolute inset-0 z-30">
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        onPointerDown={startDrawing}
        onPointerMove={updateDrawing}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
      >
        <rect
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
          fill="transparent"
        />

        {activeShape ? <TourStepShapePreview shape={activeShape} /> : null}

        {polygonPoints.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}-${index}`}
            cx={point.x}
            cy={point.y}
            r={8}
            fill="white"
            stroke="#be4778"
            strokeWidth={4}
          />
        ))}
      </svg>

      <div className="absolute left-4 top-4 z-40 flex flex-wrap items-center gap-2 rounded-lg bg-white/95 p-2 text-xs shadow-lg ring-1 ring-black/10">
        <span className="mr-2 font-semibold text-slate-700">
          {mode.type === "add" ? "Draw new tour step" : "Edit target"}
        </span>

        <DrawingToolButton
          active={selectedTool === "box"}
          label="Box"
          onPress={() => {
            clearDraft();
            setSelectedTool("box");
          }}
        />

        <DrawingToolButton
          active={selectedTool === "circle"}
          label="Circle"
          onPress={() => {
            clearDraft();
            setSelectedTool("circle");
          }}
        />

        <DrawingToolButton
          active={selectedTool === "line"}
          label="Line"
          onPress={() => {
            clearDraft();
            setSelectedTool("line");
          }}
        />

        <DrawingToolButton
          active={selectedTool === "polygon"}
          label="Polygon"
          onPress={() => {
            clearDraft();
            setSelectedTool("polygon");
          }}
        />

        <PositionButton
          primary
          label={mode.type === "add" ? "Create step" : "Save target"}
          onPress={saveTarget}
        />

        <PositionButton label="Clear" onPress={clearDraft} />
        <PositionButton label="Cancel" onPress={onCancel} />
      </div>
    </div>
  );
}

function DrawingToolButton({
                             active,
                             label,
                             onPress,
                           }: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Button
      className={twMerge(
        "rounded-md border px-2.5 py-1.5 font-semibold transition",
        active
          ? "border-me-primary-500 bg-me-primary-500 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-me-primary-300 hover:bg-me-primary-50",
      )}
      onPress={onPress}
    >
      {label}
    </Button>
  );
}

function TourStepShapePreview({ shape }: { shape: TourStepShape }) {
  const commonProps = {
    fill: "rgba(190, 71, 120, 0.18)",
    stroke: "#be4778",
    strokeWidth: 6,
    vectorEffect: "non-scaling-stroke" as const,
  };

  if (shape.type === "box") {
    return (
      <rect
        {...commonProps}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
      />
    );
  }

  if (shape.type === "circle") {
    return <circle {...commonProps} cx={shape.cx} cy={shape.cy} r={shape.r} />;
  }

  if (shape.type === "line") {
    return (
      <line
        x1={shape.x1}
        y1={shape.y1}
        x2={shape.x2}
        y2={shape.y2}
        stroke="#be4778"
        strokeWidth={6}
        vectorEffect="non-scaling-stroke"
      />
    );
  }

  return (
    <polygon
      {...commonProps}
      points={shape.points.map((point) => `${point.x},${point.y}`).join(" ")}
    />
  );
}

function makeTourStepTarget(canvasId: string, shape: TourStepShape) {
  if (shape.type === "box") {
    return `${canvasId}#xywh=${Math.round(shape.x)},${Math.round(
      shape.y,
    )},${Math.round(shape.width)},${Math.round(shape.height)}`;
  }

  return {
    source: canvasId,
    selector: {
      type: "SvgSelector",
      value: makeSvgSelectorValue(shape),
    },
  };
}

function makeSvgSelectorValue(shape: Exclude<TourStepShape, { type: "box" }>) {
  if (shape.type === "circle") {
    return `<svg xmlns="http://www.w3.org/2000/svg"><circle cx="${Math.round(
      shape.cx,
    )}" cy="${Math.round(shape.cy)}" r="${Math.round(shape.r)}" /></svg>`;
  }

  if (shape.type === "line") {
    return `<svg xmlns="http://www.w3.org/2000/svg"><line x1="${Math.round(
      shape.x1,
    )}" y1="${Math.round(shape.y1)}" x2="${Math.round(
      shape.x2,
    )}" y2="${Math.round(shape.y2)}" /></svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg"><polygon points="${shape.points
    .map((point) => `${Math.round(point.x)},${Math.round(point.y)}`)
    .join(" ")}" /></svg>`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getLanguageMapValue(value: any, fallback = "") {
  if (!value) return fallback;
  if (typeof value === "string") return value;

  const values = value.en || value.none || Object.values(value).flat();

  if (Array.isArray(values) && values.length) {
    return String(values[0]);
  }

  return fallback;
}

function PositionButton({
                          label,
                          onPress,
                          primary,
                        }: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Button
      className={twMerge(
        "rounded-md border px-2.5 py-1.5 font-semibold transition",
        primary
          ? "border-me-primary-500 bg-me-primary-500 text-white hover:bg-me-primary-600"
          : "border-slate-200 bg-white text-slate-700 hover:border-me-primary-300 hover:bg-me-primary-50",
      )}
      onPress={onPress}
    >
      {label}
    </Button>
  );
}

function PreviewModeButton({
                             children,
                             selected,
                             onPress,
                           }: {
  children: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      className={twMerge(
        "border-none px-3 py-2 transition",
        selected
          ? "bg-me-primary-500 text-white"
          : "bg-transparent text-slate-600 hover:bg-white",
      )}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}

function SlideStripItem({
                          index,
                          selected,
                          onPress,
                          onDelete,
                        }: {
  index: number;
  selected: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const canvas = useCanvas();

  return (
    <div
      className={twMerge(
        "exhibition-slideshow-slide-card relative w-44 shrink-0 rounded-md border bg-white p-2 text-left transition",
        selected
          ? "border-me-primary-500 ring-2 ring-me-primary-200"
          : "border-slate-200 hover:border-me-primary-300",
      )}
    >
      <Button
        className="block w-full border-none bg-transparent p-0 text-left"
        onPress={onPress}
      >
        <div
          className="aspect-video overflow-hidden rounded"
          style={{ backgroundColor: "#0e0d12" }}
        >
          <SlideshowSlidePreview
            className="pointer-events-none h-full w-full"
            mode="preview"
          />
        </div>
        <div className="mt-2 flex items-center gap-2 pr-7">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-600">
            {index + 1}
          </span>
          <LocaleString className="min-w-0 truncate text-sm font-medium text-slate-800">
            {canvas?.label}
          </LocaleString>
        </div>
      </Button>
      <Button
        className="absolute bottom-2 right-2 flex items-center gap-1 rounded border border-me-primary-100 bg-white px-2 py-1 text-xs font-semibold text-me-primary-500 shadow-sm transition hover:bg-me-primary-50"
        aria-label={`Delete slide ${index + 1}`}
        onPress={onDelete}
      >
        Delete
      </Button>
    </div>
  );
}
