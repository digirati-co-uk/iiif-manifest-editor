import { createContext, useContext, useMemo } from "react";
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

export function useLayoutProvider(): LayoutProviderProps & {
  loading?: true;
  actions: LayoutActions;
  state: LayoutState;
} {
  const available = useContext(LayoutPropsReactContext);
  const actions = useContext(LayoutActionsReactContext);
  const state = useContext(LayoutStateReactContext);

  return useMemo(() => {
    return { actions, state, ...available };

    // The actions have a fully stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, state]);
}
