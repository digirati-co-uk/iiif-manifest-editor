import type { LayoutPanel } from "@manifest-editor/shell";
import { OPENROUTER_PANEL_ID } from "./constants";
import { OpenRouterPanel } from "./components";

export const openRouterLeftPanel: LayoutPanel = {
  id: OPENROUTER_PANEL_ID,
  label: "AI assistant",
  icon: "AI",
  render: () => <OpenRouterPanel />,
};
