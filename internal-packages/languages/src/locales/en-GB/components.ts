/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  empty: {
    manifest: "This manifest has no canvases",
    selection: "No items selected",
  },
  controls: {
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetView: "Reset view",
    toggleFullscreen: "Toggle fullscreen",
    resizeList: "Resize list",
  },
  errors: {
    title: "Something went wrong",
    retry: "Try again",
  },
  selection: {
    selectItem: "Select {{itemName}}",
  },
} as const;
