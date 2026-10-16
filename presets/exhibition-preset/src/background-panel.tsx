import { type BackgroundPanel, useLayoutActions, useLayoutState } from "@manifest-editor/shell";
import { useEffect, useRef, useState } from "react";
import { fitCanvasGridBehavior } from "./helpers";
import { useVault, useManifest } from "react-iiif-vault";
import { exhibitionCenterPanel } from "./center-panels/ExhibitionCenterPanel";
import { exhibitionRemotePreviewPanel } from "./center-panels/ExhibitionRemotePreviewPanel";
import { exhibitionGridLeftPanel } from "./left-panels/ExhibitionGrid";
import { exhibitionOverviewLeftPanel } from "./left-panels/ExhibitionOverview";
import { exhibitionThemeLeftPanel } from "./left-panels/ExhibitionTheme";

const manifestSummaryLeftPanelId = "left-panel-manifest";

function isPrimaryLeftPanel(panelId: string | null) {
  return panelId === manifestSummaryLeftPanelId || panelId === exhibitionGridLeftPanel.id;
}

export const exhibitionBackgroundTask: BackgroundPanel = {
  id: "exhibition-background-task",
  label: "Query string",
  render: () => <ExhibitionBackgroundPanel />,
};

function ExhibitionBackgroundPanel() {
  const manifest = useManifest();
  const vault = useVault();
  const manifestId = manifest?.id;
  useEffect(() => {
    if (!manifestId) return;
    let previous = vault.getState().iiif.entities.Canvas;
    return vault.subscribe(() => {
      const next = vault.getState().iiif.entities.Canvas;
      if (next === previous) return;
      const before = previous;
      previous = next;
      for (const reference of vault.get({ id: manifestId, type: "Manifest" })?.items || []) {
        const canvas = next[reference.id];
        const old = before[reference.id];
        if (
          !canvas ||
          !old ||
          (old.width === canvas.width && old.height === canvas.height) ||
          canvas.behavior?.includes("info")
        )
          continue;
        // Explicit behavior changes (including discard) take precedence over automatic sizing.
        if (JSON.stringify(old.behavior) !== JSON.stringify(canvas.behavior)) continue;
        const behavior = fitCanvasGridBehavior(canvas.behavior || [], canvas.width, canvas.height);
        if (JSON.stringify(behavior) !== JSON.stringify(canvas.behavior))
          vault.modifyEntityField(reference, "behavior", behavior);
      }
    });
  }, [vault, manifestId]);
  const { leftPanel, rightPanel } = useLayoutState();
  const { edit, centerPanel: centerPanelActions, rightPanel: rightPanelActions } = useLayoutActions();
  const [wasRightPanelClosedAutomatically, setWasRightPanelClosedAutomatically] = useState(false);
  const previousLeftPanel = useRef<string | null>(null);
  const previousManifestId = useRef<string | null>(null);

  useEffect(() => {
    const manifestId = manifest?.id || null;
    const leftPanelChanged = previousLeftPanel.current !== leftPanel.current;
    const manifestChanged = previousManifestId.current !== manifestId;
    const previousLeftPanelId = previousLeftPanel.current;

    previousLeftPanel.current = leftPanel.current;
    previousManifestId.current = manifestId;

    if (!manifest || (!leftPanelChanged && !manifestChanged)) {
      return;
    }

    // When left panel is exhibition overview, set the main panel
    if (leftPanel.current === exhibitionOverviewLeftPanel.id) {
      edit(manifest);
      centerPanelActions.open({ id: exhibitionCenterPanel.id });
      setWasRightPanelClosedAutomatically(false);
      return;
    }

    if (leftPanel.current === exhibitionThemeLeftPanel.id) {
      edit(manifest);
      if (rightPanel.open) {
        rightPanelActions.close();
        setWasRightPanelClosedAutomatically(true);
      } else {
        setWasRightPanelClosedAutomatically(false);
      }
      centerPanelActions.open({ id: exhibitionRemotePreviewPanel.id });
      return;
    }

    if (
      !rightPanel.open &&
      rightPanel.current &&
      isPrimaryLeftPanel(leftPanel.current) &&
      (previousLeftPanelId === null ||
        (previousLeftPanelId === exhibitionThemeLeftPanel.id && wasRightPanelClosedAutomatically))
    ) {
      rightPanelActions.open();
      setWasRightPanelClosedAutomatically(false);
    }
  }, [
    centerPanelActions,
    edit,
    leftPanel.current,
    manifest?.id,
    rightPanel.current,
    rightPanel.open,
    rightPanelActions,
    wasRightPanelClosedAutomatically,
  ]);

  return null;
}
