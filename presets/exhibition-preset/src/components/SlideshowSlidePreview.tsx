import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import {
  LocaleString,
  useCanvas,
  useVault,
  useVaultSelector,
} from "react-iiif-vault";
import { useInStack } from "@manifest-editor/editors";
import { twMerge } from "tailwind-merge";
import {
  type SlideContentBox,
  getAnnotationTargetBox,
  getSlideContentLayers,
  getSlideLayoutRegions,
  getTourStepAnnotations,
  repairSlideContentTargets,
  setAnnotationTargetBox,
  useSlideshowContentPositioning,
  useSlideshowWorkbenchState,
} from "../slideshow-content-positioning";
import { useLayoutState } from "@manifest-editor/shell";

export function SlideshowSlidePreview({
  className,
  editable = false,
}: {
  className?: string;
  editable?: boolean;
}) {
  const canvas = useCanvas();
  const vault = useVault();
  const { rightPanel } = useLayoutState();
  const editingAnnotation = useInStack("Annotation");
  const stageRef = useRef<HTMLDivElement | null>(null);
  const activeWorkbenchTab = useSlideshowWorkbenchState(
    (state) => state.activeTab,
  );
  const { selectedAnnotationId, repositioningAnnotationId, selectAnnotation } =
    useSlideshowContentPositioning();

  useEffect(() => {
    repairSlideContentTargets(vault, canvas);
  }, [canvas?.id, vault]);

  const layers = useVaultSelector(
    (_, vaultInstance) =>
      canvas ? getSlideContentLayers(vaultInstance, canvas) : [],
    [canvas?.id, canvas?.items?.[0]?.id],
  );
  const tourSteps = useVaultSelector(
    (_, vaultInstance) =>
      canvas ? getTourStepAnnotations(vaultInstance, canvas) : [],
    [canvas?.id, canvas?.annotations?.[0]?.id],
  );

  if (!canvas) {
    return null;
  }

  const canvasWidth = Number(canvas.width) || 1920;
  const canvasHeight = Number(canvas.height) || 1080;
  const layout = getSlideLayoutRegions(canvas);
  const editingAnnotationId = editingAnnotation?.resource.source.id;
  const tourTabActive =
    activeWorkbenchTab === "tour" ||
    (rightPanel.current === "@manifest-editor/editor" &&
      rightPanel.state?.currentTab?.startsWith("@exhibition/tour-steps"));

  return (
    <div
      ref={stageRef}
      className={twMerge(
        "relative h-full w-full overflow-hidden bg-white",
        className,
      )}
      style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
    >
      {layers.length ? (
        layers.map((layer) => {
          const editingLayer = editingAnnotationId === layer.annotation.id;
          const selected =
            editingLayer || selectedAnnotationId === layer.annotation.id;
          const repositioning =
            repositioningAnnotationId === layer.annotation.id;

          return (
            <div
              key={layer.annotation.id}
              className={twMerge(
                "absolute overflow-hidden",
                selected && "ring-2 ring-me-primary-500 ring-offset-2",
                (repositioning || editingLayer) &&
                  "cursor-move select-none touch-none",
              )}
              style={{
                left: `${(layer.box.x / canvasWidth) * 100}%`,
                top: `${(layer.box.y / canvasHeight) * 100}%`,
                width: `${(layer.box.width / canvasWidth) * 100}%`,
                height: `${(layer.box.height / canvasHeight) * 100}%`,
              }}
              onPointerDown={
                repositioning || editingLayer
                  ? (event) =>
                      startSlideLayerDrag({
                        event,
                        mode: "move",
                        canvas,
                        annotation: layer.annotation,
                        vault,
                        startBox: layer.box,
                        stage: stageRef.current,
                      })
                  : editable
                    ? () => selectAnnotation(layer.annotation.id)
                    : undefined
              }
            >
              <RenderSlideLayer layer={layer} />
              {repositioning || editingLayer ? (
                <div
                  className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize rounded-tl bg-me-primary-500"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    startSlideLayerDrag({
                      event,
                      mode: "resize",
                      canvas,
                      annotation: layer.annotation,
                      vault,
                      startBox: layer.box,
                      stage: stageRef.current,
                    });
                  }}
                />
              ) : null}
            </div>
          );
        })
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
          Empty slide
        </div>
      )}
      {layout.text ? (
        <SlideTextPanel canvas={canvas} box={layout.text} />
      ) : null}
      {tourTabActive
        ? tourSteps.map((annotation: any, index: number) => (
            <TourStepTarget
              key={annotation.id}
              annotation={annotation}
              canvas={canvas}
              stage={stageRef}
              vault={vault}
              index={index}
            />
          ))
        : null}
    </div>
  );
}

