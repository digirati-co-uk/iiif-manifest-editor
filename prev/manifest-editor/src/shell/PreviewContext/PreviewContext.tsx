import { createContext, memo, ReactNode, useContext, useMemo, useReducer } from "react";
import { PreviewConfiguration, PreviewContext, PreviewHandler } from "./PreviewContext.types";
import invariant from "tiny-invariant";
import { usePreviewActions, usePreviewHandlers } from "./PreviewContext.hooks";
import { getDefaultPreviewState, previewContextReducer } from "./PreviewContext.reducer";

const PreviewReactContext = createContext<PreviewContext | null>(null);

export const PreviewProvider = memo(function PreviewProvider({
  children,
  configs = [],
}: {
  children: ReactNode;
  configs: PreviewConfiguration[];
}) {
  const handlers = usePreviewHandlers(configs);
  const [state, dispatch] = useReducer(previewContextReducer, undefined, getDefaultPreviewState);
  const actions = usePreviewActions(state, dispatch, handlers);
  const context: PreviewContext = useMemo(
    () => ({ configs, actions, handlers, ...state }),
    [actions, configs, handlers, state]
  );

  return <PreviewReactContext.Provider value={context}>{children}</PreviewReactContext.Provider>;
});

export function usePreviewContext() {
  const ctx = useContext(PreviewReactContext);

  invariant(ctx, "usePreviewContext() can only be called from inside <PreviewProvider />");

  return ctx;
}
