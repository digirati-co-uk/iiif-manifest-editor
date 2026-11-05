import type { BackgroundPanel, LayoutPanel } from "@manifest-editor/shell";
import { useLayoutActions, useLayoutState } from "@manifest-editor/shell";
import { useEffect, useRef } from "react";
import { DiffMain } from "./main";
import { DIFF_MAIN, DIFF_SIDEBAR, DiffIcon, useDiffStore } from "./shared";
import { DiffSidebar } from "./sidebar";

export { DIFF_MAIN, DIFF_SIDEBAR };

function Routing() {
  const { leftPanel, rightPanel } = useLayoutState();
  const { centerPanel, rightPanel: rightPanelActions } = useLayoutActions();
  const store = useDiffStore();
  const active = leftPanel.open && leftPanel.current === DIFF_SIDEBAR;
  const rightOpen = useRef(rightPanel.open);
  rightOpen.current = rightPanel.open;
  const closedRight = useRef(false);
  useEffect(() => {
    if (!active) return;
    centerPanel.open({ id: DIFF_MAIN, stacked: true });
    // Resolve the document's own ID the first time the panel opens. Failure is silent.
    void store.getState().autoload();
    // The diff page has no use for the editing sidebar. Panels open it again themselves only when asked to, so
    // hand it back when leaving rather than leaving the editor without it.
    if (rightOpen.current) {
      rightPanelActions.close();
      closedRight.current = true;
    }
    return () => {
      if (closedRight.current) {
        closedRight.current = false;
        rightPanelActions.open();
      }
    };
  }, [active, centerPanel, rightPanelActions, store]);
  useEffect(() => () => store.getState().cancel(), [store]);
  return null;
}

export const leftPanels: LayoutPanel[] = [
  {
    id: DIFF_SIDEBAR,
    label: "Diff",
    icon: <DiffIcon />,
    focusedMode: { closeOnMainPanelClick: false },
    render: () => <DiffSidebar />,
  },
];
export const centerPanels: LayoutPanel[] = [{ id: DIFF_MAIN, label: "Diff", render: () => <DiffMain /> }];
export const background: BackgroundPanel[] = [
  { id: "@manifest-editor/diff/routing", label: "Diff routing", render: () => <Routing /> },
];
