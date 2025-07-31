import { useMemo } from "react";
import { useAtlasStore } from "react-iiif-vault";
import { useStore } from "zustand";

export function useSvgTools() {
  const store = useAtlasStore();
  const switchTool = useStore(store, (s) => s.switchTool);
  const currentTool = useStore(store, (s) => s.polygonState.currentTool);
  const selectedStamp = useStore(store, (s) => s.polygonState.selectedStamp);
  const showBoundingBox = useStore(store, (s) => s.polygonState.showBoundingBox);

  return useMemo(
    () => ({
      currentTool,
      selectedStamp,
      // Draw tool.
      draw: {
        active: currentTool === "pencil",
        enable: switchTool.draw,
      },

      // Polygon.
      polygon: {
        active: currentTool === "pen",
        enable: switchTool.pen,
      },

      // Line
      line: {
        active: currentTool === "line",
        enable: switchTool.line,
      },

      // Line box.
      lineBox: {
        active: currentTool === "lineBox",
        enable: switchTool.lineBox,
      },

      // Square.
      square: {
        active: currentTool === "box",
        enable: switchTool.box,
      },

      // Triangle.
      triangle: {
        active: selectedStamp?.id === "triangle",
        enable: switchTool.triangle,
      },

      // Hexagon.
      hexagon: {
        active: selectedStamp?.id === "hexagon",
        enable: switchTool.hexagon,
      },

      // Circle
      circle: {
        active: selectedStamp?.id === "circle",
        enable: switchTool.circle,
      },

      // Delete
      remove: {
        active: showBoundingBox,
        enable: switchTool.remove,
      },
    }),
    [showBoundingBox, selectedStamp, currentTool, switchTool],
  );
}
