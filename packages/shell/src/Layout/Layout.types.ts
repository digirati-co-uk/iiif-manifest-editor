import type { Vault } from "@iiif/helpers/vault";
import type { Reference, SpecificResource } from "@iiif/presentation-3";
import type { CreatableResource } from "@manifest-editor/creator-api";
import type { ReactNode } from "react";
import type { RenderingStrategy } from "react-iiif-vault";
import type { TransitionStatus } from "react-transition-group";
import type { AppState } from "../AppContext/AppContext";
import type { EditorConfig } from "../ConfigContext/ConfigContext";
import type { EditableResource } from "../EditingStack/EditingStack.types";

// @todo come back to.
type CreatorDefinition = any;

export interface LayoutProviderProps {
  loading?: true;
  leftPanels: Array<LayoutPanel>;
  rightPanels: Array<LayoutPanel>;
  centerPanels: Array<LayoutPanel>;
  modals?: Array<LayoutPanel>;
  annotations?: Array<AnnotationPanel>;
  background?: Array<BackgroundPanel>;
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
  modal: PanelState;
}

export interface LayoutActions {
  stack(id: string, state?: any): void;
  stack(args: { id: string; state?: any }): void;

  open(id: string, state?: any): void;
  open(args: {
    id: string;
    state?: any;
    stacked?: boolean;
    unique?: boolean;
  }): void;

  change(id: string, state?: any): void;
  change(args: {
    id: string;
    state?: any;
    stacked?: boolean;
    unique?: boolean;
  }): void;

  close(id: string, state?: any): void;
  close(args: { id: string; state?: any }): void;

  toggle(id: string, state?: any): void;
  toggle(args: { id: string; state?: any }): void;

  // Resource
  edit(
    resource: Reference | SpecificResource,
    context?: Omit<EditableResource, "resource">,
    options?: {
      reset?: boolean;
      property?: string;
      stacked?: boolean | undefined;
      selectedTab?: string;
      forceOpen?: boolean;
    },
  ): void;
  create(resource: CreatableResource): void;

  leftPanel: PanelActions;
  centerPanel: PanelActions;
  rightPanel: PanelActions;
  pinnedRightPanel: PinnablePanelActions;
  modal: PanelActions;
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
  change(args: {
    id: string;
    state?: any;
    stacked?: boolean;
    unique?: boolean;
  }): void;
  open(args?: {
    id: string;
    state?: any;
    stacked?: boolean;
    unique?: boolean;
  }): void;
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

export type LayoutFunction = (
  state: any,
  ctx: {
    current: PanelActions;
    vault?: Vault;
    transition?: TransitionStatus;
  } & LayoutContext,
  app: AppState,
) => ReactNode;

export interface AnnotationPanel {
  id: string;
  label: string;
  render: () => React.ReactNode | null;
}

export interface BackgroundPanel {
  id: string;
  label: string;
  render: () => React.ReactNode | null;
}

export interface LayoutPanel {
  id: string;
  label: string;
  divide?: boolean;
  icon?: null | string | ReactNode; // SVG?
  render: LayoutFunction;
  onMount?: (
    state: any,
    ctx: { current: PanelActions; vault?: Vault } & LayoutContext,
    app: AppState,
  ) => (() => void) | void;
  defaultState?: any;
  requiresState?: boolean;
  backAction?: (
    state: any,
    ctx: { current: PanelActions } & LayoutContext,
    app: AppState,
  ) => void;
  renderBackAction?: (options: {
    backAction: (e?: React.MouseEvent) => void;
    fallback: any;
  }) => ReactNode | null;
  renderCloseAction?: (options: {
    closeAction: () => void;
    fallback: any;
  }) => ReactNode | null;
  options?: {
    minWidth?: number;
    maxWidth?: number;
    hideHeader?: boolean;
    pinnable?: boolean;
    openPinned?: boolean;
    tabs?: boolean;
  };
}

export type MenuPositions = "left" | "right" | "bottom" | "top";

export interface PinnedLayoutPanel<T = any> extends LayoutPanel {
  pinned: true;
  state: T;
}

export interface CanvasEditorDefinition {
  id: string;
  label: string;
  supports: {
    strategy: (
      strategy: RenderingStrategy,
      resource: EditableResource,
      vault: Vault,
    ) => boolean;
  };
  component: (strategy: RenderingStrategy) => ReactNode | null;
}

export interface EditorDefinition {
  id: string;
  label: string;
  tabs?: {
    showTitle?: boolean;
    hide?: boolean;
  };
  supports: {
    properties: string[];
    readOnlyProperties?: string[];
    resourceTypes: string[];
    sortKey?: string;
    sortFallback?: boolean;
    read?: boolean;
    edit?: boolean;
    customLocking?: boolean;
    target?: boolean;
    multi?: boolean;
    custom?: (resource: EditableResource, vault: Vault) => boolean;
  };
  component: (config: EditorConfig) => ReactNode; // @todo type component.
}
export interface ResourceDefinition {
  id: string;
  label: string;
  resourceType: string;
  auto: boolean;
  editors: EditorDefinition[];
}

export interface LayoutProps {
  isLoading?: boolean;
  className?: string;
  hideHeader?: boolean;
  isProject?: boolean;
  provider?: React.FC;
  leftPanels: Array<LayoutPanel>;
  rightPanels: Array<LayoutPanel>;
  centerPanels: Array<LayoutPanel>;
  modals?: Array<LayoutPanel>;
  annotations?: Array<AnnotationPanel>;
  background?: Array<BackgroundPanel>;
  footer?: ReactNode;
  menu?: ReactNode;
  header?: ReactNode;
  onClickLogo?: (e: React.MouseEvent) => void;
  // Menus
  leftPanelMenu?: ReactNode;
  centerPanelMenu?: ReactNode;
  rightPanelMenu?: ReactNode;
  leftPanelMenuPosition?: MenuPositions;
  centerPanelMenuPosition?: MenuPositions;
  rightPanelMenuPosition?: MenuPositions;
  // Editors / creators
  editors?: EditorDefinition[];
  resources?: (string | ResourceDefinition)[];
  creators?: CreatorDefinition[];
  // Custom canvas renderer for main
  canvasEditors?: CanvasEditorDefinition[];
}
