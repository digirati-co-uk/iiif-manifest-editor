import { createContext, memo, ReactNode, useContext, useMemo, useReducer, useState } from "react";
import { LayoutContext, LayoutProps, LayoutProviderProps, PinnablePanelActions } from "./Layout.types";
import { getDefaultLayoutState, layoutReducer } from "./Layout.reducer";
import { usePanelActions } from "./Layout.hooks";
import invariant from "tiny-invariant";
import { useConfig } from "../ConfigContext/ConfigContext";

const LayoutPropsReactContext = createContext<LayoutProviderProps & { loading?: true }>(null as any);
const LayoutActionsReactContext = createContext<LayoutContext["actions"]>(null as any);
const LayoutStateReactContext = createContext<LayoutContext["state"]>(null as any);

export function useLayoutProvider() {
  const available = useContext(LayoutPropsReactContext);
  const actions = useContext(LayoutActionsReactContext);
  const state = useContext(LayoutStateReactContext);

  return useMemo(() => {
    return { actions, state, ...available };

    // The actions have a fully stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, state]);
}

export function useLayoutState() {
  return useContext(LayoutStateReactContext);
}

export function useLayoutActions() {
  return useContext(LayoutActionsReactContext);
}

export function useAvailableLayouts() {
  return useContext(LayoutPropsReactContext);
}

function parse(args: string | { id: string; state?: any; stacked?: boolean }, _state?: any) {
  if (typeof args === "string") {
    return { id: args, state: _state };
  }
  return args;
}

// There should only ever be one of these, this is for holding the state at the top.
export const LayoutProvider = memo(function LayoutProvider(props: { children: ReactNode }) {
  const [available, setAvailable] = useState<LayoutProviderProps & { loading?: true }>({
    loading: true,
    centerPanels: [],
    leftPanels: [],
    rightPanels: [],
  });
  const [state, dispatch] = useReducer(layoutReducer, undefined, getDefaultLayoutState);
  const actions = {
    setAvailable,
    centerPanel: usePanelActions("centerPanel", dispatch),
    leftPanel: usePanelActions("leftPanel", dispatch),
    rightPanel: usePanelActions("rightPanel", dispatch),
    pinnedRightPanel: usePanelActions("pinnedRightPanel", dispatch) as PinnablePanelActions,
  };

  function find(id: any) {
    const right = available.rightPanels.find((r) => r.id === id);
    if (right) {
      return [right, actions.rightPanel] as const;
    }

    const center = available.centerPanels.find((r) => r.id === id);
    if (center) {
      return [center, actions.centerPanel] as const;
    }

    const left = available.leftPanels.find((r) => r.id === id);
    if (left) {
      return [left, actions.leftPanel] as const;
    }

    invariant(false, `Was not able to find panel with id "${id}"`);
  }

  function open(args: string | { id: string; state?: any; stacked?: boolean }, _state?: any): void {
    const { id, state, stacked } = parse(args, _state);
    const [found, actions] = find(id);
    actions.open({
      id,
      state: { ...(found.defaultState || {}), ...(state || {}) },
      stacked,
    });
  }

  function stack(args: string | { id: string; state?: any }, _state?: any): void {
    const { id, state } = parse(args, _state);
    const [found, actions] = find(id);
    actions.open({
      id,
      state: { ...(found.defaultState || {}), ...(state || {}) },
      stacked: true,
    });
  }

  function change(args: string | { id: string; state?: any; stacked?: boolean }, _state?: any): void {
    const { id, state, stacked } = parse(args, _state);
    const [found, actions] = find(id);
    actions.change({
      id,
      state: { ...(found.defaultState || {}), ...(state || {}) },
      stacked,
    });
  }

  function close(args: string | { id: string; state?: any }, _state?: any): void {
    const { id } = parse(args, _state);
    const [, actions] = find(id);
    actions.close();
  }

  function toggle(args: string | { id: string; state?: any }, _state?: any): void {
    const { id } = parse(args, _state);
    const [, actions] = find(id);
    actions.toggle();
  }

  const otherActions = {
    open,
    change,
    close,
    toggle,
    stack,
  };

  return (
    <LayoutPropsReactContext.Provider value={available}>
      <LayoutActionsReactContext.Provider value={useMemo(() => ({ ...actions, ...otherActions }), [available])}>
        <LayoutStateReactContext.Provider value={state}>{props.children}</LayoutStateReactContext.Provider>
      </LayoutActionsReactContext.Provider>
    </LayoutPropsReactContext.Provider>
  );
});
