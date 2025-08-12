import { useInStack } from "@manifest-editor/editors";
import { BackgroundPanel, EditableResource, useConfig, useEvent, useLayoutActions } from "@manifest-editor/shell";
import { useEffect, useRef } from "react";
import { useEditCanvasItems } from "./components";

export const queryStringTask: BackgroundPanel = {
  id: "manifest-query-string",
  label: "Query string",
  render: () => <QueryStringBackgroundTask />,
};

function QueryStringBackgroundTask() {
  const canvas = useInStack("Canvas");
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
    // Set the query string.
    const currentQueryString = new URLSearchParams(window.location.search);
    const newQueryString = new URLSearchParams(currentQueryString);
    if (canvas?.resource?.source?.id) {
      newQueryString.set("canvas", canvas?.resource?.source?.id || "");
    } else {
      newQueryString.delete("canvas");
    }
    window.history.replaceState(null, "", `?${newQueryString.toString()}`);
  }, [canvas?.resource?.source?.id]);

  return null;
}
