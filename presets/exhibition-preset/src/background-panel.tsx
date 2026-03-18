import { type BackgroundPanel, useLayoutActions, useLayoutState } from "@manifest-editor/shell";
import { useEffect } from "react";
import { useManifest } from "react-iiif-vault";
import { exhibitionCenterPanel } from "./center-panels/ExhibitionCenterPanel";
import { exhibitionOverviewLeftPanel } from "./left-panels/ExhibitionOverview";

export const exhibitionBackgroundTask: BackgroundPanel = {
  id: "exhibition-background-task",
  label: "Query string",
  render: () => <ExhibitionBackgroundPanel />,
};

function ExhibitionBackgroundPanel() {
  const manifest = useManifest();
  const { leftPanel } = useLayoutState();
  const { edit, leftPanel: leftPanelActions, centerPanel: centerPanelActions } = useLayoutActions();

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
