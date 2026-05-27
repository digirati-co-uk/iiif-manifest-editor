import { useInStack } from "@manifest-editor/editors";
import { type PointerEvent as ReactPointerEvent, type RefObject, useEffect, useRef } from "react";
import { LocaleString, useCanvas, useVault, useVaultSelector } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import {
  getAnnotationTargetBox,
  getSlideContentLayers,
  getSlideLayoutRegions,
  getTourStepAnnotations,
  repairSlideContentTargets,
  type SlideContentBox,
  setAnnotationTargetBox,
  setSlideTextRegionBox,
  useSlideshowContentPositioning,
  useSlideshowWorkbenchState,
} from "../slideshow-content-positioning";

const editorialTextRegionId = "editorial-text";

export function SlideshowSlidePreview({
  className,
  editable = false,
  mode = "edit",
  showTourSteps = false,
}: {
  className?: string;
  editable?: boolean;
  mode?: "edit" | "preview";
  showTourSteps?: boolean;
}) {
  const canvas = useCanvas();
  const vault = useVault();
  const editingAnnotation = useInStack("Annotation");
  const stageRef = useRef<HTMLDivElement | null>(null);
  const requestWorkbenchTab = useSlideshowWorkbenchState((state) => state.requestTab);
  const {
    selectedAnnotationId,
    repositioningAnnotationId,
    selectedTextRegion,
    repositioningTextRegion,
    selectedTourStepId,
    repositioningTourStepId,
    selectAnnotation,
    startRepositioning,
    selectTextRegion,
    selectTourStep,
    startTourStepRepositioning,
  } = useSlideshowContentPositioning();

  useEffect(() => {
    repairSlideContentTargets(vault, canvas);
  }, [canvas?.id, vault]);

  const layers = useVaultSelector(
    (_, vaultInstance) => (canvas ? getSlideContentLayers(vaultInstance, canvas) : []),
    [canvas?.id, canvas?.items?.[0]?.id],
  );
  const tourSteps = useVaultSelector(
    (_, vaultInstance) => (canvas ? getTourStepAnnotations(vaultInstance, canvas) : []),
    [canvas?.id, canvas?.annotations?.[0]?.id],
  );

  if (!canvas) {
    return null;
  }

  const canvasWidth = Number(canvas.width) || 1920;
  const canvasHeight = Number(canvas.height) || 1080;
  const layout = getSlideLayoutRegions(canvas);
  const behavior = Array.isArray(canvas.behavior) ? canvas.behavior : [];
  const editingAnnotationId = editingAnnotation?.resource.source.id;
  const tourTabActive = mode === "edit" && showTourSteps;
  const contentEditingActive = mode === "edit" && !showTourSteps;

  return (
    <div
      ref={stageRef}
      className={twMerge("relative h-full w-full overflow-hidden", mode === "edit" && "bg-white", className)}
      style={{
        aspectRatio: `${canvasWidth} / ${canvasHeight}`,
      }}
    >
      {layers.length ? (
        layers.map((layer) => {
          const editingLayer = editingAnnotationId === layer.annotation.id;
          const selected = editingLayer || selectedAnnotationId === layer.annotation.id;
          const repositioning = repositioningAnnotationId === layer.annotation.id;

          return (
            <div
              key={layer.annotation.id}
              className={twMerge(
                "absolute overflow-hidden",
                contentEditingActive && selected && "ring-4 ring-me-primary-500 ring-offset-2 ring-offset-white",
                (repositioning || editingLayer) && contentEditingActive && "cursor-move select-none touch-none",
              )}
              style={{
                left: `${(layer.box.x / canvasWidth) * 100}%`,
                top: `${(layer.box.y / canvasHeight) * 100}%`,
                width: `${(layer.box.width / canvasWidth) * 100}%`,
                height: `${(layer.box.height / canvasHeight) * 100}%`,
              }}
              onPointerDown={
                contentEditingActive && (repositioning || editingLayer)
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
                  : contentEditingActive && editable
                    ? (event) => {
                        selectAnnotation(layer.annotation.id);
                        startRepositioning(layer.annotation.id);
                        requestWorkbenchTab("content");
                        startSlideLayerDrag({
                          event,
                          mode: "move",
                          canvas,
                          annotation: layer.annotation,
                          vault,
                          startBox: layer.box,
                          stage: stageRef.current,
                        });
                      }
                    : undefined
              }
            >
              <RenderSlideLayer layer={layer} mode={mode} cover={behavior.includes("cover")} />
              {contentEditingActive && (repositioning || editingLayer) ? (
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
        <div
          className={twMerge(
            "flex h-full w-full items-center justify-center text-sm font-semibold",
            mode === "preview" ? "text-white/40" : "bg-white text-slate-400",
          )}
        >
          {mode === "preview" ? "This slide has no content yet" : "Empty slide"}
        </div>
      )}
      {layout.text ? (
        <SlideTextPanel
          canvas={canvas}
          box={layout.text}
          editable={editable && contentEditingActive}
          mode={mode}
          repositioning={repositioningTextRegion === editorialTextRegionId}
          selected={selectedTextRegion === editorialTextRegionId}
          stage={stageRef}
          onSelect={() => {
            selectTextRegion(editorialTextRegionId);
            requestWorkbenchTab("content");
          }}
        />
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
              selected={selectedTourStepId === annotation.id}
              repositioning={repositioningTourStepId === annotation.id}
              onSelect={() => {
                selectTourStep(annotation.id);
              }}
              onStartReposition={() => {
                startTourStepRepositioning(annotation.id);
              }}
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
  selected,
  repositioning,
  onSelect,
  onStartReposition,
}: {
  annotation: any;
  canvas: any;
  stage: RefObject<HTMLDivElement | null>;
  vault: any;
  index: number;
  selected: boolean;
  repositioning: boolean;
  onSelect: () => void;
  onStartReposition: () => void;
}) {
  const box = getAnnotationTargetBox(annotation, canvas);
  const canvasWidth = Number(canvas.width) || 1920;
  const canvasHeight = Number(canvas.height) || 1080;
  const selectedColour = "#6d5aa8";

  return (
    <div
      className={twMerge(
        "absolute z-30 select-none border-2 border-me-primary-500 bg-me-primary-500/10 touch-none",
        repositioning ? "cursor-move" : "cursor-pointer",
        selected ? "border-4" : "ring-2 ring-white",
      )}
      style={{
        left: `${(box.x / canvasWidth) * 100}%`,
        top: `${(box.y / canvasHeight) * 100}%`,
        width: `${(box.width / canvasWidth) * 100}%`,
        height: `${(box.height / canvasHeight) * 100}%`,
        ...(selected
          ? {
              backgroundColor: "rgba(109, 90, 168, 0.2)",
              borderColor: selectedColour,
              boxShadow: "0 0 0 4px rgba(109, 90, 168, 0.22), 0 0 0 8px rgba(109, 90, 168, 0.14)",
            }
          : {}),
      }}
      onPointerDown={(event) => {
        onSelect();
        onStartReposition();
        startSlideLayerDrag({
          event,
          mode: "move",
          canvas,
          annotation,
          vault,
          startBox: box,
          stage: stage.current,
        });
      }}
    >
      <span
        className={twMerge(
          "absolute left-1 top-1 rounded px-1.5 py-0.5 text-xs font-semibold text-white",
          !selected && "bg-me-primary-500",
        )}
        style={selected ? { backgroundColor: selectedColour } : undefined}
      >
        Step {index + 1}
      </span>
      {repositioning ? (
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
      ) : null}
    </div>
  );
}

function SlideTextPanel({
  canvas,
  box,
  editable,
  mode,
  onSelect,
  repositioning,
  selected,
  stage,
}: {
  canvas: any;
  box: SlideContentBox;
  editable: boolean;
  mode: "edit" | "preview";
  onSelect: () => void;
  repositioning: boolean;
  selected: boolean;
  stage: RefObject<HTMLDivElement | null>;
}) {
  const canvasWidth = Number(canvas.width) || 1920;
  const canvasHeight = Number(canvas.height) || 1080;
  const vault = useVault();

  return (
    <div
      className={twMerge(
        "absolute flex flex-col overflow-hidden bg-black text-white",
        mode === "preview" ? "font-mono" : "p-[3%]",
        editable && selected && "ring-4 ring-me-primary-500 ring-offset-2",
        editable && repositioning && "cursor-move select-none touch-none",
      )}
      style={{
        left: `${(box.x / canvasWidth) * 100}%`,
        top: `${(box.y / canvasHeight) * 100}%`,
        width: `${(box.width / canvasWidth) * 100}%`,
        height: `${(box.height / canvasHeight) * 100}%`,
        ...(mode === "preview"
          ? {
              containerType: "inline-size",
              padding: "3% 4%",
            }
          : {}),
      }}
      onPointerDown={
        editable
          ? (event) => {
              onSelect();
              if (repositioning) {
                startSlideTextDrag({
                  event,
                  mode: "move",
                  canvas,
                  vault,
                  startBox: box,
                  stage: stage.current,
                });
              }
            }
          : undefined
      }
    >
      {mode === "edit" ? (
        <>
          <div
            className="block cursor-text text-xl font-semibold uppercase leading-tight outline-none focus:ring-2 focus:ring-white/70"
            contentEditable
            suppressContentEditableWarning
            onBlur={(event) =>
              vault.modifyEntityField(canvas, "label", {
                en: [event.currentTarget.textContent || ""],
              })
            }
          >
            {getLanguageMapText(canvas.label) || "Untitled"}
          </div>
          <div
            className="mt-4 block min-h-0 cursor-text overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed opacity-90 outline-none focus:ring-2 focus:ring-white/70"
            contentEditable
            suppressContentEditableWarning
            onBlur={(event) =>
              vault.modifyEntityField(canvas, "summary", {
                en: [event.currentTarget.textContent || ""],
              })
            }
          >
            {getLanguageMapText(canvas.summary) || "Add editorial text"}
          </div>
        </>
      ) : (
        <>
          <LocaleString
            className="block font-semibold uppercase leading-tight"
            style={{ fontSize: "clamp(13px, 5cqw, 26px)" }}
          >
            {canvas.label}
          </LocaleString>
          <LocaleString
            className="block min-h-0 overflow-y-auto whitespace-pre-wrap opacity-90 leading-[1.45]"
            style={{
              fontSize: "clamp(11px, 3.5cqw, 18px)",
              marginTop: "5%",
              paddingRight: "2%",
            }}
          >
            {canvas.summary}
          </LocaleString>
        </>
      )}
      {editable && repositioning ? (
        <div
          className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize rounded-tl bg-me-primary-500"
          onPointerDown={(event) => {
            event.stopPropagation();
            startSlideTextDrag({
              event,
              mode: "resize",
              canvas,
              vault,
              startBox: box,
              stage: stage.current,
            });
          }}
        />
      ) : null}
    </div>
  );
}

function RenderSlideLayer({
  layer,
  mode,
  cover,
}: {
  layer: ReturnType<typeof getSlideContentLayers>[number];
  mode: "edit" | "preview";
  cover: boolean;
}) {
  if (layer.imageUrl) {
    return (
      <img
        src={layer.imageUrl}
        alt=""
        className={twMerge("h-full w-full", cover ? "object-cover" : "object-contain")}
      />
    );
  }

  if (layer.html !== null) {
    if (!layer.html) {
      if (mode === "preview") {
        return null;
      }

      return (
        <div className="h-full w-full overflow-hidden bg-white p-4 text-slate-900">
          <div className="flex h-full items-center justify-center rounded border border-dashed border-slate-300 text-sm font-semibold text-slate-400">
            Empty text
          </div>
        </div>
      );
    }

    return (
      <div
        className="h-full w-full overflow-hidden bg-white p-4 text-slate-900"
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

function startSlideTextDrag({
  event,
  mode,
  canvas,
  vault,
  startBox,
  stage,
}: {
  event: ReactPointerEvent;
  mode: "move" | "resize";
  canvas: any;
  vault: any;
  startBox: SlideContentBox;
  stage: HTMLDivElement | null;
}) {
  if (!stage) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

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

    setSlideTextRegionBox(vault, canvas, nextBox);
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

function getLanguageMapText(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(" ");

  const firstValue = Object.values(value)[0];
  return Array.isArray(firstValue)
    ? firstValue.filter(Boolean).join(" ")
    : typeof firstValue === "string"
      ? firstValue
      : "";
}
