import produce, { Draft } from "immer";
import { PreviewActionsType, PreviewContext, PreviewState } from "./PreviewContext.types";

export const previewContextReducer = produce(function reducer(state: Draft<PreviewState>, action: PreviewActionsType) {
  switch (action.type) {
    case "focusPreview": {
      break;
    }

    case "deletePreview": {
      if (state.selected === action.payload) {
        state.selected = null;
      }
      state.active = state.active.filter((p) => p !== action.payload);
      break;
    }

    case "activatePreview": {
      if (state.active.indexOf(action.payload) === -1) {
        state.active.push(action.payload);
      }
      break;
    }

    case "selectPreview": {
      state.selected = action.payload;
      if (state.active.indexOf(action.payload) === -1) {
        state.active.push(action.payload);
      }
      break;
    }
  }
});

export function getDefaultPreviewState(): PreviewState {
  return {
    active: [],
    selected: null,
  };
}
