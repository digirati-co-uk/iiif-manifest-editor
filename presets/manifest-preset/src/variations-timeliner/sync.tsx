import { useLayoutActions, useLayoutState } from "@manifest-editor/shell";
import { useEffect } from "react";
import { TIMELINER_CENTER_ID, TIMELINER_SECTION_PANEL_ID, TIMELINER_SIDEBAR_ID, useTimelinerStore } from "./store";

/**
 * Keeps the three panels working together: opening the sections sidebar shows the timeline in the
 * centre, and choosing a section opens its editor in the right panel.
 */
export function TimelinerSync() {
  const { leftPanel, centerPanel, rightPanel } = useLayoutState();
  const { open, rightPanel: rightPanelActions } = useLayoutActions();
  const selected = useTimelinerStore((s) => s.selected);
  const active = leftPanel.current === TIMELINER_SIDEBAR_ID;
  const sectionId = selected.length === 1 ? selected[0]! : null;

  useEffect(() => {
    if (active && centerPanel.current !== TIMELINER_CENTER_ID) {
      open({ id: TIMELINER_CENTER_ID });
    }
    // Only when the sidebar becomes active; the user may then switch the centre panel freely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!active) return;
    if (sectionId) {
      open({ id: TIMELINER_SECTION_PANEL_ID, state: { id: sectionId } });
    } else if (rightPanel.current === TIMELINER_SECTION_PANEL_ID) {
      rightPanelActions.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, sectionId]);

  return null;
}
