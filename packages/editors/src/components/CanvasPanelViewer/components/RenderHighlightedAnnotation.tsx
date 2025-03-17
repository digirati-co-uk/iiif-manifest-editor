import { HTMLPortal } from "@atlas-viewer/atlas";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
import { AtlasStoreReactContext, useAtlasStore } from "@manifest-editor/shell";
import { createPortal } from "react-dom";

export function RenderHighlightAnnotation({
  annotation,
  target,
  children,
}: {
  annotation: { id: string };
  target: { x: number; y: number; width: number; height: number };
  children: React.ReactNode;
}) {
  const store = useAtlasStore();
  const { refs, floatingStyles } = useFloating({
    nodeId: annotation.id,
    placement: "bottom",
    // strategy: "fixed",
    middleware: [offset(10), shift(), flip({ mainAxis: true })],
    whileElementsMounted: autoUpdate,
  });

  return (
    <HTMLPortal relative target={target} interactive={false}>
      <div
        ref={refs.setReference}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      />
      {createPortal(
        <AtlasStoreReactContext.Provider value={store}>
          <div ref={refs.setFloating} style={floatingStyles}>
            {children}
          </div>
        </AtlasStoreReactContext.Provider>,
        document.getElementById("floating-ui") as HTMLElement,
      )}
    </HTMLPortal>
  );
}
