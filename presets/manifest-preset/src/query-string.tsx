import {
  type BackgroundPanel,
  useAvailableLayouts,
  useConfig,
  useLayoutActions,
  useLayoutState,
} from "@manifest-editor/shell";
import { useEffect, useRef, useState } from "react";
import { useManifest } from "react-iiif-vault";
import { manifestOverview } from "./center-panels/manifest-overview";
import { rangeWorkbench } from "./center-panels/range-workbench";
import { useEditCanvasItems } from "./components";
import { canvasListing } from "./left-panels/canvas-listing";
import { manifestPanel } from "./left-panels/manifest";
import { rangesPanel } from "./left-panels/range-listing";
import { useManifestItemInStack } from "./manifest-items";

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

function setManifestItemIdQueryString(value: string | null | undefined) {
  setQueryString("item", value);
}

function setLeftPanelIdQueryString(value: string | null | undefined) {
  setQueryString("leftPanel", value);
}

function QueryStringBackgroundTask() {
  // oxlint-disable react/exhaustive-deps -- These background effects intentionally track scalar panel/resource IDs.
  const manifest = useManifest();
  const selectedItem = useManifestItemInStack();
  const { leftPanel, rightPanel } = useLayoutState();
  const {
    edit,
    leftPanel: leftPanelActions,
    rightPanel: rightPanelActions,
  } = useLayoutActions();
  const { centerPanels, leftPanels } = useAvailableLayouts();
  const { canvasActions, open } = useEditCanvasItems();
  const {
    editorFeatureFlags: {
      rememberCanvasId = true,
      rememberLeftPanelId = false,
    } = {},
  } = useConfig();
  const lastItem = useRef<string | null>(null);
  const lastLeftPanel = useRef<string | null>(null);
  const isLeftPanelOpen = leftPanel.open;
  const [wasLeftPanelOpenedAutomatically, setWasLeftPanelOpenedAutomatically] =
    useState(false);

  useEffect(() => {
    if (isLeftPanelOpen) {
      setWasLeftPanelOpenedAutomatically(false);
    }
  }, [isLeftPanelOpen]);

  // Open the item listing on initial render when an item ID is present.
  useEffect(() => {
    // `canvas` remains supported for existing links; new non-Canvas items use `item`.
    const initialQueryString = new URLSearchParams(window.location.search);
    const itemId = initialQueryString.get("item") || initialQueryString.get("canvas");
    lastItem.current = itemId;

    if (itemId) {
      const item = manifest?.items?.find((candidate) => candidate.id === itemId) || {
        id: itemId,
        type: "Canvas",
      };
      open({ id: canvasListing.id });
      open({ id: "current-canvas" });
      canvasActions.edit(item);
    }

    const leftPanelId = initialQueryString.get("leftPanel");
    lastLeftPanel.current = leftPanelId;
    if (leftPanelId && leftPanels.some((panel) => panel.id === leftPanelId)) {
      leftPanelActions.open({ id: leftPanelId });
    }
  }, []);

  useEffect(() => {
    if (rememberLeftPanelId) {
      setLeftPanelIdQueryString(leftPanel.current);
    }
  }, [leftPanel.current]);

  // Keep the selected manifest item in the query string.
  useEffect(() => {
    const item = selectedItem?.resource?.source;
    if (item?.id) {
      lastItem.current = item.id;
    }
    if (!rememberCanvasId) {
      return;
    }
    setCanvasIdQueryString(item?.type === "Canvas" ? item.id : null);
    setManifestItemIdQueryString(item?.type !== "Canvas" ? item?.id : null);
  }, [selectedItem?.resource?.source?.id, selectedItem?.resource?.source?.type]);

  // Changing based on panels.
  useEffect(() => {
    // When the Manifest panel is opened, edit the Manifest.
    if (leftPanel.current === manifestPanel.id) {
      setCanvasIdQueryString(null);
      setManifestItemIdQueryString(null);
      if (manifest) {
        edit(manifest, undefined, {
          forceOpen: true,
          selectedTab: "@manifest-editor/descriptive-properties",
        });
      }
      if (centerPanels.some((panel) => panel.id === manifestOverview.id)) {
        open({ id: manifestOverview.id });
      }
    }

    if (leftPanel.current === rangesPanel.id) {
      open({ id: rangeWorkbench.id });
    }

    // When the item listing opens, edit the last selected item or the first item.
    if (leftPanel.current === canvasListing.id) {
      const firstItemId = lastItem.current || manifest?.items?.[0]?.id;
      const firstItem = manifest?.items?.find((item) => item.id === firstItemId);
      if (firstItem) {
        open({ id: "current-canvas" });
        canvasActions.edit(firstItem);
      }
    }

    if (leftPanel.current === rangesPanel.id) {
      // Open first range?
      const firstStructure = manifest?.structures?.[0]?.id;
      if (firstStructure && manifest?.structures?.length === 1) {
        edit({ id: firstStructure, type: "Range" });
      }
    }

    // Close the right panel
    const shouldCloseRightPanel = leftPanel.current === rangesPanel.id;

    if (shouldCloseRightPanel && rightPanel.open) {
      rightPanelActions.close();
      setWasLeftPanelOpenedAutomatically(true);
    }

    const shouldOpenRightPanel = leftPanel.current !== rangesPanel.id;

    if (
      !rightPanel.open &&
      shouldOpenRightPanel &&
      wasLeftPanelOpenedAutomatically
    ) {
      rightPanelActions.open();
      setWasLeftPanelOpenedAutomatically(false);
    }
  }, [leftPanel.current]);

  return null;
}
