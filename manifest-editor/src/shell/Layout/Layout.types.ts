import { ReactElement } from "react";

export interface LayoutProviderProps {
  loading?: true;
  leftPanels: Array<LayoutPanel>;
  rightPanels: Array<LayoutPanel>;
  centerPanels: Array<LayoutPanel>;
}

export interface LayoutContext extends LayoutProviderProps {
  state: LayoutState;
  actions: LayoutActions;
}

export interface LayoutState {
  leftPanel: PanelState;
  centerPanel: PanelState;
  rightPanel: PanelState;
  pinnedRightPanel: PinnablePanelState;
}

export interface LayoutActions {
  setAvailable(panels: LayoutProviderProps): void;
  leftPanel: PanelActions;
  centerPanel: PanelActions;
  rightPanel: PanelActions;
  pinnedRightPanel: PinnablePanelActions;
}

export interface PanelState {
  current: string | null;
  state: any;
  open: boolean;
  minimised: boolean;
  customWidth?: number;
}

export interface PanelActions {
  change(args: { id: string; state?: any }): void;
  open(args?: { id: string; state?: any }): void;
  close(): void;
  toggle(): void;
  minimise(): void;
  maximise(args?: { id: string; state?: any }): void;
  setCustomWidth(size: number): void;
  resetSize(): void;
}

// Ugly type, but saves duplicating the above into:
// { type: 'change', payload: string } |
// { type: 'close', payload: undefined } | ...
export type PanelActionType = {
  [T in keyof PinnablePanelActions]: {
    type: T;
    panel: keyof LayoutState;
    payload: Parameters<PinnablePanelActions[T]>[0];
  };
}[keyof PinnablePanelActions];

export interface PinnablePanelState extends PanelState {
  pinnable: true;
  pinned: boolean;
}

export interface PinnablePanelActions extends PanelActions {
  pin(args: { id: string; state?: any }): void;
  unpin(): void;
}

export interface LayoutPanel {
  id: string;
  label: string;
  icon: null | string | ReactElement; // SVG?
  render: (state?: any) => ReactElement;
  pinnable?: boolean;
  hideHeader?: boolean;
}

export type MenuPositions = "left" | "right" | "bottom" | "top";

export interface PinnedLayoutPanel<T = any> extends LayoutPanel {
  pinned: true;
  state: T;
}

export interface LayoutProps {
  className?: string;
  leftPanels: Array<LayoutPanel>;
  rightPanels: Array<LayoutPanel>;
  centerPanels: Array<LayoutPanel>;
  footer?: ReactElement;
  menu?: ReactElement;
  header?: ReactElement;
  // Menus
  leftPanelMenu?: ReactElement;
  centerPanelMenu?: ReactElement;
  rightPanelMenu?: ReactElement;
  leftPanelMenuPosition?: MenuPositions;
  centerPanelMenuPosition?: MenuPositions;
  rightPanelMenuPosition?: MenuPositions;
}
