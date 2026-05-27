import {
  type BackgroundPanel,
  useLayoutActions,
  useLayoutState,
} from "@manifest-editor/shell";
import { useEffect } from "react";
import { useManifest } from "react-iiif-vault";
import { exhibitionCenterPanel } from "./center-panels/ExhibitionCenterPanel";
import { exhibitionRemotePreviewPanel } from "./center-panels/ExhibitionRemotePreviewPanel";
import { exhibitionGridLeftPanel } from "./left-panels/ExhibitionGrid";
import { exhibitionOverviewLeftPanel } from "./left-panels/ExhibitionOverview";
import { exhibitionThemeLeftPanel } from "./left-panels/ExhibitionTheme";

const manifestSummaryLeftPanelId = "left-panel-manifest";

export const exhibitionBackgroundTask: BackgroundPanel = {
  id: "exhibition-background-task",
  label: "Query string",
  render: () => <ExhibitionBackgroundPanel />,
};

function ExhibitionBackgroundPanel() {
  const manifest = useManifest();
  const { leftPanel, rightPanel } = useLayoutState();
  const {
    edit,
    centerPanel: centerPanelActions,
    rightPanel: rightPanelActions,
  } = useLayoutActions();

  useEffect(() => {
    // When left panel is exhibition overview, set the main panel
    if (manifest && leftPanel.current === exhibitionOverviewLeftPanel.id) {
      edit(manifest);
      centerPanelActions.open({ id: exhibitionCenterPanel.id });
    }

    if (manifest && leftPanel.current === exhibitionThemeLeftPanel.id) {
      edit(manifest);
      rightPanelActions.close();
      centerPanelActions.open({ id: exhibitionRemotePreviewPanel.id });
    }

    if (
      manifest &&
      !rightPanel.open &&
      rightPanel.current &&
      (leftPanel.current === manifestSummaryLeftPanelId ||
        leftPanel.current === exhibitionGridLeftPanel.id)
    ) {
      rightPanelActions.open();
    }
  }, [
    centerPanelActions,
    edit,
    leftPanel.current,
    manifest,
    rightPanel.current,
    rightPanel.open,
    rightPanelActions,
  ]);

  return null;
}
