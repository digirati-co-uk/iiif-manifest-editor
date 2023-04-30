import { createContext, useContext } from "react";
import { LayoutActions, LayoutProviderProps, LayoutState } from "./Layout.types";
export const LayoutPropsReactContext = createContext<LayoutProviderProps & { loading?: true }>(null as any);
export const LayoutActionsReactContext = createContext<LayoutActions>(null as any);
export const LayoutStateReactContext = createContext<LayoutState>(null as any);

export function useLayoutState() {
  return useContext(LayoutStateReactContext);
}

export function useLayoutActions() {
  return useContext(LayoutActionsReactContext);
}

export function useAvailableLayouts() {
  return useContext(LayoutPropsReactContext);
}
