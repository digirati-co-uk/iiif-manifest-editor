import { useTranslations } from "@manifest-editor/i18n";
import { CanvasShapePicker } from "./CanvasImageMode";
import {
  canReapplyCanvasLayout,
  canResizeCanvas,
  canvasLayouts,
  captureCanvasComposition,
  getCanvasLayout,
  hasCanvasRegionAnnotations,
  isTemplateManaged,
  restoreCanvasComposition,
  resizeCanvasLayout,
  expandedCanvasBounds,
  getAnnotationRectangle,
  getPaintingAnnotations,
  resizeCanvas,
  resizeWithAspectRatio,
  validSize,
} from "@manifest-editor/editor-api";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useAtlasStore, useCanvas, useVault, useVaultSelector } from "react-iiif-vault";
import { refitCanvasViewer } from "./refit-viewer";
import { ACCENT, ACCENT_BORDER, ActionPill, SectionTitle, UndoIcon } from "./ui";

type ResizeFn = (bounds: { x: number; y: number; width: number; height: number }) => void;

export function SmartCanvasSize({
  children,
  showShapes = false,
  fallback = null,
  templateAware = false,
}: {
  /** Receives `resize`, which honours the "reapply layout" choice and records an undo step. */
  children?: ReactNode | ((api: { resize: ResizeFn }) => ReactNode);
  templateAware?: boolean;
  showShapes?: boolean;
  fallback?: ReactNode;
}) {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const canvas = useCanvas();
  const vault = useVault();
  const store = useAtlasStore();
  const id = useId();
  const [size, setSize] = useState({ width: canvas?.width || 1, height: canvas?.height || 1 });
  const [locked, setLocked] = useState(true);
  // Untouched layouts reflow automatically; hand-arranged ones keep their positions unless the user opts in.
  const [reapplyChoice, setReapplyChoice] = useState<boolean | null>(null);
  const [undo, setUndo] = useState<{
    snapshot: ReturnType<typeof captureCanvasComposition>;
    width: number;
    height: number;
    reflowed: boolean;
  } | null>(null);
  const ratioBasis = useRef(size);
  const rectangles = useVaultSelector(
    (_, v) =>
      canvas
        ? getPaintingAnnotations(v, canvas).flatMap((a) => {
            const rect = getAnnotationRectangle(v, a, canvas);
            return rect ? [rect] : [];
          })
        : [],
    [canvas]
  );
  const width = canvas?.width;
  const height = canvas?.height;
  useEffect(() => {
    if (width && height) {
      setSize({ width, height });
      ratioBasis.current = { width, height };
    }
  }, [canvas?.id, width, height]);
  useEffect(() => setUndo(null), [canvas?.id]);
  useEffect(() => setReapplyChoice(null), [canvas?.id]);
  if (!canvas || !canResizeCanvas(vault, canvas)) return fallback;

  const layoutState = templateAware ? getCanvasLayout(vault, canvas.id) : undefined;
  const template = canvasLayouts.find((layout) => layout.id === layoutState?.layoutId);
  const managed = templateAware && isTemplateManaged(vault, canvas);
  const canReapply = templateAware && canReapplyCanvasLayout(vault, canvas);
  const pinned = templateAware && !!template?.slots.length && hasCanvasRegionAnnotations(vault, canvas);
  const reapply = reapplyChoice ?? managed;
  const willReflow = canReapply && reapply;
  const undoAvailable = !!undo && undo.width === canvas.width && undo.height === canvas.height;
  const refit = (width: number, height: number) => refitCanvasViewer(store, width, height);
  const resize: ResizeFn = (bounds) => {
    const before = captureCanvasComposition(vault, canvas);
    if (templateAware) resizeCanvasLayout(vault, canvas, bounds, { reapply: reapply && canReapply });
    else resizeCanvas(vault, canvas, bounds);
    refit(Math.round(bounds.width), Math.round(bounds.height));
    setUndo({ snapshot: before, width: Math.round(bounds.width), height: Math.round(bounds.height), reflowed: willReflow });
  };
  const fit = expandedCanvasBounds(canvas, rectangles);
  const needsFit = fit.width !== canvas.width || fit.height !== canvas.height;
  const dirty = size.width !== canvas.width || size.height !== canvas.height;
  const clipsContent = rectangles.some((r) => r.x + r.width > size.width || r.y + r.height > size.height);
  const canApply = dirty && validSize(size);

  const extra = typeof children === "function" ? children({ resize }) : children;

  return (
    <section
      aria-label={t("ui.canvasSize")}
      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
    >
      <SectionTitle aside={`${canvas.width} × ${canvas.height} px`}>
        {templateAware ? "Slide size" : t("ui.canvasSize")}
      </SectionTitle>
      <div className="flex items-end gap-1.5">
        {(["width", "height"] as const).map((axis, index) => (
          <div key={axis} className="contents">
            {index === 1 && (
              <button
                type="button"
                aria-label={t("ui.lockAspectRatio")}
                title={locked ? t("ui.aspectRatioLocked") : t("ui.aspectRatioUnlocked")}
                aria-pressed={locked}
                onClick={() => {
                  if (!locked && validSize(size)) ratioBasis.current = size;
                  setLocked((value) => !value);
                }}
                className="flex shrink-0 items-center justify-center rounded border"
                style={{
                  width: 30,
                  height: 30,
                  background: locked ? "#fbeff4" : "#ffffff",
                  color: locked ? ACCENT : "#6b7280",
                  borderColor: locked ? ACCENT : "#e5e7eb",
                }}
              >
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path d={locked ? "M8 10V6a4 4 0 0 1 8 0v4" : "M8 10V6a4 4 0 0 1 8 0"} />
                </svg>
              </button>
            )}
            <label htmlFor={`${id}-${axis}`} className="min-w-0 flex-1 text-[11px] font-medium text-gray-500">
              {axis === "width" ? t("ui.widthPx") : t("ui.heightPx")}
              <input
                aria-label={axis === "width" ? t("ui.widthPx") : t("ui.heightPx")}
                id={`${id}-${axis}`}
                type="number"
                min={1}
                step={1}
                value={size[axis] || ""}
                onChange={(event) => {
                  const value = event.target.valueAsNumber;
                  setSize((current) =>
                    Number.isFinite(value) && value >= 1
                      ? resizeWithAspectRatio(locked ? ratioBasis.current : current, axis, value, locked)
                      : { ...current, [axis]: 0 }
                  );
                }}
                className="mt-0.5 block w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 focus:outline focus:outline-2"
                style={{ outlineColor: ACCENT }}
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          aria-label={t("ui.applySize")}
          disabled={!canApply}
          onClick={() => resize({ x: 0, y: 0, ...size })}
          className="shrink-0 rounded px-3 text-sm font-semibold"
          style={{
            height: 30,
            background: canApply ? ACCENT : "#e5e7eb",
            color: canApply ? "#ffffff" : "#9ca3af",
            border: "none",
            cursor: canApply ? "pointer" : "not-allowed",
          }}
        >
          {commonT("actions.apply")}
        </button>
      </div>

      {templateAware && (canReapply || pinned) && (
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#ffffff",
            border: `1px solid ${willReflow ? ACCENT_BORDER : "#e5e7eb"}`,
            opacity: pinned ? 0.75 : 1,
            cursor: canReapply ? "pointer" : "default",
          }}
        >
          <input
            type="checkbox"
            aria-label="Reapply layout when resizing"
            style={{ accentColor: ACCENT, width: 16, height: 16, margin: "1px 0 0", flexShrink: 0 }}
            checked={canReapply && reapply}
            disabled={!canReapply}
            onChange={(event) => setReapplyChoice(event.target.checked)}
          />
          <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, fontSize: 12, lineHeight: 1.4 }}>
            <strong style={{ fontWeight: 600, color: "#101828" }}>Reapply layout when resizing</strong>
            <span style={{ color: "#667085" }}>
              {pinned
                ? "Tour steps keep their canvas positions, so images stay where they are."
                : !reapply
                  ? managed
                    ? "Every image keeps its current position and size."
                    : `Images keep the positions you gave them. Tick to return to the ${template?.label ?? "template"} layout when resizing.`
                  : managed
                    ? `Images are re-arranged to fit the ${template?.label ?? "template"} layout at the new size.`
                    : `Positions you set by hand are replaced with the ${template?.label ?? "template"} layout. You can undo straight after.`}
            </span>
          </span>
        </label>
      )}

      {showShapes && (
        <CanvasShapePicker
          aspectRatio={size.width / size.height}
          onChange={(preset) => {
            const next = {
              width: size.width || canvas.width,
              height: Math.round(((size.width || canvas.width) * preset.rows) / preset.columns),
            };
            ratioBasis.current = next;
            setSize(next);
          }}
        />
      )}
      {extra ? <div className="text-xs text-gray-600">{extra}</div> : null}

      {needsFit && (
        <p className="text-xs text-gray-600">
          {t("ui.imagesExtendPastTheCanvas")}{" "}
          <button
            type="button"
            className="font-semibold underline"
            style={{ color: ACCENT, background: "none", border: "none", padding: 0 }}
            onClick={() => resizeCanvas(vault, canvas, fit)}
          >
            {t("messages.expandSize", { width: fit.width, height: fit.height })}
          </button>
        </p>
      )}
      {dirty && clipsContent && !willReflow && (
        <output className="block text-xs text-amber-800">{t("ui.thisSizeWillClipPartOfAnImage")}</output>
      )}
      {undo && undoAvailable && (
        <output
          className="flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-xs"
          style={{ background: "#ecfdf3", border: "1px solid #abefc6", color: "#067647" }}
        >
          <span>
            Resized to {undo.width} × {undo.height}
            {undo.reflowed ? " and layout reapplied." : "."}
          </span>
          <ActionPill
            variant="secondary"
            icon={<UndoIcon />}
            onClick={() => {
              restoreCanvasComposition(vault, canvas.id, undo.snapshot);
              refit(undo.snapshot.width, undo.snapshot.height);
              setUndo(null);
            }}
          >
            Undo
          </ActionPill>
        </output>
      )}
    </section>
  );
}
