import { ReactNode } from "react";
import { AppState } from "../AppContext/AppContext";
import { Vault } from "@iiif/vault";
import { TransitionStatus } from "react-transition-group";

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

  stack(id: string, state?: any): void;
  stack(args: { id: string; state?: any }): void;

  open(id: string, state?: any): void;
  open(args: { id: string; state?: any; stacked?: boolean }): void;

  change(id: string, state?: any): void;
  change(args: { id: string; state?: any; stacked?: boolean }): void;

  close(id: string, state?: any): void;
  close(args: { id: string; state?: any }): void;

  toggle(id: string, state?: any): void;
  toggle(args: { id: string; state?: any }): void;

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
  stack: Array<{ id: string; state: any }>;
}

export interface PanelActions {
  change(args: { id: string; state?: any; stacked?: boolean }): void;
  open(args?: { id: string; state?: any; stacked?: boolean }): void;
  close(): void;
  toggle(): void;
  minimise(): void;
  maximise(args?: { id: string; state?: any }): void;
  setCustomWidth(size: number): void;
  resetSize(): void;
  popStack(): void;
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

export type LayoutPanelContext = {
  global: { currentCanvasId: string | null };
  current: { actions: PanelActions; state: any };
  actions: LayoutActions;
  state: LayoutState;
};

export interface LayoutPanel {
  id: string;
  label: string;
  icon?: null | string | ReactNode; // SVG?

  render: (
    state: any,
    ctx: { current: PanelActions; vault?: Vault; transition?: TransitionStatus } & LayoutContext,
    app: AppState
  ) => ReactNode;
  onMount?: (
    state: any,
    ctx: { current: PanelActions; vault?: Vault } & LayoutContext,
    app: AppState
  ) => (() => void) | void;
  defaultState?: any;
  requiresState?: boolean;
  backAction?: (state: any, ctx: { current: PanelActions } & LayoutContext, app: AppState) => void;
  options?: {
    minWidth?: number;
    maxWidth?: number;
    hideHeader?: boolean;
    pinnable?: boolean;
    tabs?: boolean;
  };
}

export type MenuPositions = "left" | "right" | "bottom" | "top";

export interface PinnedLayoutPanel<T = any> extends LayoutPanel {
  pinned: true;
  state: T;
}

export interface LayoutProps {
  className?: string;
  provider?: React.FC;
  leftPanels: Array<LayoutPanel>;
  rightPanels: Array<LayoutPanel>;
  centerPanels: Array<LayoutPanel>;
  footer?: ReactNode;
  menu?: ReactNode;
  header?: ReactNode;
  // Menus
  leftPanelMenu?: ReactNode;
  centerPanelMenu?: ReactNode;
  rightPanelMenu?: ReactNode;
  leftPanelMenuPosition?: MenuPositions;
  centerPanelMenuPosition?: MenuPositions;
  rightPanelMenuPosition?: MenuPositions;
}
