import type { LayoutPanel, LayoutPanelSupportContext } from "./Layout.types";

export function filterSupportedPanels(
  panels: LayoutPanel[],
  ctx: LayoutPanelSupportContext,
  onSupportsError?: (panel: LayoutPanel, error: unknown) => void,
) {
  return panels.filter((panel) => {
    if (!panel.supports) {
      return true;
    }

    try {
      return panel.supports(ctx);
    } catch (error) {
      onSupportsError?.(panel, error);
      return false;
    }
  });
}

export function getSupportedPanelFallback(
  panels: LayoutPanel[],
  currentId: string | null,
) {
  if (!currentId) {
    return null;
  }
  if (panels.some((panel) => panel.id === currentId)) {
    return currentId;
  }
  return panels[0]?.id || null;
}

export function panelIds(panels: LayoutPanel[]) {
  return panels.map((panel) => panel.id).join(",");
}
