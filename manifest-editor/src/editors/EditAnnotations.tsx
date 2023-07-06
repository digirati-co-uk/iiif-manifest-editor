import React from "react";
import { useLayoutState } from "@/shell";

export function EditAnnotations() {
  const { rightPanel } = useLayoutState();

  // if (rightPanel.current !== "canvas-properties" || rightPanel.state.current !== 5) {
  //   return (
  //     <ErrorBoundary>
  //       <div>Hello i will be some annotations</div>
  //     </ErrorBoundary>
  //   );
  // }
  return (
    <world-object x={0} y={0} width={200} height={200}>
      <box
        interactive
        style={{ background: "rgba(50, 0, 200, 0.4)" }}
        target={{ x: 0, y: 0, width: 200, height: 200 }}
      />
    </world-object>
  );
}
