import { EditorHTMLPortal as HTMLPortal } from "../../EditorI18nBridge";
import { EditorMessage } from "../../EditorMessage";
import { useEditorsTranslations as useTranslations } from "../../../editor-i18n-context";
import { IIIFBrowserIcon } from "@manifest-editor/components";

import { CanvasResizeEdges } from "./CanvasResizeEdges";
import {
  captureCanvasComposition,
  restoreCanvasComposition,
  expandedCanvasBounds,
  getAnnotationRectangle,
  getEmptyCanvasPlaceholders,
  getPaintingImages,
  layoutSlotToPixels,
  movePaintingImage,
  resizeCanvas,
  validRectangle,
  type CanvasPlaceholder,
  type Rectangle,
} from "@manifest-editor/editor-api";
import { useAddCanvasImage } from "../../CanvasLayout/useAddCanvasImage";
import { useStore } from "zustand";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAtlasStore,
  useCanvas,
  useCurrentAnnotationTransition,
  useRequestAnnotation,
  useVault,
  useVaultSelector,
} from "react-iiif-vault";

function pointsToRectangle(points?: number[][] | null): Rectangle | null {
  if (!points?.length) return null;
  const x = Math.min(...points.map((point) => point[0]!));
  const y = Math.min(...points.map((point) => point[1]!));
  const rect = {
    x,
    y,
    width: Math.max(...points.map((point) => point[0]!)) - x,
    height: Math.max(...points.map((point) => point[1]!)) - y,
  };
  return validRectangle(rect) ? rect : null;
}

/** Let the active selection and its screen-sized handles receive events through overlapping portals. */
function selectionHitArea(rect: Rectangle, selection: Rectangle | null) {
  if (!selection) return undefined;
  const left = `clamp(0px, calc(${((selection.x - rect.x) / rect.width) * 100}% - 10px), 100%)`;
  const top = `clamp(0px, calc(${((selection.y - rect.y) / rect.height) * 100}% - 10px), 100%)`;
  const right = `clamp(0px, calc(${((selection.x + selection.width - rect.x) / rect.width) * 100}% + 10px), 100%)`;
  const bottom = `clamp(0px, calc(${((selection.y + selection.height - rect.y) / rect.height) * 100}% + 10px), 100%)`;
  return `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${left} ${top}, ${left} ${bottom}, ${right} ${bottom}, ${right} ${top}, ${left} ${top})`;
}

