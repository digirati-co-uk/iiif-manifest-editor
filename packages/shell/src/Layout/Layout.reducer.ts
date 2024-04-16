import { produce, Draft, original } from "immer";
import { LayoutState, PanelActionType, PanelState, PinnablePanelState } from "./Layout.types";
import { isPinnableState } from "./Layout.helpers";

function pushStack<T>(
  state: Draft<PinnablePanelState | PanelState>,
  action: T extends { payload: { stacked?: boolean; unique?: boolean } } ? T : never
) {
  if (action.payload && action.payload.stacked) {
    if (state.current) {
      const latest = state.stack[state.stack.length - 1];
      if (latest && latest.id === state.current) {
        return;
      }

      if (action.payload.unique) {
        state.stack = state.stack.filter((i) => i.id !== state.current);
      }

      state.stack.push({
        id: state.current,
        state: state.state ? { ...original(state.state) } : {},
      });
    }
  } else {
    state.stack = [];
  }
}

function panelReducer(state: Draft<PinnablePanelState | PanelState>, action: PanelActionType) {
  switch (action.type) {
    case "popStack": {
      if (state.stack.length) {
        const latest = state.stack[state.stack.length - 1];
        if (latest) {
          state.current = latest.id;
          state.state = latest.state;
        }
        state.stack = state.stack.slice(0, -1);
      }
      break;
    }

    case "change": {
      if (action.payload.id !== state.current) {
        pushStack(state, action);
      }
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
        if (action.payload.id !== state.current) {
          pushStack<any>(state, action);
        }
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
    stack: [],
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
