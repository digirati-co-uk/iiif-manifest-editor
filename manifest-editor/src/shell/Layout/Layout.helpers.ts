import { PinnablePanelState } from "./Layout.types";

export function isPinnableState(t: unknown): t is PinnablePanelState {
  return t && (t as any).pinnable;
}
