import {
  ActionButton,
  DeleteIcon,
  SidebarContent,
} from "@manifest-editor/components";
import {
  addMappings,
  entityActions,
  importEntities,
} from "@iiif/helpers/vault/actions";
import { CanvasPanelEditor, useInStack } from "@manifest-editor/editors";
import {
  type LayoutPanel,
  useCreator,
  useInlineCreator,
  useLayoutActions,
  useManifestEditor,
} from "@manifest-editor/shell";
import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "react-aria-components";
import {
  CanvasContext,
  LocaleString,
  useCanvas,
  useCurrentAnnotationRequest,
  useVault,
  useVaultSelector,
} from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { SlideshowSlidePreview } from "../components/SlideshowSlidePreview";
import {
  createDefaultSlideContentTarget,
  getAnnotationTargetBox,
  getPaintingAnnotations,
  getSlideLayoutRegions,
  getTourStepAnnotations,
  repairSlideContentTargets,
  setAnnotationTargetBox,
  setSlideTextRegionBox,
  type SlideContentBox,
  useSlideshowContentPositioning,
  useSlideshowWorkbenchState,
} from "../slideshow-content-positioning";
import SlideshowIcon from "@manifest-editor/ui/icons/SlideshowIcon";
import MoveIcon from "@manifest-editor/ui/icons/MoveIcon";

