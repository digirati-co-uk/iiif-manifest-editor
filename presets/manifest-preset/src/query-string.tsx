import { useInStack } from "@manifest-editor/editors";
import { BackgroundPanel, EditableResource, useConfig, useEvent, useLayoutActions, useLayoutState } from "@manifest-editor/shell";
import { useEffect, useRef } from "react";
import { useEditCanvasItems } from "./components";

export const queryStringTask: BackgroundPanel = {
  id: "manifest-query-string",
  label: "Query string",
  render: () => <QueryStringBackgroundTask />,
};

function setCanvasIdQueryString(canvasId: string | null | undefined) {
  const currentQueryString = new URLSearchParams(window.location.search);
  const newQueryString = new URLSearchParams(currentQueryString);
  if (canvasId) {
    newQueryString.set("canvas", canvasId);
  } else {
    newQueryString.delete("canvas");
  }
  window.history.replaceState(null, "", `?${newQueryString.toString()}`);
}

function QueryStringBackgroundTask() {
  const canvas = useInStack("Canvas");
  const { leftPanel } = useLayoutState();
  const { canvasActions, open } = useEditCanvasItems();
  const { editorFeatureFlags: { rememberCanvasId = true } = {} } = useConfig();

  useEffect(() => {
    // Initialize the query string with the current canvas ID.
    const initialQueryString = new URLSearchParams(window.location.search);
    const canvasId = initialQueryString.get("canvas");

    if (canvasId) {
      open({ id: "canvas-listing" });
      open({ id: "current-canvas" });
      canvasActions.edit({ id: canvasId, type: "Canvas" });
    }
  }, []);

  useEffect(() => {
    if (!rememberCanvasId) {
      return;
    }
    setCanvasIdQueryString(canvas?.resource?.source?.id);
  }, [canvas?.resource?.source?.id]);

  // Changing based on panels.
  useEffect(() => {
    if (leftPanel.current === 'left-panel-manifest') {
      setCanvasIdQueryString(null);
    }
  }, [leftPanel.current]);

  return null;
}
