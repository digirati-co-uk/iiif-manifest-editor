import { EditingStackActionCreators, EditingStackState } from "./EditingStack.types";
import { toRef } from "@iiif/parser";

export function editingStackReducer(state: EditingStackState, action: EditingStackActionCreators): EditingStackState {
  switch (action.type) {
    case "edit": {
      if (state.current?.resource.source.id === action.payload.resource?.resource.source.id) {
        return {
          ...state,
          current: action.payload.resource,
        };
      }

      return {
        ...state,
        current: action.payload.resource,
        stack: action.payload.reset ? [] : state.current ? [state.current, ...state.stack] : state.stack,
      };
    }
    case "syncRemoval": {
      const item = toRef(action.payload.resource.resource);
      if (!item) {
        return state;
      }
      const found = state.stack.find((r) => toRef(r.resource)?.id === item.id);

      if (!found) {
        return state;
      }

      const newCurrent = state.current?.resource.id === item.id ? null : state.current;
      const newStack = filterStack(
        state.stack.filter((r) => toRef(r.resource)?.id !== item.id),
        newCurrent
      );

      return {
        ...state,
        stack: newStack,
        current: newCurrent,
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
        current: newCurrent || null,
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

function filterStack(
  newStackWithDuplicates: EditingStackState["stack"],
  current: EditingStackState["current"]
): EditingStackState["stack"] {
  const newStack = [];
  let prev = null;
  for (const stackItem of newStackWithDuplicates) {
    if (prev?.resource.id === stackItem.resource.id) {
      continue;
    }
    newStack.push(stackItem);
    prev = stackItem;
  }

  if (prev && prev.resource.id === current?.resource.id) {
    return newStack.slice(0, newStack.length - 1);
  }

  return newStack;
}
