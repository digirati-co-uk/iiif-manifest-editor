import { useInStack } from "@manifest-editor/editors";
import { useEditCanvasItems } from "@manifest-editor/manifest-preset/components";
import { type BackgroundPanel, useConfig, useLayoutActions, useLayoutState } from "@manifest-editor/shell";
import { useEffect, useRef, useState } from "react";
import { useManifest } from "react-iiif-vault";
import { exhibitionCenterPanel } from "./center-panels/ExhibitionCenterPanel";
import { exhibitionOverviewLeftPanel } from "./left-panels/ExhibitionOverview";

export const exhibitionBackgroundTask: BackgroundPanel = {
  id: "exhibition-background-task",
  label: "Query string",
  render: () => <ExhibitionBackgroundPanel />,
};

function ExhibitionBackgroundPanel() {
  console.log("rendering?");
  const manifest = useManifest();
  const canvas = useInStack("Canvas");
  const { leftPanel, rightPanel } = useLayoutState();
  const {
    edit,
    leftPanel: leftPanelActions,
    rightPanel: rightPanelActions,
    centerPanel: centerPanelActions,
  } = useLayoutActions();
  const { canvasActions, open } = useEditCanvasItems();
  const { editorFeatureFlags: { rememberCanvasId = true, rememberLeftPanelId = false } = {} } = useConfig();
  const isLeftPanelOpen = leftPanel.open;

  useEffect(() => {
    // When left panel is exhibition overview, set the main panel
    if (manifest && leftPanel.current === exhibitionOverviewLeftPanel.id) {
      edit(manifest);
      centerPanelActions.open({ id: exhibitionCenterPanel.id });
      leftPanelActions.close();
    }
  }, [leftPanel.current]);

  return null;
}
