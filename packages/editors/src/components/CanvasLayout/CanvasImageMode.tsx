import type { ReactNode } from "react";
import { canvasSizePresets } from "@manifest-editor/editor-api";

const PRIMARY = "#b84c74";
const TEXT = "#892c4e";
const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export function CanvasImageMode({
  singleImage,
  canReturnToSingle,
  onSwitchToMulti,
  onSwitchToSingle,
  children,
}: {
  singleImage: boolean;
  canReturnToSingle: boolean;
  onSwitchToMulti: () => void;
  onSwitchToSingle: () => void;
  children: ReactNode;
}) {
  const linkStyle = {
    color: PRIMARY,
    outlineColor: PRIMARY,
    background: "none",
    border: 0,
    padding: 0,
    alignSelf: "flex-start" as const,
    textAlign: "left" as const,
  };
  const noteStyle = { margin: 0, fontSize: 12, lineHeight: 1.4, color: "#6b7280" };

  if (singleImage) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, margin: "12px 0" }}>
        <button
          type="button"
          onClick={onSwitchToMulti}
          className={`${focusRing} self-start text-sm font-medium hover:underline`}
          style={linkStyle}
        >
          Switch to multi-image layout
        </button>
        <p style={noteStyle}>Shrinks and centres the image so more images can share this canvas.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, margin: "12px 0" }}>
      {children}
      {canReturnToSingle ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button
            type="button"
            onClick={onSwitchToSingle}
            className={`${focusRing} self-start text-sm font-medium hover:underline`}
            style={linkStyle}
          >
            Switch to single image
          </button>
          <p style={noteStyle}>Fits the canvas to the image and clears empty placeholders.</p>
        </div>
      ) : null}
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
  return (
    <fieldset aria-label="Canvas shape" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {canvasSizePresets.map((preset) => {
        const active = Math.abs(preset.columns / preset.rows - aspectRatio) < 0.01;
        const w = preset.columns >= preset.rows ? 28 : Math.round((28 * preset.columns) / preset.rows);
        const h = preset.columns >= preset.rows ? Math.round((28 * preset.rows) / preset.columns) : 28;
        return (
          <button
            key={preset.label}
            type="button"
            title={preset.label}
            aria-label={preset.label}
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
