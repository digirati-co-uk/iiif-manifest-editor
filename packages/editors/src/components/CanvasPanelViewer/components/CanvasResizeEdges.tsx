import { HTMLPortal, useRuntime } from "@atlas-viewer/atlas";
import { resizeCanvasHandle, type CanvasHandle, type Rectangle, type Size } from "@manifest-editor/editor-api";
import { useRef } from "react";

/** Independent handles avoid clipping at the canvas boundary and share one hit-area size. */
export function CanvasResizeEdges({
  size,
  preview,
  onPreview,
  onCommit,
  onDone,
  onDiscard,
}: {
  size: Size;
  preview: Rectangle | null;
  onPreview: (rect: Rectangle | null) => void;
  onCommit: (rect: Rectangle) => void;
  onDone: () => void;
  onDiscard: () => void;
}) {
  const runtime = useRuntime();
  const drag = useRef<{ x: number; y: number; scale: number; size: Size; next: Rectangle } | null>(null);
  const rect = preview || { x: 0, y: 0, ...size };
  const scale = runtime?.getScaleFactor(false) || 1;
  const viewportTop = runtime?.getViewport().y || 0;
  const toolbarInside = (rect.y - viewportTop) * scale < 90;
  const toolbarY = toolbarInside ? Math.max(rect.y + 16 / scale, viewportTop + 72 / scale) : rect.y;
  return (
    <world-object width={size.width} height={size.height}>
      <world-object x={rect.x} y={rect.y} width={rect.width} height={rect.height}>
        <box
          target={{ x: 0, y: 0, width: rect.width, height: rect.height }}
          relativeStyle
          interactive={false}
          style={{ border: "2px dashed #b84c74" }}
        />
      </world-object>
      {(
        ["top", "right", "bottom", "left", "top-left", "top-right", "bottom-left", "bottom-right"] as CanvasHandle[]
      ).map((handle) => {
        const corner = handle.includes("-");
        const horizontal = handle === "left" || handle === "right";
        const x = rect.x + (handle.includes("left") ? 0 : handle.includes("right") ? rect.width : rect.width / 2);
        const y = rect.y + (handle.includes("top") ? 0 : handle.includes("bottom") ? rect.height : rect.height / 2);
        const cursor = corner
          ? handle === "top-left" || handle === "bottom-right"
            ? "nwse-resize"
            : "nesw-resize"
          : horizontal
            ? "ew-resize"
            : "ns-resize";
        return (
          <HTMLPortal key={handle} target={{ x, y, width: 1, height: 1 }} relative interactive>
            <button
              type="button"
              aria-label={`Resize canvas ${handle} ${corner ? "corner" : "edge"}`}
              title={corner ? "Drag to resize · Shift unlocks proportions" : "Drag to resize"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                padding: 0,
                transform: "translate(-50%, -50%)",
                background: "transparent",
                border: 0,
                cursor,
                touchAction: "none",
                position: "relative",
                zIndex: corner ? 3 : 2,
              }}
              onPointerDown={(event) => {
                if (!runtime) return;
                event.stopPropagation();
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = {
                  x: event.clientX,
                  y: event.clientY,
                  scale: runtime.getScaleFactor(false),
                  size,
                  next: { x: 0, y: 0, ...size },
                };
              }}
              onPointerMove={(event) => {
                const current = drag.current;
                if (!current) return;
                event.stopPropagation();
                current.next = resizeCanvasHandle(
                  current.size,
                  handle,
                  (event.clientX - current.x) / current.scale,
                  (event.clientY - current.y) / current.scale,
                  !event.shiftKey
                );
                onPreview(current.next);
              }}
              onPointerUp={(event) => {
                const current = drag.current;
                if (!current) return;
                drag.current = null;
                event.stopPropagation();
                event.currentTarget.releasePointerCapture(event.pointerId);
                onCommit(current.next);
                onPreview(null);
              }}
              onPointerCancel={() => {
                drag.current = null;
                onPreview(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape" || event.key === "Enter") {
                  if (event.key === "Escape") onDiscard();
                  else onDone();
                  return;
                }
                const step = event.shiftKey ? 10 : 1;
                const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
                const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
                if (!dx && !dy) return;
                event.preventDefault();
                event.stopPropagation();
                onCommit(resizeCanvasHandle(size, handle, dx, dy, !event.shiftKey));
              }}
            >
              <span
                style={{
                  display: "block",
                  width: corner ? 10 : horizontal ? 6 : 18,
                  height: corner ? 10 : horizontal ? 18 : 6,
                  border: "1.5px solid #b84c74",
                  background: "white",
                  borderRadius: corner ? 2 : 3,
                  boxShadow: "0 1px 3px #0003",
                }}
              />
            </button>
          </HTMLPortal>
        );
      })}
      <HTMLPortal target={{ x: rect.x + rect.width / 2, y: toolbarY, width: 1, height: 1 }} relative interactive>
        <div
          style={{
            transform: toolbarInside ? "translateX(-50%)" : "translate(-50%, -100%)",
            paddingBottom: 16,
            whiteSpace: "nowrap",
            width: "max-content",
            display: "flex",
            gap: 6,
          }}
        >
          <button
            type="button"
            onClick={onDone}
            style={{
              background: "#b84c74",
              color: "white",
              border: 0,
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 13,
            }}
          >
            Done
          </button>
          <button
            type="button"
            onClick={onDiscard}
            style={{
              color: "#892c4e",
              background: "white",
              border: "1px solid #bfa5af",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 13,
            }}
          >
            Discard changes
          </button>
        </div>
      </HTMLPortal>
    </world-object>
  );
}
