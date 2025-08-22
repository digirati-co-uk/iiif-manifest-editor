import { createContext, memo, ReactNode, useContext, useEffect, useMemo, useReducer } from "react";
import { Preview, PreviewConfiguration, PreviewContext } from "./PreviewContext.types";
import invariant from "tiny-invariant";
import { usePreviewActions, usePreviewHandlers } from "./PreviewContext.hooks";
import { getDefaultPreviewState, previewContextReducer } from "./PreviewContext.reducer";
import { useAppResourceInstance } from "../AppResourceProvider/AppResourceProvider";
import { useLocalStorage } from "../hooks/use-local-storage";

const PreviewReactContext = createContext<PreviewContext | null>(null);
const AvailablePreviewReactContext = createContext<Preview[]>([] as Preview[]);

export const PreviewProvider = memo(function PreviewProvider({
  children,
  configs = [],
}: {
  previews: Preview[];
  children: ReactNode;
  configs: PreviewConfiguration[];
}) {
  const instanceId = useAppResourceInstance();
  const handlers = usePreviewHandlers(configs);
  const [previews, setPreviews] = useLocalStorage<Preview[]>(`preview-${instanceId}`, []);

  const [state, dispatch] = useReducer(previewContextReducer, undefined, getDefaultPreviewState);
  const actions = usePreviewActions(state, dispatch, handlers, previews, setPreviews);
  const context: PreviewContext = useMemo(
    () => ({ configs, actions, handlers, ...state }),
    [actions, configs, handlers, state]
  );

  useEffect(() => {
    for (const preview of previews) {
      if (!state.active.includes(preview.id)) {
        const handler = handlers.find((h) => h.id === preview.id);
        if (handler) {
          Promise.resolve(handler.isPreviewValid(instanceId, preview)).then((valid) => {
            if (valid) {
              dispatch({ type: "activatePreview", payload: preview.id });
            } else {
              setPreviews((prev) => prev.filter((p) => p.id !== preview.id));
            }
          });
        }
      }
    }
  }, [instanceId]);

  return (
    <AvailablePreviewReactContext.Provider value={previews}>
      <PreviewReactContext.Provider value={context}>{children}</PreviewReactContext.Provider>
    </AvailablePreviewReactContext.Provider>
  );
});

export function usePreviews() {
  return useContext(AvailablePreviewReactContext);
}

export function usePreviewContext() {
  const ctx = useContext(PreviewReactContext);

  invariant(ctx, "usePreviewContext() can only be called from inside <PreviewProvider />");

  return ctx;
}
