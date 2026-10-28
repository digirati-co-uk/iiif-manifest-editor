import { useDisplayLabel } from "../../i18n";
import { useTranslations } from "@manifest-editor/i18n";
import { canvasLayouts, canvasSizePresets } from "@manifest-editor/editor-api";
import type { InternationalString } from "@iiif/presentation-3";
import { useState } from "react";
import { CanvasLayoutPicker } from "./CanvasLayoutPicker";

export interface CanvasLayoutPayload {
  label?: InternationalString;
  width?: number;
  height?: number;
  layoutId?: string;
  columns?: number;
  rows?: number;
}

const ACCENT = "#b84c74";

function RatioGlyph({ ratio }: { ratio: number }) {
  const w = ratio >= 1 ? 18 : 18 * ratio;
  const h = ratio >= 1 ? 18 / ratio : 18;
  return (
    <span className="inline-flex items-center justify-center" style={{ width: 18, height: 18 }} aria-hidden="true">
      <span style={{ width: w, height: h, border: "1.5px solid currentColor", borderRadius: 2, display: "block" }} />
    </span>
  );
}

export function CanvasLayoutForm({ runCreate }: { runCreate: (data: CanvasLayoutPayload) => void }) {
  const t = useTranslations("editors");
  const apiLabel = useDisplayLabel();
  const [layout, setLayout] = useState(canvasLayouts[0]!);
  const [sizeIndex, setSizeIndex] = useState(0);
  const size = canvasSizePresets[sizeIndex]!;
  const width = size.columns * 250;
  const height = size.rows * 250;

  return (
    <form
      className="w-full space-y-4 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        runCreate({
          label: { en: ["Untitled collage"] },
          width,
          height,
          columns: size.columns,
          rows: size.rows,
          layoutId: layout.id,
        });
      }}
    >
      <fieldset aria-label={t("ui.canvasShape")} className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-gray-900">{t("ui.shape")}</span>
        {canvasSizePresets.map((preset, i) => {
          const active = i === sizeIndex;
          const name = apiLabel(preset);
          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={active}
              onClick={() => setSizeIndex(i)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
              style={{
                color: active ? "#8f3558" : "#4b5563",
                background: active ? "#fbeff4" : "#ffffff",
                borderColor: active ? ACCENT : "#e5e7eb",
              }}
            >
              <RatioGlyph ratio={preset.columns / preset.rows} />
              {name}
              <span style={{ opacity: 0.6 }}>
                {preset.columns}×{preset.rows}
              </span>
            </button>
          );
        })}
      </fieldset>

      <CanvasLayoutPicker value={layout.id} onChange={setLayout} aspectRatio={size.columns / size.rows} />

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-500">{t("messages.sizeLater", { width, height })}</p>
        <button
          type="submit"
          className="rounded-md px-4 py-1.5 text-sm font-semibold"
          style={{ background: ACCENT, color: "#ffffff", border: `1px solid ${ACCENT}` }}
        >
          {t("ui.createCanvas")}
        </button>
      </div>
    </form>
  );
}
