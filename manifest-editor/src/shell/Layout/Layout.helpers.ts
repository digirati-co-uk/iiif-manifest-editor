import { PinnablePanelState } from "./Layout.types";
import { createElement, ReactNode } from "react";

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

export function renderHelper(htmlOrReact: string | ReactNode): ReactNode {
  if (typeof htmlOrReact === "string") {
    return createElement("div", { dangerouslySetInnerHTML: { __html: htmlOrReact } });
  }
  return htmlOrReact;
}
