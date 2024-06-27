import { createContext, useContext, useMemo } from "react";
import { LayoutActions, LayoutProviderProps, LayoutState } from "./Layout.types";
import { useApp } from "../AppContext/AppContext";

export const LayoutActionsReactContext = createContext<LayoutActions>(null as any);
export const LayoutStateReactContext = createContext<LayoutState>(null as any);

export function useLayoutState() {
  return useContext(LayoutStateReactContext);
}

export function useLayoutActions() {
  return useContext(LayoutActionsReactContext);
}

export function useAvailableLayouts() {
  const app = useApp();
  return app.layout;
}

export function useLayoutProvider(): LayoutProviderProps & {
  loading?: true;
  actions: LayoutActions;
  state: LayoutState;
} {
  const app = useApp();
  const layout = app.layout;
  const actions = useContext(LayoutActionsReactContext);
  const state = useContext(LayoutStateReactContext);

  return useMemo(() => {
    return { actions, state, ...layout };

    // The actions have a fully stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app, state]);
}
