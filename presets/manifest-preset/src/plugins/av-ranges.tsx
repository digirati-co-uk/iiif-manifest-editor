import type {
  BackgroundPanel,
  LayoutPanel,
  PluginMetadata,
} from "@manifest-editor/shell";
import { useLayoutActions, useLayoutState } from "@manifest-editor/shell";
import { useEffect, useState } from "react";
import { avRangesPanel } from "../av-ranges/av-ranges-panel";
import { avRangesWorkbench } from "../av-ranges/av-ranges-workbench";
import { avTemporalRangeCreator } from "../av-ranges/av-temporal-range-creator";
import { getAvCanvases } from "../av-ranges/av-media-utils";

export default {
  id: "@manifest-editor/av-ranges",
  label: "A/V Ranges",
  description: "Create and edit temporal ranges for audio and video canvases.",
  author: "Digirati",
  official: true,
  defaultEnabled: true,
  tags: ["audio", "video", "ranges", "chaptering"],
  supports: {
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;

function supportsAvRanges(ctx: any) {
  if (!ctx.rootResource || ctx.rootResource.type !== "Manifest" || !ctx.vault) {
    return false;
  }

  const manifest = ctx.vault.get(ctx.rootResource, { skipSelfReturn: false });
  return getAvCanvases(ctx.vault, manifest).length > 0;
}

export const leftPanels: LayoutPanel[] = [
  {
    ...avRangesPanel,
    supports: supportsAvRanges,
  } as LayoutPanel,
];

export const centerPanels: LayoutPanel[] = [
  {
    ...avRangesWorkbench,
    supports: supportsAvRanges,
  } as LayoutPanel,
];

export const creators = [avTemporalRangeCreator];

export const background: BackgroundPanel[] = [
  {
    id: "av-ranges-plugin-sync",
    label: "A/V ranges plugin sync",
    render: () => <AvRangesPluginSync />,
  },
];

function AvRangesPluginSync() {
  const { leftPanel, rightPanel } = useLayoutState();
  const { open, rightPanel: rightPanelActions } = useLayoutActions();
  const [
    wasRightPanelClosedAutomatically,
    setWasRightPanelClosedAutomatically,
  ] = useState(false);

  useEffect(() => {
    if (leftPanel.current === avRangesPanel.id) {
      open({ id: avRangesWorkbench.id });

      if (rightPanel.open) {
        rightPanelActions.close();
        setWasRightPanelClosedAutomatically(true);
      }

      return;
    }

    if (!rightPanel.open && wasRightPanelClosedAutomatically) {
      rightPanelActions.open();
      setWasRightPanelClosedAutomatically(false);
    }
  }, [
    leftPanel.current,
    rightPanel.open,
    wasRightPanelClosedAutomatically,
    open,
    rightPanelActions,
  ]);

  return null;
}
