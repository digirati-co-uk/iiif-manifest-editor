import { useAtlasStore } from "@manifest-editor/shell";
import { useMemo } from "react";
import { useStore } from "zustand";

export function useSvgTools() {
  const store = useAtlasStore();
  const switchTool = useStore(store, (s) => s.switchTool);
  const state = useStore(store, (s) => s.polygons.state.slowState);

  return useMemo(
    () => ({
      // Draw tool.
      draw: {
        active: !state.lineMode && !state.selectedStamp && state.drawMode,
        enable: switchTool.draw,
      },

      // Polygon.
      polygon: {
        active: !state.lineMode && !state.selectedStamp && !state.drawMode,
        enable: switchTool.polygon,
      },

      // Line
      line: {
        active: state.lineMode && !state.lineBoxMode,
        enable: switchTool.line,
      },

      // Line box.
      lineBox: {
        active: state.lineBoxMode,
        enable: switchTool.lineBox,
      },

      // Square.
      square: {
        active: state.selectedStamp?.id === "square",
        enable: switchTool.square,
      },

      // Triangle.
      triangle: {
        active: state.selectedStamp?.id === "triangle",
        enable: switchTool.triangle,
      },

      // Hexagon.
      hexagon: {
        active: state.selectedStamp?.id === "hexagon",
        enable: switchTool.hexagon,
      },

      // Circle
      circle: {
        active: state.selectedStamp?.id === "circle",
        enable: switchTool.circle,
      },

      // Delete
      remove: {
        active: state.showBoundingBox,
        enable: switchTool.remove,
      },
    }),
    [state, switchTool],
  );
}
