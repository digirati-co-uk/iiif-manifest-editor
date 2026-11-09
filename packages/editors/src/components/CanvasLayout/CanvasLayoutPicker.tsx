import { canvasLayouts, type CanvasLayout } from "@manifest-editor/editor-api";
import { useId, useState } from "react";

const ACCENT = "#b84c74";
const MAX_PREVIEW = 6;

export function CanvasLayoutPicker({
  value,
  onChange,
  imageCount = 0,
  aspectRatio = 1.5,
  compact = false,
}: {
  value?: string;
  onChange: (layout: CanvasLayout) => void;
  imageCount?: number;
  aspectRatio?: number;
  compact?: boolean;
}) {
  const name = useId();
  const [hovered, setHovered] = useState<string | null>(null);
  const layouts = canvasLayouts.filter((l) => l.slots.length <= MAX_PREVIEW && l.slots.length >= imageCount);
  const W = aspectRatio * 100;

  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="text-sm font-semibold text-gray-900">Image layout</legend>
      {!compact && (
        <p className="text-xs text-gray-500">
          {imageCount
            ? `Layouts for ${imageCount} image${imageCount === 1 ? "" : "s"}. Applying one replaces manual positioning.`
            : "Start with a layout, then add your images. You can move and resize them freely."}
        </p>
      )}
      <div
        className="grid gap-2"
        style={{ marginTop: 10, gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 76 : 112}px, 1fr))` }}
      >
        {layouts.map((layout) => {
          const active = value === layout.id;
          return (
            <label
              key={layout.id}
              title={layout.label}
              className="relative min-w-0 cursor-pointer rounded-md border p-1.5 focus-within:ring-2"
              style={{
                borderColor: active || hovered === layout.id ? ACCENT : "#e5e7eb",
                background: active ? "#fbeff4" : hovered === layout.id ? "#fcf6f9" : "#ffffff",
                transition: "background 120ms, border-color 120ms",
                boxShadow: hovered === layout.id ? "0 2px 5px #892c4e18" : "none",
              }}
            >
              <input
                type="radio"
                onMouseEnter={() => setHovered(layout.id)}
                onMouseLeave={() => setHovered(null)}
                aria-label={layout.label}
                name={name}
                value={layout.id}
                checked={active}
                onChange={() => onChange(layout)}
                onClick={() => {
                  if (active) onChange(layout);
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <svg
                viewBox={`0 0 ${W} 100`}
                className="block w-full"
                style={{ height: compact ? 40 : 56 }}
                aria-hidden="true"
              >
                <rect width={W} height={100} rx={3} fill="#f9fafb" stroke="#e5e7eb" />
                {layout.slots.slice(0, MAX_PREVIEW).map((s, i) => (
                  <rect
                    key={i}
                    x={s.x * W}
                    y={s.y * 100}
                    width={s.width * W}
                    height={s.height * 100}
                    rx={2}
                    fill={i % 2 ? "#f3d5e0" : "#e8c3d1"}
                    fillOpacity={0.92}
                    stroke={ACCENT}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {!layout.slots.length && (
                  <rect x={10} y={10} width={W - 20} height={80} fill="none" stroke={ACCENT} strokeDasharray="5 4" />
                )}
              </svg>
            </label>
          );
        })}
      </div>
      {!layouts.length && (
        <p className="text-sm text-gray-500">No templates fit this many images. You can still arrange them freely.</p>
      )}
    </fieldset>
  );
}
