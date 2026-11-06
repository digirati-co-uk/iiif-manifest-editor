import type { Vault } from "@iiif/helpers/vault";
import { EditorHTMLPortal as HTMLPortal } from "../../EditorI18nBridge";
import { EditorMessage } from "../../EditorMessage";
import { useEditorsTranslations as useTranslations } from "../../../editor-i18n-context";
import { IIIFBrowserIcon } from "@manifest-editor/components";

import { CanvasResizeEdges } from "./CanvasResizeEdges";
import {
  CanvasCompositionDraft,
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
import { useCallback, useEffect, useRef, useState, useReducer } from "react";
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
export function CanvasComposition({
  resizing,
  onResizeDone,
  sourceVault,
  onDraftVault,
}: {
  resizing: boolean;
  onResizeDone: () => void;
  sourceVault: Vault;
  onDraftVault: (vault: Vault | null) => void;
}) {
  const t = useTranslations("editors");
  const liveCanvas = useCanvas()!;
  const draft = useRef<CanvasCompositionDraft | null>(null);
  const [, redraw] = useReducer((value: number) => value + 1, 0);
  const canvas = draft.current?.canvas || liveCanvas;
  const [conflict, setConflict] = useState(false);
  const vault = sourceVault;
  const createImage = useAddCanvasImage(sourceVault);
  const store = useAtlasStore();
  const selected = useRef<string | null>(null);
  const shiftHeld = useRef(false);
  const [active, setActive] = useState<string | null>(null);
  const [queued, setQueued] = useState<{ id: string; rect: Rectangle } | null>(null);
  const [preview, setPreview] = useState<Rectangle | null>(null);
  const [pointerDragging, setPointerDragging] = useState(false);
  const transitioning = useStore(store, (state) => state.polygonState.transitioning);
  const dragging = pointerDragging || transitioning || !!preview;
  const liveImages = useVaultSelector((_, v) => getPaintingImages(v, liveCanvas), [liveCanvas]);
  const livePlaceholders = useVaultSelector((_, v) => getEmptyCanvasPlaceholders(v, liveCanvas), [liveCanvas]);
  const images = draft.current ? getPaintingImages(draft.current.vault, canvas) : liveImages;
  const placeholders = draft.current ? getEmptyCanvasPlaceholders(draft.current.vault, canvas) : livePlaceholders;
  const { requestAnnotation, cancelRequest, isActive, busy, requestId } = useRequestAnnotation({
    onSuccess: (response) => {
      if (!response.cancelled && response.boundingBox && response.arguments.annotationId === selected.current)
        save(response.boundingBox);
    },
  });
  const current = useRef({ canvas, active, isActive, requestId, resizing, onResizeDone });
  current.current = { canvas, active, isActive, requestId, resizing, onResizeDone };

  function save(rect: Rectangle) {
    if (!validRectangle(rect) || !draft.current) return;
    if (resizing) resizeCanvas(draft.current.vault, draft.current.canvas, rect);
    else if (selected.current) movePaintingImage(draft.current.vault, draft.current.canvas, selected.current, rect);
    redraw();
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
    if (draft.current && !draft.current.apply().ok) {
      setConflict(true);
      return;
    }
    draft.current = null;
    onDraftVault(null);
    setConflict(false);
    redraw();
    store.getState().completeRequest(current.current.requestId || undefined);
    release();

    setActive(null);
    setPreview(null);
  }, [store, release, onDraftVault]);
  const cancel = useCallback(() => {
    setQueued(null);
    store.getState().cancelRequest(current.current.requestId || undefined);
    release();
    selected.current = null;
    setActive(null);
    setPreview(null);
  }, [store, release]);
  const discard = useCallback(() => {
    cancel();
    draft.current?.discard();
    draft.current = null;
    onDraftVault(null);
    setConflict(false);
    redraw();

    if (current.current.resizing) current.current.onResizeDone();
  }, [cancel, onDraftVault]);
  function select(id: string, rect: Rectangle) {
    if (busy) return;
    if (isActive) cancelRequest();
    if (draft.current && !draft.current.apply().ok) {
      setConflict(true);
      return;
    }
    draft.current = new CanvasCompositionDraft(vault, current.current.canvas.id);
    onDraftVault(draft.current.vault);
    setConflict(false);
    redraw();
    selected.current = id;
    setQueued({ id, rect });
    setPreview(null);
  }
  async function addImage(slot: CanvasPlaceholder, browser = false) {
    if (draft.current && !draft.current.apply().ok) {
      setConflict(true);
      return;
    }
    draft.current = null;
    onDraftVault(null);
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
      const isEditing = (target: EventTarget | null) =>
        target instanceof HTMLElement &&
        (target.isContentEditable || !!target.closest('input, textarea, select, button, a[href], [role="textbox"]'));
      if (event.defaultPrevented || event.isComposing || isEditing(event.target) || isEditing(document.activeElement)) return;
      shiftHeld.current = event.shiftKey;
      if (event.type === "keyup" && event.key !== "Shift") return;
      if (draft.current && (event.key === "Escape" || event.key === "Enter")) {
        if (event.key === "Escape") discard();
        else {
          finish();
          if (!draft.current && current.current.resizing) current.current.onResizeDone();
        }
        setPreview(null);
        event.preventDefault();
        event.stopImmediatePropagation();
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
      draft.current?.discard();
      draft.current = null;
      onDraftVault(null);
      if (current.current.isActive) {
        store.getState().cancelRequest(current.current.requestId || undefined);
        release();
      }
    },
    [store, release, onDraftVault]
  );

  useEffect(
    () =>
      vault.getStore().onReset((phase) => {
        if (phase === "before") discard();
      }),
    [vault, discard]
  );

  useEffect(() => {
    if (resizing) {
      cancel();
      draft.current?.discard();
      draft.current = new CanvasCompositionDraft(vault, current.current.canvas.id);
      onDraftVault(draft.current.vault);
      setConflict(false);
      redraw();
    }
  }, [resizing, cancel, vault, onDraftVault]);
  useEffect(() => {
    if (busy && resizing) onResizeDone();
  }, [busy, resizing, onResizeDone]);

  const activeImage = images.find((image) => image.id === active);
  const activeRect = activeImage ? getAnnotationRectangle(draft.current?.vault || vault, activeImage, canvas) : null;
  const expansion = preview && (resizing ? preview : expandedCanvasBounds(canvas, [preview]));
  const expanding =
    expansion && (expansion.x || expansion.y || expansion.width !== canvas.width || expansion.height !== canvas.height);
  return (
    <>
      {conflict && (
        <HTMLPortal>
          <div role="alert" className="rounded bg-white p-2">
            <EditorMessage namespace="shell" message="history.conflict" />
          </div>
        </HTMLPortal>
      )}
      {resizing && !busy && (
        <CanvasResizeEdges
          size={canvas}
          preview={preview}
          onDone={() => {
            finish();
            if (!draft.current) onResizeDone();
          }}
          onDiscard={discard}
          onPreview={setPreview}
          onCommit={save}
        />
      )}
      {images.map((image, index) => {
        const rect = getAnnotationRectangle(draft.current?.vault || vault, image, canvas);
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
