import type { BackgroundPanel, LayoutPanel, PluginMetadata } from "@manifest-editor/shell";
import { supportsAvCanvases } from "../av-ranges/av-media-utils";
import { TimelinerIcon } from "../icons";
import { SectionPanel } from "../variations-timeliner/SectionPanel";
import { SectionsSidebar } from "../variations-timeliner/SectionsSidebar";
import { TIMELINER_CENTER_ID, TIMELINER_SECTION_PANEL_ID, TIMELINER_SIDEBAR_ID } from "../variations-timeliner/store";
import { TimelinerSync } from "../variations-timeliner/sync";
import { VariationsTimeliner } from "../variations-timeliner/VariationsTimeliner";

export default {
  id: "@manifest-editor/variations-timeliner",
  label: "Variations Timeliner",
  description: "Explore audio and video with nested section bubbles, playback and temporal range editing.",
  author: "Digirati",
  official: true,
  defaultEnabled: false,
  tags: ["audio", "video", "ranges", "timeliner", "variations"],
  supports: { apps: ["manifest-editor"], projectTypes: ["Manifest"] },
} satisfies PluginMetadata;

export const leftPanels: LayoutPanel[] = [
  {
    id: TIMELINER_SIDEBAR_ID,
    label: "Variations Timeliner",
    icon: <TimelinerIcon />,
    options: { minWidth: 300, maxWidth: 400 },
    // Only offered when the manifest has an audio or video canvas with a duration, like A/V Ranges.
    supports: supportsAvCanvases,
    render: () => <SectionsSidebar />,
  },
];

export const centerPanels: LayoutPanel[] = [
  {
    id: TIMELINER_CENTER_ID,
    label: "Variations Timeliner",
    icon: <TimelinerIcon />,
    supports: supportsAvCanvases,
    render: () => <VariationsTimeliner />,
  },
];

export const rightPanels: LayoutPanel[] = [
  {
    id: TIMELINER_SECTION_PANEL_ID,
    label: "Section",
    icon: <TimelinerIcon />,
    options: { minWidth: 380 },
    render: (state) => <SectionPanel id={state?.id} />,
  },
];

export const background: BackgroundPanel[] = [
  {
    id: "variations-timeliner-sync",
    label: "Variations Timeliner sync",
    render: () => <TimelinerSync />,
  },
];
