import { useInStack } from "@manifest-editor/editors";
import { type BackgroundPanel, useConfig, useLayoutActions, useLayoutState } from "@manifest-editor/shell";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useManifest } from "react-iiif-vault";
import { manifestOverview } from "./center-panels/manifest-overview";
import { rangeWorkbench } from "./center-panels/range-workbench";
import { useEditCanvasItems } from "./components";
import { annotationsPanel } from "./left-panels/annotations";
import { canvasListing } from "./left-panels/canvas-listing";
import { manifestPanel } from "./left-panels/manifest";
import { rangesPanel } from "./left-panels/range-listing";

export const queryStringTask: BackgroundPanel = {
  id: "manifest-query-string",
  label: "Query string",
  render: () => <QueryStringBackgroundTask />,
};

function setQueryString(key: string, value: string | null | undefined) {
  const currentQueryString = new URLSearchParams(window.location.search);
  const newQueryString = new URLSearchParams(currentQueryString);
  if (value) {
    newQueryString.set(key, value);
  } else {
    newQueryString.delete(key);
  }
  window.history.replaceState(null, "", `?${newQueryString.toString()}`);
}

function setCanvasIdQueryString(value: string | null | undefined) {
  setQueryString("canvas", value);
}

function setLeftPanelIdQueryString(value: string | null | undefined) {
  setQueryString("leftPanel", value);
}

function QueryStringBackgroundTask() {
  const manifest = useManifest();
  const canvas = useInStack("Canvas");
  const { leftPanel, rightPanel } = useLayoutState();
  const { edit, leftPanel: leftPanelActions, rightPanel: rightPanelActions } = useLayoutActions();
  const { canvasActions, open } = useEditCanvasItems();
  const { editorFeatureFlags: { rememberCanvasId = true, rememberLeftPanelId = false } = {} } = useConfig();
  const lastCanvas = useRef<string | null>(null);
  const lastLeftPanel = useRef<string | null>(null);
  const isLeftPanelOpen = leftPanel.open;
  const [wasLeftPanelOpenedAutomatically, setWasLeftPanelOpenedAutomatically] = useState(false);

  useEffect(() => {
    if (isLeftPanelOpen) {
      setWasLeftPanelOpenedAutomatically(false);
    }
  }, [isLeftPanelOpen]);

  // This rule opens up the canvas listing on the initial render if there is
  // a canvas ID in the query string.
  useEffect(() => {
    // Initialize the query string with the current canvas ID.
    const initialQueryString = new URLSearchParams(window.location.search);
    const canvasId = initialQueryString.get("canvas");
    lastCanvas.current = canvasId;

    if (canvasId) {
      open({ id: canvasListing.id });
      open({ id: "current-canvas" });
      canvasActions.edit({ id: canvasId, type: "Canvas" });
    }

    const leftPanelId = initialQueryString.get("leftPanel");
    lastLeftPanel.current = leftPanelId;
    if (leftPanelId) {
      leftPanelActions.open({ id: leftPanelId });
    }
  }, []);

  useEffect(() => {
    if (rememberLeftPanelId) {
      setLeftPanelIdQueryString(leftPanel.current);
    }
  }, [leftPanel.current]);

  // This rule will set the query string when the canvas changes.
  useEffect(() => {
    const canvasId = canvas?.resource?.source?.id;
    if (canvasId) {
      lastCanvas.current = canvasId;
    }
    if (!rememberCanvasId) {
      return;
    }
    setCanvasIdQueryString(canvasId);
  }, [canvas?.resource?.source?.id]);

  // Changing based on panels.
  useEffect(() => {
    // When the Manifest panel is opened, edit the Manifest.
    if (leftPanel.current === manifestPanel.id) {
      setCanvasIdQueryString(null);
      manifest && edit(manifest);
      open({ id: manifestOverview.id });
    }

    if (leftPanel.current === rangesPanel.id) {
      open({ id: rangeWorkbench.id });
    }

    // When the canvas listing OR annotations is opened, then
    // Edit the first canvas (or last).
    if (leftPanel.current === canvasListing.id || leftPanel.current === annotationsPanel.id) {
      const firstCanvas = lastCanvas.current || manifest?.items?.[0]?.id;
      if (firstCanvas) {
        open({ id: "current-canvas" });
        canvasActions.edit({ id: firstCanvas, type: "Canvas" });
      }
    }

    // Close the right panel
    const shouldCloseRightPanel =
      // Annotations panel
      leftPanel.current === annotationsPanel.id ||
      // Ranges panel.
      leftPanel.current === rangesPanel.id;

    if (shouldCloseRightPanel && rightPanel.open) {
      flushSync(() => {
        rightPanelActions.close();
      });
      setWasLeftPanelOpenedAutomatically(true);
    }

    const shouldOpenRightPanel = leftPanel.current !== annotationsPanel.id && leftPanel.current !== rangesPanel.id;

    if (!rightPanel.open && shouldOpenRightPanel && wasLeftPanelOpenedAutomatically) {
      rightPanelActions.open();
      setWasLeftPanelOpenedAutomatically(false);
    }
  }, [leftPanel.current]);

  return null;
}
