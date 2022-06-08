import { PinnablePanelState } from "./Layout.types";

export function isPinnableState(t: unknown): t is PinnablePanelState {
  return t && (t as any).pinnable;
}

export function panelSizing({
  initial,

  fallback,
  options = {},
}: {
  initial?: number;
  fallback: number;
  options?: { minWidth?: number; maxWidth?: number };
}) {
  // panel min width
  // panel max width
  // default width
  // fallback width
  return Math.max(options.minWidth || 0, Math.min(options.maxWidth || Infinity, initial || fallback));
}
