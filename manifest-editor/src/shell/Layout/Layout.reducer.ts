import produce, { Draft } from "immer";
import { LayoutState, PanelActionType, PanelState, PinnablePanelState } from "./Layout.types";
import { isPinnableState } from "./Layout.helpers";

function panelReducer(state: Draft<PinnablePanelState | PanelState>, action: PanelActionType) {
  switch (action.type) {
    case "change": {
      state.state = action.payload.state;
      state.current = action.payload.id;
      break;
    }
    case "close": {
      state.open = false;
      break;
    }
    case "open": {
      state.open = true;
      if (action.payload) {
        state.state = action.payload.state;
        state.current = action.payload.id;
      }
      break;
    }
    case "toggle": {
      state.open = !state.open;
      break;
    }
    case "maximise": {
      state.minimised = false;
      if (action.payload) {
        state.state = action.payload.state;
        state.current = action.payload.id;
      }
      break;
    }
    case "minimise": {
      state.minimised = true;
      break;
    }
    case "setCustomWidth": {
      state.customWidth = action.payload;
      break;
    }
    case "resetSize": {
      state.customWidth = undefined;
    }
  }

  if (isPinnableState(state)) {
    switch (action.type) {
      case "pin": {
        state.pinned = true;
        state.state = action.payload.state;
        state.current = action.payload.id;
        break;
      }
      case "unpin": {
        state.pinned = false;
        state.state = undefined;
        break;
      }
    }
  }
}

export const layoutReducer = produce<LayoutState, [PanelActionType]>((state, action: PanelActionType) => {
  switch (action.panel) {
    case "centerPanel": {
      panelReducer(state.centerPanel, action);
      break;
    }
    case "leftPanel": {
      panelReducer(state.leftPanel, action);
      break;
    }
    case "rightPanel": {
      panelReducer(state.rightPanel, action);
      break;
    }
    case "pinnedRightPanel": {
      panelReducer(state.pinnedRightPanel, action);
      break;
    }
  }
});

export function getDefaultPanelState(): PanelState {
  return {
    customWidth: undefined,
    minimised: false,
    open: true,
    current: null,
    state: null,
  };
}

export function getDefaultLayoutState(): LayoutState {
  return {
    leftPanel: getDefaultPanelState(),
    centerPanel: getDefaultPanelState(),
    rightPanel: getDefaultPanelState(),
    pinnedRightPanel: {
      ...getDefaultPanelState(),
      pinnable: true,
      pinned: false,
    },
  };
}
