import { useDisplayLabel } from "../../i18n";
import { useTranslations } from "@manifest-editor/i18n";
import type { ReactNode } from "react";
import { canvasSizePresets } from "@manifest-editor/editor-api";

const PRIMARY = "#b84c74";
const TEXT = "#892c4e";
const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export function CanvasImageMode({
  singleImage,
  allowSwitchToMulti = true,
  canReturnToSingle,
  onSwitchToMulti,
  onSwitchToSingle,
  children,
}: {
  singleImage: boolean;
  allowSwitchToMulti?: boolean;
  canReturnToSingle: boolean;
  onSwitchToMulti: () => void;
  onSwitchToSingle: () => void;
  children: ReactNode;
}) {
  const t = useTranslations("editors");
  const modeButton = (label: string, note: string, onClick: () => void) => (
    <div className="flex flex-col gap-1.5 rounded-lg border border-gray-200 bg-white p-3">
      <button
        type="button"
        onClick={onClick}
        className={`${focusRing} self-start rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-[#fbeff4]`}
        style={{ color: TEXT, borderColor: "#e9b7ca", background: "#ffffff", outlineColor: PRIMARY }}
      >
        {label}
      </button>
      <p className="m-0 text-xs leading-snug text-gray-500">{note}</p>
    </div>
  );

  if (singleImage) {
    if (!allowSwitchToMulti) return null;
    return (
      <div className="my-3">
        {modeButton(
          t("ui.switchToMultiimageLayout"),
          t("ui.shrinksAndCentresTheImageSoMoreImagesCanShareThisCanvas"),
          onSwitchToMulti
        )}
      </div>
    );
  }

  return (
    <div className="my-3 flex flex-col gap-4">
      {children}
      {canReturnToSingle
        ? modeButton(
            t("ui.switchToSingleImage"),
            t("ui.fitsTheCanvasToTheImageAndClearsEmptyPlaceholders"),
            onSwitchToSingle
          )
        : null}
    </div>
  );
}

export function CanvasShapePicker({
  aspectRatio,
  onChange,
}: {
  aspectRatio: number;
  onChange: (preset: { columns: number; rows: number; label: string }) => void;
}) {
  const t = useTranslations("editors");
  const apiLabel = useDisplayLabel();
  return (
    <fieldset aria-label={t("ui.canvasShape")} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {canvasSizePresets.map((preset) => {
        const active = Math.abs(preset.columns / preset.rows - aspectRatio) < 0.01;
        const w = preset.columns >= preset.rows ? 28 : Math.round((28 * preset.columns) / preset.rows);
        const h = preset.columns >= preset.rows ? Math.round((28 * preset.rows) / preset.columns) : 28;
        return (
          <button
            key={apiLabel(preset)}
            type="button"
            title={apiLabel(preset)}
            aria-label={apiLabel(preset)}
            aria-pressed={active}
            onClick={() => onChange(preset)}
            className={`${focusRing} flex flex-col items-center`}
            style={{
              gap: 4,
              padding: 2,
              minWidth: 44,
              background: "none",
              border: 0,
              outlineColor: PRIMARY,
              cursor: "pointer",
              color: active ? TEXT : "#6b7280",
              fontSize: 11,
              fontWeight: active ? 600 : 400,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 }}>
              <span
                aria-hidden="true"
                style={{
                  width: w,
                  height: h,
                  borderRadius: 2,
                  background: active ? PRIMARY : "#d1d5db",
                }}
              />
            </span>
            <span>
              {preset.columns}×{preset.rows}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