/** Uses the same target request as the media editor, with canvas growth committed on release. */
export function CanvasComposition({ resizing, onResizeDone }: { resizing: boolean; onResizeDone: () => void }) {
  const t = useTranslations("editors");
  const canvas = useCanvas()!;
  const vault = useVault();
  const createImage = useAddCanvasImage();
  const store = useAtlasStore();
  const snapshot = useRef<ReturnType<typeof captureCanvasComposition> | null>(null);
  const selected = useRef<string | null>(null);
  const shiftHeld = useRef(false);
  const [active, setActive] = useState<string | null>(null);
  const [queued, setQueued] = useState<{ id: string; rect: Rectangle } | null>(null);
  const [preview, setPreview] = useState<Rectangle | null>(null);
  const [pointerDragging, setPointerDragging] = useState(false);
  const transitioning = useStore(store, (state) => state.polygonState.transitioning);
  const dragging = pointerDragging || transitioning || !!preview;
  const images = useVaultSelector((_, v) => getPaintingImages(v, canvas), [canvas]);
  const placeholders = useVaultSelector((_, v) => getEmptyCanvasPlaceholders(v, canvas), [canvas]);
  const { requestAnnotation, cancelRequest, isActive, busy, requestId } = useRequestAnnotation({
    onSuccess: (response) => {
      if (!response.cancelled && response.boundingBox && response.arguments.annotationId === selected.current)
        save(response.boundingBox);
    },
  });
  const current = useRef({ canvas, active, isActive, requestId, resizing, onResizeDone });
  current.current = { canvas, active, isActive, requestId, resizing, onResizeDone };

  function save(rect: Rectangle) {
    if (!validRectangle(rect)) return;
    if (resizing) resizeCanvas(vault, current.current.canvas, rect);
    else if (selected.current) movePaintingImage(vault, current.current.canvas, selected.current, rect);
  }
  const release = useCallback(() => {
    const state = store.getState();
    if (state.tool.enabled) return;
    const helper = state.polygons;
    helper.setShape(null);
    helper.blur();
    helper.unlockAspectRatio();
    helper.tools.unlockToolSwitching();
    helper.tools.setCanDeselect(true);
    helper.tools.setCanDelete(true);
    helper.setBounds({ x: 0, y: 0, width: current.current.canvas.width, height: current.current.canvas.height });
  }, [store]);
  const finish = useCallback(() => {
    store.getState().completeRequest(current.current.requestId || undefined);
    release();
    snapshot.current = null;
    setActive(null);
    setPreview(null);
  }, [store, release]);
  const cancel = useCallback(() => {
    setQueued(null);
    store.getState().cancelRequest(current.current.requestId || undefined);
    release();
    selected.current = null;
    setActive(null);
    setPreview(null);
  }, [store, release]);
  const discard = useCallback(() => {
    const original = snapshot.current;
    cancel();
    if (original) restoreCanvasComposition(vault, current.current.canvas.id, original);
    snapshot.current = null;
    if (current.current.resizing) current.current.onResizeDone();
  }, [cancel, vault]);
  function select(id: string, rect: Rectangle) {
    if (busy) return;
    if (isActive) cancelRequest();
    snapshot.current = captureCanvasComposition(vault, current.current.canvas);
    selected.current = id;
    setQueued({ id, rect });
    setPreview(null);
  }
  async function addImage(slot: CanvasPlaceholder, browser = false) {
    if (isActive) cancel();
    await createImage(slot, browser);
  }

  useEffect(() => {
    if (!queued || busy || isActive || !requestId || !store.getState().validRequestIds.includes(requestId)) return;
    const { id, rect } = queued;
    setQueued(null);
    setActive(id);
    // Composition may extend past any edge; normal annotation requests can clamp to the canvas.
    store.getState().polygons.setBounds(null);
    void requestAnnotation(
      {
        type: "target",
        selector: rect,
        selectByDefault: true,
        arguments: { canvasComposition: true, annotationId: id },
        annotationPopup: (
          <div className="manifest-editor flex gap-2 rounded bg-white p-1 shadow">
            <button
              type="button"
              className="rounded px-3 py-1 text-sm"
              style={{ background: "#b84c74", color: "white" }}
              onClick={finish}
            >
              <EditorMessage namespace="common" message="actions.done" />
            </button>
            <button
              type="button"
              onClick={discard}
              style={{ color: "#892c4e", background: "white", padding: "4px 12px", fontSize: 13 }}
            >
              <EditorMessage message="ui.discardChanges" />
            </button>
          </div>
        ),
      },
      { canvasId: canvas.id, toolId: "pointer" }
    ).then(() => {
      if (selected.current === id) {
        setActive(null);
        setPreview(null);
      }
    });
  }, [
    queued,
    busy,
    isActive,
    requestId,
    requestAnnotation,
    store,
    canvas.id,
    canvas.width,
    canvas.height,
    finish,
    discard,
  ]);
  useCurrentAnnotationTransition({
    requestId,
    onStart: () => {
      const helper = store.getState().polygons;
      if (shiftHeld.current) helper.key.up("Shift");
      if (!shiftHeld.current) helper.lockAspectRatio();
      else helper.unlockAspectRatio();
    },
    onTransition: () => {
      if (!current.current.isActive) return;
      const rect = pointsToRectangle(store.getState().polygons.state.transitionPoints);
      if (rect) setPreview(rect);
    },
    onEnd: (_, response) => {
      if (!current.current.isActive) return;
      const rect = pointsToRectangle(response?.points);
      if (!rect) return;
      const bounds = expandedCanvasBounds(current.current.canvas, [rect]);
      const grows =
        bounds.x ||
        bounds.y ||
        bounds.width !== current.current.canvas.width ||
        bounds.height !== current.current.canvas.height;
      save(rect);
      setPreview(null);
      if (grows) {
        const x = rect.x - bounds.x;
        const y = rect.y - bounds.y;
        const helper = store.getState().polygons;
        helper.setShape({
          id: requestId || undefined,
          open: false,
          points: [
            [x, y],
            [x + rect.width, y],
            [x + rect.width, y + rect.height],
            [x, y + rect.height],
          ],
        });
        helper.selectAllPoints();
      }
    },
  });
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      shiftHeld.current = event.shiftKey;
      if (current.current.resizing && (event.key === "Escape" || event.key === "Enter")) {
        if (event.key === "Escape") discard();
        else current.current.onResizeDone();
        setPreview(null);
        event.preventDefault();
        return;
      }
      if (
        !current.current.isActive ||
        (event.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName))
      )
        return;
      if (event.key === "Escape") {
        discard();
        event.preventDefault();
      }
      if (event.key === "Enter") {
        finish();
        event.preventDefault();
      }
      if (event.key === "Shift") {
        event.stopImmediatePropagation();
        const helper = store.getState().polygons;
        helper.key.up("Shift");
        if (event.type === "keydown") helper.unlockAspectRatio();
        else helper.lockAspectRatio();
      }
    };
    window.addEventListener("keydown", key, true);
    window.addEventListener("keyup", key, true);
    // Capture from the press, before the helper's drag threshold: adjacent portals can otherwise swallow the first move.
    const capture = (event: PointerEvent) => {
      if (!current.current.isActive || event.button !== 0 || !(event.target instanceof HTMLCanvasElement)) return;
      event.target.setPointerCapture(event.pointerId);
      setPointerDragging(true);
    };
    window.addEventListener("pointerdown", capture, true);
    // A release over a sidebar must still finish the gesture that began in the viewer.
    const release = () => {
      setPointerDragging(false);
      const helper = store.getState().polygons;
      if (current.current.isActive && helper.state.slowState.transitioning) helper.pointerUp();
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("keyup", key, true);
      window.removeEventListener("pointerdown", capture, true);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [store, cancel, finish, discard]);
  useEffect(
    () => () => {
      if (current.current.isActive) {
        store.getState().cancelRequest(current.current.requestId || undefined);
        release();
      }
    },
    [store, release]
  );

  useEffect(() => {
    if (resizing) {
      cancel();
      snapshot.current = captureCanvasComposition(vault, current.current.canvas);
    }
  }, [resizing, cancel, vault]);
  useEffect(() => {
    if (busy && resizing) onResizeDone();
  }, [busy, resizing, onResizeDone]);

  const activeImage = images.find((image) => image.id === active);
  const activeRect = activeImage ? getAnnotationRectangle(vault, activeImage, canvas) : null;
  const expansion = preview && (resizing ? preview : expandedCanvasBounds(canvas, [preview]));
  const expanding =
    expansion && (expansion.x || expansion.y || expansion.width !== canvas.width || expansion.height !== canvas.height);
  return (
    <>
      {resizing && !busy && (
        <CanvasResizeEdges
          size={canvas}
          preview={preview}
          onDone={onResizeDone}
          onDiscard={discard}
          onPreview={setPreview}
          onCommit={save}
        />
      )}
      {images.map((image, index) => {
        const rect = getAnnotationRectangle(vault, image, canvas);
        if (busy || resizing || !rect || !(image.target as any)?.selector || active === image.id) return null;
        return (
          <world-object key={image.id} x={rect.x} y={rect.y} width={rect.width} height={rect.height}>
            <box
              target={{ x: 0, y: 0, width: rect.width, height: rect.height }}
              interactive={false}
              relativeStyle
              style={{ backgroundColor: "rgba(0,0,0,0)", ":hover": { outline: "2px solid #b84c74" } }}
            />

            {!dragging && (
              <HTMLPortal target={{ x: 0, y: 0, width: rect.width, height: rect.height }} relative interactive={false}>
                <button
                  type="button"
                  aria-label={t("messages.selectImage", { number: index + 1 })}
                  onClick={() => select(image.id, rect)}
                  style={{
                    display: "block",
                    pointerEvents: "auto",
                    clipPath: selectionHitArea(rect, activeRect),
                    width: "100%",
                    height: "100%",
                    background: "transparent",
                    border: 0,
                    cursor: "move",
                  }}
                />
              </HTMLPortal>
            )}
          </world-object>
        );
      })}
      {!busy &&
        placeholders.map((slot, index) => {
          const rect = layoutSlotToPixels(slot.bounds, canvas);
          return (
            <world-object key={slot.id} x={rect.x} y={rect.y} width={rect.width} height={rect.height}>
              <box
                target={{ x: 0, y: 0, width: rect.width, height: rect.height }}
                relativeStyle
                interactive={false}
                style={{ backgroundColor: "rgba(184,76,116,0.04)", border: "1px dashed #bfa5af" }}
              />
              {!dragging && (
                <HTMLPortal
                  target={{ x: 0, y: 0, width: rect.width, height: rect.height }}
                  relative
                  interactive={false}
                >
                  <div
                    style={{
                      display: "flex",
                      pointerEvents: "auto",
                      clipPath: selectionHitArea(rect, activeRect),
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <button
                      type="button"
                      aria-label={t("messages.addImageAt", { number: index + 1 })}
                      className="rounded-md text-sm font-semibold focus-visible:outline"
                      style={{
                        background: "white",
                        color: "#892c4e",
                        border: "1px solid #bfa5af",
                        height: 32,
                        padding: "0 10px",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => void addImage(slot)}
                    >
                      {t("ui.addImage")}
                    </button>
                    <button
                      type="button"
                      aria-label={t("messages.browseImageAt", { number: index + 1 })}
                      title={t("ui.browseIiif")}
                      onClick={() => void addImage(slot, true)}
                      style={{
                        background: "white",
                        color: "#892c4e",
                        border: "1px solid #bfa5af",
                        borderRadius: 6,
                        padding: 5,
                        height: 32,
                        width: 32,
                        fontSize: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 4,
                      }}
                    >
                      <IIIFBrowserIcon />
                    </button>
                  </div>
                </HTMLPortal>
              )}
            </world-object>
          );
        })}
      {expanding && (
        <world-object x={expansion.x} y={expansion.y} width={expansion.width} height={expansion.height}>
          <box
            target={{ x: 0, y: 0, width: expansion.width, height: expansion.height }}
            relativeStyle
            interactive={false}
            style={{ border: "2px dashed #b84c74", backgroundColor: "rgba(184,76,116,0.06)" }}
          />
          <HTMLPortal target={{ x: 0, y: 0, width: expansion.width, height: 1 }} relative>
            <output
              className="rounded px-3 py-1 text-xs font-semibold"
              style={{ background: "#b84c74", color: "white" }}
            >
              {t(resizing ? "messages.canvasSizePreview" : "messages.canvasExpandPreview", {
                width: Math.round(expansion.width),
                height: Math.round(expansion.height),
              })}
            </output>
          </HTMLPortal>
        </world-object>
      )}
    </>
  );
}