const contentCreatorOptions = {
  skipEditingOnCreate: true,
};

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
    canvasActions.createFiltered("exhibition-slideshow-slide");
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
      <div className="flex min-h-full flex-col gap-6 pb-12 pt-16">
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
            <h2 className="truncate text-2xl font-bold text-slate-900">
              {selectedItem ? (
                <CanvasContext canvas={selectedItem.id}>
                  <SelectedSlideTitle />
                </CanvasContext>
              ) : (
                "Slides"
              )}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
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
          <div className="flex items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            {selectedItem ? (
              <CanvasContext canvas={selectedItem.id}>
                <SelectedSlidePreview />
              </CanvasContext>
            ) : null}
          </div>

          <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-slate-700">
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
    <SidebarContent className="h-full overflow-x-hidden overflow-y-auto bg-[#f8f6f3]">
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
    <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white text-sm text-slate-800 shadow-sm">
      <Button
        className="border-none bg-white px-5 py-3 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
        isDisabled={!onPrevious}
        onPress={onPrevious}
      >
        Previous
      </Button>
      <span className="flex min-w-[96px] items-center justify-center border-x border-slate-200 bg-slate-50 px-4 font-bold text-slate-900">
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
    <div className="flex items-stretch overflow-hidden rounded-md border border-slate-200 bg-white text-xs text-slate-800 shadow-sm">
      <Button
        className="border-none bg-white px-3 py-2 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
        isDisabled={!onPrevious}
        onPress={onPrevious}
      >
        Previous step
      </Button>
      <span className="flex min-w-[84px] items-center justify-center border-x border-slate-200 bg-slate-50 px-3 font-bold text-slate-900">
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
  const request = useCurrentAnnotationRequest();
  const vault = useVault();
  const tourStepCreator = useInlineCreator();
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const previousAnnotationCount = useRef<number | null>(null);
  const previousTourStepCount = useRef<number | null>(null);
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
    repositioningTourStepId,
    selectAnnotation,
    startRepositioning,
    stopRepositioning,
    startTextRepositioning,
    stopTextRepositioning,
    selectTourStep,
    startTourStepRepositioning,
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
    [canvas?.id, canvas?.annotations?.[0]?.id],
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
      startTourStepRepositioning(tourStep.id);
    }
  };

  useEffect(() => {
    previousAnnotationCount.current = null;
    previousTourStepCount.current = null;
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
      startTourStepRepositioning(newestTourStep.id);
      stopRepositioning();
      stopTextRepositioning();
      setShowTourSteps(true);
    }

    previousTourStepCount.current = tourSteps.length;
  }, [
    startTourStepRepositioning,
    stopRepositioning,
    stopTextRepositioning,
    tourSteps,
  ]);

  const deleteTourStep = (annotation: any) => {
    const firstAnnotationPage = canvas?.annotations?.[0];

    if (!firstAnnotationPage || !annotation?.id) {
      return;
    }

    if (!confirm("Are you sure you want to delete this tour step?")) {
      return;
    }

    const currentIndex = tourSteps.findIndex(
      (step: any) => step.id === annotation.id,
    );
    const nextTourStep =
      tourSteps[currentIndex + 1] || tourSteps[currentIndex - 1];

    stopTourStepRepositioning();

    vault.dispatch(
      entityActions.removeReference({
        id: firstAnnotationPage.id,
        type: "AnnotationPage",
        key: "items",
        reference: {
          id: annotation.id,
          type: annotation.type || "Annotation",
        },
      }),
    );

    if (nextTourStep?.id) {
      selectTourStep(nextTourStep.id);
    } else {
      selectTourStep(null);
    }
  };

  const createTourStep = () => {
    const firstAnnotationPage = canvas?.annotations?.[0];
    if (!canvas || !firstAnnotationPage) return;

    const annotationWidth = Math.round((canvas.width || 1920) * 0.3);
    const annotationHeight = Math.round((canvas.height || 1080) * 0.3);
    const annotationX = Math.round((canvas.width || 1920) * 0.1);
    const annotationY = Math.round((canvas.height || 1080) * 0.1);

    tourStepCreator.create(
      "@manifest-editor/html-annotation",
      {
        label: { en: ["Tour step"] },
        body: { en: ["<h2>New step</h2><p>Description</p>"] },
        motivation: "tagging",
      },
      {
        target: { id: canvas.id, type: "Canvas" },
        targetType: "Annotation",
        parent: {
          property: "items",
          resource: {
            id: firstAnnotationPage.id,
            type: "AnnotationPage",
          },
        },
        initialData: {
          getSerialisedSelector: () => ({
            type: "FragmentSelector",
            value: `xywh=${annotationX},${annotationY},${annotationWidth},${annotationHeight}`,
          }),
        },
      },
    );
    setShowTourSteps(true);
    stopRepositioning();
    stopTextRepositioning();
  };
  const toggleTourSteps = () => {
    const nextShowTourSteps = !showTourSteps;
    setShowTourSteps(nextShowTourSteps);

    if (nextShowTourSteps) {
      stopRepositioning();
      stopTextRepositioning();
      if (selectedTourStep?.id) {
        startTourStepRepositioning(selectedTourStep.id);
      }
    } else {
      stopTourStepRepositioning();
    }
  };

  if (request) {
    return (
      <div className="h-[min(68vh,760px)] min-h-[420px] w-full overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/10">
        <CanvasPanelEditor asFallback />
      </div>
    );
  }

  return (
    <div
      className="group relative flex max-h-full flex-col overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/10"
      style={{
        width: "100%",
        height: "min(68vh, 760px)",
        minHeight: 420,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <span className="text-xs font-semibold text-slate-500">
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
                  <Button
                    className="rounded-md bg-me-primary-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-me-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                    isDisabled={!canvas?.annotations?.[0]}
                    onPress={createTourStep}
                  >
                    Add tour step
                  </Button>
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
        {mode === "edit" &&
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
        {mode === "edit" &&
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
        {mode === "edit" &&
        showTourSteps &&
        selectedTourStep &&
        canvas ? (
          <CentrePositionControls
            annotation={selectedTourStep}
            canvas={canvas}
            isRepositioning={repositioningTourStepId === selectedTourStep.id}
            label="Selected tour step"
            onStartReposition={() =>
              startTourStepRepositioning(selectedTourStep.id)
            }
            onStopReposition={stopTourStepRepositioning}
            vault={vault}
          >
            <TourStepMetadataControls
              annotation={selectedTourStep}
              vault={vault}
              onDelete={() => deleteTourStep(selectedTourStep)}
            />
          </CentrePositionControls>
        ) : null}
      </div>
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
}: {
  annotation?: any;
  canvas: any;
  children?: ReactNode;
  currentBox?: SlideContentBox;
  isRepositioning: boolean;
  label?: string;
  onStartReposition: () => void;
  onStopReposition: () => void;
  setBox?: (box: SlideContentBox) => void;
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
        "absolute z-40 max-w-[min(56rem,calc(100%-2rem))] rounded-lg bg-white/95 p-3 text-xs shadow-lg ring-1 ring-black/10",
        panelOffset ? null : "bottom-4 left-4",
      )}
      style={
        panelOffset
          ? { left: panelOffset.x, top: panelOffset.y }
          : undefined
      }
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
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

          <div className="flex flex-wrap gap-2">
            <PositionButton
              onPress={onStartReposition}
              label="Reposition"
              primary
            />

            {isRepositioning ? (
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
                setBox({ x: 0, y: 0, width: halfWidth, height: canvasHeight })
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
                setBox({ x: 0, y: 0, width: canvasWidth, height: halfHeight })
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
        </div>

        {children ? (
          <div className="w-full border-t border-slate-200 pt-3 lg:w-80 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TourStepMetadataControls({
  annotation,
  vault,
  onDelete,
}: {
  annotation: any;
  vault: any;
  onDelete: () => void;
}) {
  const initialLabel = getLanguageMapValue(annotation.label, "Tour step");
  const initialDescription = getTourStepDescription(annotation, vault);

  const [stepLabel, setStepLabel] = useState(initialLabel);
  const [description, setDescription] = useState(initialDescription);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStepLabel(getLanguageMapValue(annotation.label, "Tour step"));
    setDescription(getTourStepDescription(annotation, vault));
    setSaved(false);
  }, [annotation.id, vault]);

  const onLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSaved(false);
    setStepLabel(event.target.value);
  };

  const onDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setSaved(false);
    setDescription(event.target.value);
  };
  const clearDefaultLabel = () => {
    if (stepLabel.trim() === "Tour step" || stepLabel.trim() === "New step") {
      setSaved(false);
      setStepLabel("");
    }
  };
  const clearDefaultDescription = () => {
    if (description.trim() === "Description") {
      setSaved(false);
      setDescription("");
    }
  };
  const hasChanges =
    stepLabel !== initialLabel || description !== initialDescription;
  const saveTourStep = () => {
    updateTourStepMetadata(vault, annotation, stepLabel, description);
    setSaved(true);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block font-semibold text-slate-700">
          Step label
        </label>
        <input
          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm outline-none transition focus:border-me-primary-400 focus:ring-2 focus:ring-me-primary-100"
          value={stepLabel}
          onChange={onLabelChange}
          onFocus={clearDefaultLabel}
          placeholder="Step label"
        />
      </div>

      <div>
        <label className="mb-1 block font-semibold text-slate-700">
          Description
        </label>
        <textarea
          className="min-h-20 w-full resize-y rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm outline-none transition focus:border-me-primary-400 focus:ring-2 focus:ring-me-primary-100"
          value={description}
          onChange={onDescriptionChange}
          onFocus={clearDefaultDescription}
          placeholder="Description"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          className="rounded-md bg-me-primary-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-me-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          isDisabled={!hasChanges}
          onPress={saveTourStep}
        >
          Save step
        </Button>
        {saved && !hasChanges ? (
          <span className="text-xs font-semibold text-emerald-600">Saved</span>
        ) : null}
        <Button
          className="flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          onPress={onDelete}
        >
          <DeleteIcon /> Delete tour step
        </Button>
      </div>
    </div>
  );
}

function updateTourStepMetadata(
  vault: any,
  annotation: any,
  label: string,
  description: string,
) {
  const trimmedLabel = label.trim() || "Tour step";
  const html = makeTourStepHtml(trimmedLabel, description.trim());
  const bodyResource = getTourStepBodyResource(annotation, vault);

  const updateFields = () => {
    vault.modifyEntityField(annotation, "label", { en: [trimmedLabel] });

    if (bodyResource?.id && bodyResource.id !== "...") {
      vault.modifyEntityField(
        { id: bodyResource.id, type: "ContentResource" },
        "value",
        html,
      );
      return;
    }

    const bodyId = `${annotation.id}/body/en`;
    vault.dispatch(
      importEntities({
        entities: {
          ContentResource: {
            [bodyId]: {
              id: bodyId,
              type: "TextualBody",
              language: bodyResource?.language || "en",
              format: "text/html",
              value: html,
            },
          },
        },
      }),
    );
    vault.dispatch(
      addMappings({
        mapping: {
          [bodyId]: "ContentResource",
        },
      }),
    );
    vault.modifyEntityField(annotation, "body", [
      { id: bodyId, type: "ContentResource" },
    ]);
  };

  if (vault.batch) {
    vault.batch(updateFields);
    return;
  }

  updateFields();
}

function makeTourStepHtml(label: string, description: string) {
  return `<h2>${escapeHtml(label)}</h2><p>${escapeHtml(description)}</p>`;
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

function getTourStepDescription(annotation: any, vault: any) {
  const bodyHtml = getTourStepBodyHtml(annotation, vault);
  const paragraphMatch = bodyHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

  if (paragraphMatch?.[1]) {
    return stripHtml(paragraphMatch[1]);
  }

  return stripHtml(
    bodyHtml.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/i, ""),
  );
}

function getTourStepBodyHtml(annotation: any, vault: any) {
  const bodyResource = getTourStepBodyResource(annotation, vault);

  if (!bodyResource) {
    return "";
  }

  if (typeof bodyResource === "string") {
    return bodyResource;
  }

  return bodyResource.value || "";
}

function getTourStepBodyResource(annotation: any, vault: any) {
  const body = annotation.body;

  if (!Array.isArray(body) || !body.length) {
    return undefined;
  }

  const bodyReference =
    body.find((item: any) => item?.format === "text/html") ||
    body.find((item: any) => item?.value) ||
    body.find((item: any) => item?.id) ||
    body[0];

  if (!bodyReference) {
    return undefined;
  }

  // Already hydrated body object.
  if (bodyReference.value || bodyReference.format) {
    return bodyReference;
  }

  // Vault reference object.
  if (bodyReference.id) {
    return vault.get?.(bodyReference) || bodyReference;
  }

  return undefined;
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
        "relative w-44 shrink-0 rounded-md border bg-white p-2 text-left transition",
        selected
          ? "border-me-primary-500 ring-2 ring-me-primary-200"
          : "border-slate-200 hover:border-me-primary-300",
      )}
    >
      <Button
        className="block w-full border-none bg-transparent p-0 text-left"
        onPress={onPress}
      >
        <div className="aspect-video overflow-hidden rounded bg-slate-900">
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
        <DeleteIcon /> Delete
      </Button>
    </div>
  );
}
