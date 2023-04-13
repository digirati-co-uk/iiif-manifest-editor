import { EditingStackActionCreators, EditingStackState } from "@/shell/EditingStack/EditingStack.types";

export function editingStackReducer(state: EditingStackState, action: EditingStackActionCreators): EditingStackState {
  switch (action.type) {
    case "edit": {
      return {
        ...state,
        current: action.payload.resource,
        stack: action.payload.reset ? [] : state.current ? [state.current, ...state.stack] : state.stack,
      };
    }
    case "updateCurrent": {
      return {
        ...state,
        current: action.payload.resource,
      };
    }

    case "back": {
      const newCurrent = state.stack[0];
      return {
        ...state,
        stack: state.stack.slice(1),
        current: newCurrent,
      };
    }

    case "close": {
      return {
        ...state,
        stack: [], // @todo maybe not right?
        current: null,
      };
    }

    case "create": {
      if (action.payload.resource === null) {
        return { ...state, create: null };
      }

      return {
        ...state,
        create: action.payload as any,
      };
    }
  }

  return state;
}
