import { useTranslations } from "@manifest-editor/i18n";
import {
  applyCanvasLayout,
  beginCanvasComposition,
  canResizeCanvas,
  clearCanvasPlaceholders,
  completeCanvasComposition,
  getCanvasCompositionSnapshot,
  isCanvasCompositionMoved,
  getEmptyCanvasPlaceholders,
  getCanvasLayout,
  getImageSize,
  getPaintingImages,
  getPaintingAnnotations,
  hasCanvasRegionAnnotations,
  isTemplateManaged,
  removeCanvasImage,
  swapCanvasPositions,
  canvasLayouts,
  type CanvasLayout,
} from "@manifest-editor/editor-api";
import { ThumbnailImg } from "@manifest-editor/ui/atoms/Thumbnail";
import { useState } from "react";
import {
  AnnotationContext,
  LocaleString,
  useAnnotation,
  useAtlasStore,
  useCanvas,
  useVault,
  useVaultSelector,
} from "react-iiif-vault";
import { useAnnotationThumbnail } from "../../hooks/useAnnotationThumbnail";
import { CanvasLayoutPicker } from "./CanvasLayoutPicker";
import { refitCanvasViewer } from "./refit-viewer";
import { useAddCanvasImage } from "./useAddCanvasImage";
import {
  ACCENT,
  ACCENT_BORDER,
  ACCENT_DARK,
  ACCENT_TINT,
  ActionPill,
  ArrowDownIcon,
  ArrowUpIcon,
  GripIcon,
  confirmRemoveImage,
  PanelCard,
  PlusIcon,
  ReplaceIcon,
  SectionTitle,
  TrashIcon,
} from "./ui";

