import { Dispatch, useMemo } from "react";
import { PreviewActionsType, PreviewHandler } from "./PreviewContext.types";

export function usePreviewActions(dispatch: Dispatch<PreviewActionsType>, handlers: PreviewHandler[]) {
  function selectPreview(id: string) {
    dispatch({ type: "selectPreview", payload: id });
  }
  function deletePreview(id: string) {
    dispatch({ type: "deletePreview", payload: id });
  }
  function focusPreview(id: string) {
    dispatch({ type: "focusPreview", payload: id });
  }

  return useMemo(
    () => ({ selectPreview, deletePreview, focusPreview }),
    // Dispatch has a stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}
