import { CanvasShapePicker } from "./CanvasImageMode";
import {
  canResizeCanvas,
  expandedCanvasBounds,
  getAnnotationRectangle,
  getPaintingAnnotations,
  resizeCanvas,
  resizeWithAspectRatio,
  validSize,
} from "@manifest-editor/editor-api";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useCanvas, useVault, useVaultSelector } from "react-iiif-vault";

const ACCENT = "#b84c74";

export function SmartCanvasSize({
  children,
  showShapes = false,
  fallback = null,
}: {
  children?: ReactNode;
  showShapes?: boolean;
  fallback?: ReactNode;
}) {
  const canvas = useCanvas();
  const vault = useVault();
  const id = useId();
  const [size, setSize] = useState({ width: canvas?.width || 1, height: canvas?.height || 1 });
  const [locked, setLocked] = useState(true);
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
  if (!canvas || !canResizeCanvas(vault, canvas)) return fallback;

  const fit = expandedCanvasBounds(canvas, rectangles);
  const needsFit = fit.width !== canvas.width || fit.height !== canvas.height;
  const dirty = size.width !== canvas.width || size.height !== canvas.height;
  const clipsContent = rectangles.some((r) => r.x + r.width > size.width || r.y + r.height > size.height);
  const canApply = dirty && validSize(size);

  return (
    <section aria-label="Canvas size" style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
      <h3 className="text-sm font-semibold text-gray-900">Canvas size</h3>
      <div className="flex items-end gap-1.5">
        {(["width", "height"] as const).map((axis, index) => (
          <div key={axis} className="contents">
            {index === 1 && (
              <button
                type="button"
                aria-label="Lock aspect ratio"
                title={locked ? "Aspect ratio locked" : "Aspect ratio unlocked"}
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
              {axis === "width" ? "W" : "H"} px
              <input
                aria-label={axis === "width" ? "Width (px)" : "Height (px)"}
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
                className="mt-0.5 block w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900"
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          aria-label="Apply size"
          disabled={!canApply}
          onClick={() => resizeCanvas(vault, canvas, { x: 0, y: 0, ...size })}
          className="shrink-0 rounded px-3 text-sm font-semibold"
          style={{
            height: 30,
            background: canApply ? ACCENT : "#e5e7eb",
            color: canApply ? "#ffffff" : "#9ca3af",
            border: "none",
            cursor: canApply ? "pointer" : "not-allowed",
          }}
        >
          Apply
        </button>
      </div>

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
      {children && <div className="text-xs text-gray-600">{children}</div>}

      {needsFit && (
        <p className="text-xs text-gray-600">
          Images extend past the canvas.{" "}
          <button
            type="button"
            className="font-semibold underline"
            style={{ color: ACCENT, background: "none", border: "none", padding: 0 }}
            onClick={() => resizeCanvas(vault, canvas, fit)}
          >
            Expand to fit {fit.width} × {fit.height}
          </button>
        </p>
      )}
      {dirty && clipsContent && (
        <output className="block text-xs text-amber-800">This size will clip part of an image.</output>
      )}
    </section>
  );
}
