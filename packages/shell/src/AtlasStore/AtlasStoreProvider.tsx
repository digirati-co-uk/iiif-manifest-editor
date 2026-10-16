import { useContext, useLayoutEffect } from "react";
import { type AtlasStore, AtlasStoreProvider, AtlasStoreReactContext } from "react-iiif-vault";
import type { StoreApi } from "zustand";

export { AtlasStoreProvider, AtlasStoreReactContext };

export function useAtlasStore() {
  return useContext(AtlasStoreReactContext) as StoreApi<AtlasStore>;
}

/** polygon-editor's setShape leaves gesture previews behind when a request changes. */
export function AnnotationRequestCleanup() {
  const store = useAtlasStore();
  useLayoutEffect(
    () =>
      store.subscribe((state, previous) => {
        if (state.tool.requestId === previous.tool.requestId) return;
        const helper = state.polygons;
        Object.assign(helper.state, {
          transitionPoints: null,
          transitionBoundingBox: null,
          transitionOrigin: null,
          transitionDirection: null,
          transitionBezierLine: null,
          transitionDraw: [],
          transitionRotate: false,
          selectionBox: null,
          line: null,
          lineBox: null,
        });
        helper.setState({ transitioning: false, transitionIntentType: null, actionIntentType: null });
        helper.blur();
        if (!state.tool.requestId) helper.setShape(null);
        if (state.requests[state.tool.requestId || ""]?.type !== "target") helper.unlockAspectRatio();
      }),
    [store]
  );
  return null;
}
