import { LayoutState, PanelActions, PanelActionType, PinnablePanelActions } from "./Layout.types";
import { Dispatch, useMemo } from "react";

export function usePanelActions(
  panel: keyof LayoutState,
  dispatch: Dispatch<PanelActionType>
): PanelActions | PinnablePanelActions {
  function change(payload: { id: string; state?: any }) {
    dispatch({ type: "change", panel, payload });
  }
  function open(payload?: { id: string; state?: any }) {
    dispatch({ type: "open", panel, payload });
  }
  function close() {
    dispatch({ type: "close", panel, payload: undefined });
  }
  function toggle() {
    dispatch({ type: "toggle", panel, payload: undefined });
  }
  function minimise() {
    dispatch({ type: "minimise", panel, payload: undefined });
  }
  function maximise(payload?: { id: string; state?: any }) {
    dispatch({ type: "maximise", panel, payload });
  }
  function setCustomWidth(payload: number) {
    dispatch({ type: "setCustomWidth", panel, payload });
  }
  function resetSize() {
    dispatch({ type: "resetSize", panel, payload: undefined });
  }
  function pin(payload: { id: string; state?: any }) {
    dispatch({ type: "pin", panel, payload });
  }
  function unpin() {
    dispatch({ type: "unpin", panel, payload: undefined });
  }

  return useMemo(
    () => ({
      change,
      open,
      close,
      toggle,
      minimise,
      maximise,
      setCustomWidth,
      resetSize,
      pin,
      unpin,
    }),
    // Dispatch is stable here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}
