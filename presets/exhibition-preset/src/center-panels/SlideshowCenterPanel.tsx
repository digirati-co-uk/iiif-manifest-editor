import {
  ActionButton,
  LazyThumbnail,
  SidebarContent,
} from "@manifest-editor/components";
import { CanvasPanelEditor, useInStack } from "@manifest-editor/editors";
import {
  type LayoutPanel,
  useCreator,
  useLayoutActions,
  useManifestEditor,
} from "@manifest-editor/shell";
import { type ReactNode } from "react";
import { Button } from "react-aria-components";
import {
  CanvasContext,
  LocaleString,
  useCanvas,
  useCurrentAnnotationRequest,
} from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { SlideshowSlidePreview } from "../components/SlideshowSlidePreview";
import { useSlideshowContentPositioning } from "../slideshow-content-positioning";

export const slideshowCenterPanel: LayoutPanel = {
  id: "@exhibitions/slideshow-center-panel",
  label: "Slideshow workbench",
  icon: null,
  render: () => <SlideshowCenterPanel />,
};

function SlideshowCenterPanel() {
  const { structural, technical } = useManifestEditor();
  const items = structural.items.get();
  const manifest = { id: technical.id.get(), type: "Manifest" };
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
  const editSlide = (item: { id: string; type?: string }, index: number) => {
    openSlide(item, index, true);
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
              {selectedIndex >= 0 ? `Slide ${selectedIndex + 1}` : "Slides"}
            </h2>
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
                <SelectedSlidePreview
                  onPress={() => editSlide(selectedItem, selectedSlideIndex)}
                />
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

function SelectedSlidePreview({ onPress }: { onPress: () => void }) {
  const request = useCurrentAnnotationRequest();

  if (request) {
    return (
      <div className="h-[min(68vh,760px)] min-h-[420px] w-full overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/10">
        <CanvasPanelEditor asFallback />
      </div>
    );
  }

  return (
    <div
      className="group relative aspect-video max-h-full overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/10"
      style={{
        width: "100%",
        height: "min(68vh, 760px)",
        minHeight: 420,
      }}
    >
      <SlideshowSlidePreview editable />
      <Button
        className="absolute bottom-4 right-4 z-30 rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-white"
        onPress={onPress}
      >
        Edit slide
      </Button>
    </div>
  );
}

function SlideStripItem({
  index,
  selected,
  onPress,
}: {
  index: number;
  selected: boolean;
  onPress: () => void;
}) {
  const canvas = useCanvas();

  return (
    <Button
      className={twMerge(
        "w-44 shrink-0 rounded-md border bg-white p-2 text-left transition",
        selected
          ? "border-me-primary-500 ring-2 ring-me-primary-200"
          : "border-slate-200 hover:border-me-primary-300",
      )}
      onPress={onPress}
    >
      <div className="aspect-video overflow-hidden rounded bg-slate-900">
        <LazyThumbnail cover fade={false} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-600">
          {index + 1}
        </span>
        <LocaleString className="min-w-0 truncate text-sm font-medium text-slate-800">
          {canvas?.label}
        </LocaleString>
      </div>
    </Button>
  );
}