export function CanvasLayoutSection() {
  const t = useTranslations("editors");
  const canvas = useCanvas();
  const store = useAtlasStore();
  const vault = useVault();
  const add = useAddCanvasImage();
  const [pending, setPending] = useState<CanvasLayout | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropOn, setDropOn] = useState<number | null>(null);
  const state = useVaultSelector((_, v) => (canvas ? getCanvasLayout(v, canvas.id) : undefined), [canvas?.id]);
  const images = useVaultSelector((_, v) => (canvas ? getPaintingImages(v, canvas) : []), [canvas]);
  const placeholders = useVaultSelector(
    (_, v) => (canvas ? getEmptyCanvasPlaceholders(v, canvas).length : 0),
    [canvas]
  );
  if (!canvas || !canResizeCanvas(vault, canvas) || getPaintingAnnotations(vault, canvas).length !== images.length)
    return null;
  const managed = isTemplateManaged(vault, canvas);
  const regions = hasCanvasRegionAnnotations(vault, canvas);
  const template = canvasLayouts.find((layout) => layout.id === state?.layoutId);
  function cancelSelection() {
    const current = store.getState();
    const requestId = current.tool.requestId;
    if (requestId && current.requests[requestId]?.arguments?.canvasComposition) current.cancelRequest(requestId);
  }
  function apply(layout: CanvasLayout) {
    cancelSelection();
    beginCanvasComposition(vault, canvas!);
    applyCanvasLayout(vault, canvas!, layout);
    setPending(null);
  }
  function choose(layout: CanvasLayout) {
    if (regions || (state && !managed)) setPending(layout);
    else apply(layout);
  }
  function swap(from: number, to: number) {
    if (from === to) return;
    cancelSelection();
    swapCanvasPositions(vault, canvas!, from, to);
  }
  const filled = state ? state.slots.length - placeholders : 0;

  return (
    <section aria-label="Layout" className="flex flex-col gap-3">
      {state && !managed && (
        <output
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 8,
            fontSize: 12,
            lineHeight: 1.35,
            background: "#fffaeb",
            border: "1px solid #fedf89",
            color: "#93370d",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                flexShrink: 0,
                borderRadius: 999,
                background: "#f79009",
              }}
            />
            <span>
              <strong style={{ display: "block", fontWeight: 600 }}>
                Custom arrangement
              </strong>
              <span style={{ opacity: 0.85 }}>Images have been positioned by hand.</span>
            </span>
          </span>
          {template && template.slots.length > 0 && (
            <ActionPill variant="secondary" icon={<ReplaceIcon />} onClick={() => choose(template)}>
              Reapply {template.label}
            </ActionPill>
          )}
        </output>
      )}
      {regions && (
        <PanelCard tone="warning">
          Tour steps and other annotation regions keep their canvas positions. Automatic layout resizing is
          unavailable.
        </PanelCard>
      )}
      {pending && (
        <div role="alert">
          <PanelCard tone="warning">
            <p style={{ margin: "0 0 10px" }}>
              <strong>Apply {pending.label}?</strong> This replaces custom image positions.
              {regions ? " Tour and annotation regions will not follow the images." : ""} You can discard the
              composition changes before choosing Done.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <ActionPill variant="primary" onClick={() => apply(pending)}>
                Apply layout
              </ActionPill>
              <ActionPill variant="secondary" onClick={() => setPending(null)}>
                Cancel
              </ActionPill>
            </div>
          </PanelCard>
        </div>
      )}
      <CanvasLayoutPicker
        compact
        value={pending?.id || (managed ? state?.layoutId : undefined)}
        imageCount={images.length}
        aspectRatio={canvas.width / canvas.height}
        onChange={choose}
      />
      {managed && state && (
        <div className="flex flex-col gap-2">
          <SectionTitle aside={`${filled} of ${state.slots.length} filled`}>Image positions</SectionTitle>
          <ol aria-label="Image positions" className="m-0 flex list-none flex-col gap-2 p-0">
            {state.slots.map((slot, index) => {
              const image = images.find((image) => image.id === slot.annotationIds?.[0]);
              const target = dropOn === index && dragFrom !== null && dragFrom !== index;
              return (
                // The arrow buttons provide the keyboard equivalent of native drag/drop.
                // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                <li
                  key={slot.id}
                  className="flex items-center gap-2.5 rounded-lg p-2 text-sm transition-[box-shadow,background,opacity]"
                  style={{
                    background: target ? ACCENT_TINT : image ? "#ffffff" : "#fcfcfd",
                    border: `1px ${image ? "solid" : "dashed"} ${target ? ACCENT : image ? "#e5e7eb" : "#d1d5db"}`,
                    boxShadow: target ? `0 0 0 2px ${ACCENT_BORDER}` : "0 1px 1px rgba(16,24,40,0.04)",
                    opacity: dragFrom === index ? 0.45 : 1,
                  }}
                  draggable={!!image}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("application/x-canvas-position", String(index));
                    setDragFrom(index);
                  }}
                  onDragEnd={() => {
                    setDragFrom(null);
                    setDropOn(null);
                  }}
                  onDragOver={(event) => {
                    if (dragFrom === null) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    if (dropOn !== index) setDropOn(index);
                  }}
                  onDragLeave={() => setDropOn((current) => (current === index ? null : current))}
                  onDrop={(event) => {
                    event.preventDefault();
                    const value = event.dataTransfer.getData("application/x-canvas-position");
                    setDragFrom(null);
                    setDropOn(null);
                    if (value !== "") swap(Number(value), index);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="flex w-3 shrink-0 justify-center"
                    style={{ color: image ? "#9ca3af" : "transparent", cursor: image ? "grab" : "default" }}
                  >
                    <GripIcon />
                  </span>
                  <PositionThumbnail number={index + 1} imageId={image?.id} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900">Position {index + 1}</div>
                    <div className="mb-1.5 truncate text-xs text-gray-500">
                      {image ? (
                        <AnnotationContext annotation={image.id}>
                          <ImageSummary />
                        </AnnotationContext>
                      ) : target ? (
                        "Drop to move here"
                      ) : (
                        "Empty"
                      )}
                    </div>
                    {image ? (
                      <div className="-ml-1.5 flex flex-wrap gap-0.5">
                        <ActionPill
                          variant="quiet"
                          icon={<ReplaceIcon />}
                          onClick={() => {
                            cancelSelection();
                            void add(slot, false, image.id);
                          }}
                        >
                          Replace
                        </ActionPill>
                        <ActionPill
                          variant="danger"
                          icon={<TrashIcon />}
                          onClick={() => {
                            if (!confirmRemoveImage(index + 1)) return;
                            cancelSelection();
                            removeCanvasImage(vault, canvas, image.id);
                          }}
                        >
                          Remove
                        </ActionPill>
                      </div>
                    ) : (
                      <ActionPill variant="secondary" icon={<PlusIcon />} onClick={() => void add(slot)}>
                        Add image
                      </ActionPill>
                    )}
                  </div>
                  {image && (
                    <div className="flex shrink-0 flex-col gap-0.5 self-center">
                      <ActionPill
                        variant="quiet"
                        iconOnly
                        aria-label={`Move position ${index + 1} up`}
                        disabled={index === 0}
                        onClick={() => swap(index, index - 1)}
                        icon={<ArrowUpIcon />}
                      />
                      <ActionPill
                        variant="quiet"
                        iconOnly
                        aria-label={`Move position ${index + 1} down`}
                        disabled={index === state.slots.length - 1}
                        onClick={() => swap(index, index + 1)}
                        icon={<ArrowDownIcon />}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="m-0 text-[11px] text-gray-500">
            Drag a position onto another to swap them, or use the arrows. Empty positions can be filled any time.
          </p>
        </div>
      )}
      {placeholders > 0 && (
        <div>
          <ActionPill variant="quiet" onClick={() => clearCanvasPlaceholders(vault, canvas)}>
            {t("ui.clearPlaceholders")}
          </ActionPill>
        </div>
      )}
      <CanvasCompositionSession />
    </section>
  );
}

function PositionThumbnail({ number, imageId }: { number: number; imageId?: string }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-md"
      style={{
        width: 64,
        height: 64,
        background: imageId ? "#f3f4f6" : ACCENT_TINT,
        border: `1px solid ${imageId ? "#e5e7eb" : ACCENT_BORDER}`,
        color: ACCENT,
      }}
    >
      {imageId ? (
        <AnnotationContext annotation={imageId}>
          <ThumbnailPicture />
        </AnnotationContext>
      ) : (
        <PlusIcon />
      )}
      <span
        className="absolute left-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded px-1 text-[10px] font-bold leading-none"
        style={{ background: ACCENT, color: "#ffffff" }}
      >
        {number}
      </span>
    </span>
  );
}

function ThumbnailPicture() {
  const thumbnail = useAnnotationThumbnail();
  return thumbnail ? <ThumbnailImg src={thumbnail.id} alt="" className="h-full w-full object-cover" /> : null;
}

function ImageSummary() {
  const annotation = useAnnotation();
  const vault = useVault();
  const size = annotation ? getImageSize(vault, annotation) : null;
  return (
    <>
      {annotation?.label ? <LocaleString>{annotation.label}</LocaleString> : "Image"}
      {size ? ` · ${Math.round(size.width)} × ${Math.round(size.height)}` : ""}
    </>
  );
}

export function CanvasCompositionSession() {
  const canvas = useCanvas();
  const vault = useVault();
  const store = useAtlasStore();
  // Only a hand-made move is worth interrupting for; other edits have their own undo (resize) or confirmation (remove).
  const editing = useVaultSelector(
    (_, v) => (canvas ? !!getCanvasCompositionSnapshot(v, canvas.id) && isCanvasCompositionMoved(v, canvas.id) : false),
    [canvas]
  );
  if (!canvas || !editing) return null;
  function finish(discard = false) {
    const current = store.getState();
    const id = current.tool.requestId;
    if (id && current.requests[id]?.arguments?.canvasComposition) current.cancelRequest(id);
    completeCanvasComposition(vault, canvas!.id, discard);
    if (discard) {
      const restored = vault.get(canvas!) as { width: number; height: number };
      refitCanvasViewer(store, restored.width, restored.height);
    }
  }
  return (
    <div
      className="flex flex-col gap-2 rounded-lg p-3"
      style={{ background: ACCENT_TINT, border: `1px solid ${ACCENT_BORDER}` }}
    >
      <p className="m-0 text-xs" style={{ color: ACCENT_DARK }}>
        <span className="font-semibold">Editing composition.</span> Changes show on the canvas straight away. Done keeps
        them; discarding restores how the slide was before you started.
      </p>
      <div className="flex gap-2">
        <ActionPill variant="primary" style={{ height: 32 }} onClick={() => finish()}>
          Done
        </ActionPill>
        <ActionPill variant="secondary" style={{ height: 32 }} onClick={() => finish(true)}>
          Discard composition changes
        </ActionPill>
      </div>
    </div>
  );
}
