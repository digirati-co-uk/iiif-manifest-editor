import { createContext, memo, ReactNode, useContext, useMemo, useReducer, useState } from "react";
import { LayoutContext, LayoutProviderProps, PinnablePanelActions } from "./Layout.types";
import { getDefaultLayoutState, layoutReducer } from "./Layout.reducer";
import { usePanelActions } from "./Layout.hooks";
import invariant from "tiny-invariant";

const LayoutReactContext = createContext<LayoutContext | null>(null);

export function useLayoutProvider() {
  const context = useContext(LayoutReactContext);

  invariant(context, "Cannot set layouts outside of <LayoutProvider />");

  return context;
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

  // Fully stable identity.
  const actions: LayoutContext["actions"] = {
    setAvailable,
    centerPanel: usePanelActions("centerPanel", dispatch),
    leftPanel: usePanelActions("leftPanel", dispatch),
    rightPanel: usePanelActions("rightPanel", dispatch),
    pinnedRightPanel: usePanelActions("pinnedRightPanel", dispatch) as PinnablePanelActions,
  };

  const context: LayoutContext = useMemo(() => {
    return { actions, state, ...available };

    // The actions have a fully stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, state]);

  return <LayoutReactContext.Provider value={context}>{props.children}</LayoutReactContext.Provider>;
});