function TourStepTarget({
  annotation,
  canvas,
  stage,
  vault,
  index,
}: {
  annotation: any;
  canvas: any;
  stage: RefObject<HTMLDivElement | null>;
  vault: any;
  index: number;
}) {
  const box = getAnnotationTargetBox(annotation, canvas);
  const canvasWidth = Number(canvas.width) || 1920;
  const canvasHeight = Number(canvas.height) || 1080;

  return (
    <div
      className="absolute z-30 cursor-move select-none border-2 border-me-primary-500 bg-me-primary-500/10 ring-2 ring-white touch-none"
      style={{
        left: `${(box.x / canvasWidth) * 100}%`,
        top: `${(box.y / canvasHeight) * 100}%`,
        width: `${(box.width / canvasWidth) * 100}%`,
        height: `${(box.height / canvasHeight) * 100}%`,
      }}
      onPointerDown={(event) =>
        startSlideLayerDrag({
          event,
          mode: "move",
          canvas,
          annotation,
          vault,
          startBox: box,
          stage: stage.current,
        })
      }
    >
      <span className="absolute left-1 top-1 rounded bg-me-primary-500 px-1.5 py-0.5 text-xs font-semibold text-white">
        Step {index + 1}
      </span>
      <div
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize rounded-tl bg-me-primary-500"
        onPointerDown={(event) => {
          event.stopPropagation();
          startSlideLayerDrag({
            event,
            mode: "resize",
            canvas,
            annotation,
            vault,
            startBox: box,
            stage: stage.current,
          });
        }}
      />
    </div>
  );
}

function SlideTextPanel({
  canvas,
  box,
}: {
  canvas: any;
  box: SlideContentBox;
}) {
  const canvasWidth = Number(canvas.width) || 1920;
  const canvasHeight = Number(canvas.height) || 1080;

  return (
    <div
      className="absolute overflow-hidden bg-black p-[3%] text-white"
      style={{
        left: `${(box.x / canvasWidth) * 100}%`,
        top: `${(box.y / canvasHeight) * 100}%`,
        width: `${(box.width / canvasWidth) * 100}%`,
        height: `${(box.height / canvasHeight) * 100}%`,
      }}
    >
      <LocaleString className="block text-xl font-semibold leading-tight">
        {canvas.label}
      </LocaleString>
      <LocaleString className="mt-4 block text-sm leading-relaxed opacity-90">
        {canvas.summary}
      </LocaleString>
    </div>
  );
}

function RenderSlideLayer({
  layer,
}: {
  layer: ReturnType<typeof getSlideContentLayers>[number];
}) {
  if (layer.imageUrl) {
    return (
      <img
        src={layer.imageUrl}
        alt=""
        className="h-full w-full object-contain"
      />
    );
  }

  if (layer.html !== null) {
    return (
      <div
        className="h-full w-full overflow-hidden p-4 text-slate-900"
        dangerouslySetInnerHTML={{ __html: layer.html }}
      />
    );
  }

  if (layer.youtubeId) {
    return (
      <iframe
        className="h-full w-full border-0"
        title="YouTube slide content"
        src={`https://www.youtube.com/embed/${layer.youtubeId}?modestbranding=1&rel=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (layer.videoUrl) {
    return (
      <video className="h-full w-full bg-black object-contain" controls>
        <source src={layer.videoUrl} />
      </video>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded bg-slate-100 text-sm font-semibold text-slate-500">
      Media
    </div>
  );
}

function startSlideLayerDrag({
  event,
  mode,
  canvas,
  annotation,
  vault,
  startBox,
  stage,
}: {
  event: ReactPointerEvent;
  mode: "move" | "resize";
  canvas: any;
  annotation: any;
  vault: any;
  startBox: SlideContentBox;
  stage: HTMLDivElement | null;
}) {
  if (!stage) {
    return;
  }

  event.preventDefault();
  const rect = stage.getBoundingClientRect();
  const scaleX = (Number(canvas?.width) || 1920) / rect.width;
  const scaleY = (Number(canvas?.height) || 1080) / rect.height;
  const startX = event.clientX;
  const startY = event.clientY;

  const onMove = (moveEvent: globalThis.PointerEvent) => {
    const dx = (moveEvent.clientX - startX) * scaleX;
    const dy = (moveEvent.clientY - startY) * scaleY;
    const nextBox =
      mode === "move"
        ? {
            ...startBox,
            x: startBox.x + dx,
            y: startBox.y + dy,
          }
        : {
            ...startBox,
            width: startBox.width + dx,
            height: startBox.height + dy,
          };

    setAnnotationTargetBox(vault, canvas, annotation.id, nextBox);
  };

  const onEnd = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onEnd);
    window.removeEventListener("pointercancel", onEnd);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onEnd);
  window.addEventListener("pointercancel", onEnd);
}
