import { useReducer } from "react";
import { IS_EXTERNAL } from "@iiif/parser";
import { useEditingResource, useEditingResourceStack } from "@manifest-editor/shell";

export function isExternal(resource: any) {
  return !!(resource && resource[IS_EXTERNAL]);
}

export function useToggleList() {
  const [state, dispatch] = useReducer((prev: any, action: string) => {
    return { ...prev, [action]: !prev[action] };
  }, {});

  return [state, dispatch];
}

export function useInStack(type: string) {
  const stack = useEditingResourceStack();
  const current = useEditingResource();

  return current?.resource.source.type === type ? current : stack.find((t) => t.resource.source.type === type);
}

export function randomId() {
  return `${Math.random().toString(36).substr(2)}-${Date.now().toString(36)}`;
}
