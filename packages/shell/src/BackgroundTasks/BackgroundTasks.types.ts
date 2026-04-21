import type { Reference } from "@iiif/presentation-3";
import type { Vault } from "@iiif/helpers/vault";
import type { ReactNode } from "react";
import type { Resource } from "../AppResourceProvider/AppResourceProvider";
import type { Config } from "../ConfigContext/ConfigContext";
import type { LayoutActions, LayoutState } from "../Layout/Layout.types";
import type { ManifestEditorTagsApi } from "../Tags";

export type BackgroundActionStatus = "idle" | "preparing" | "running" | "complete" | "error";

export interface BackgroundActionTarget extends Reference {
  label: string;
  scope: "root" | "canvas";
}

export interface BackgroundActionError {
  message: string;
  stack?: string;
  detail?: unknown;
}

export interface BackgroundActionInstance {
  id: string;
  actionId: string;
  target: BackgroundActionTarget;
  label: string;
  status: BackgroundActionStatus;
  statusText?: string;
  error?: BackgroundActionError | null;
  result?: unknown;
  resultsAvailable: boolean;
  startedAt?: number;
  completedAt?: number;
}

export interface BackgroundActionSystemContext {
  rootResource: Resource;
  currentCanvas?: BackgroundActionTarget;
  vault: Vault;
  tags: ManifestEditorTagsApi;
  config: Config;
  layoutState: LayoutState;
  layoutActions: LayoutActions;
}

export interface BackgroundActionContext extends BackgroundActionSystemContext {
  definition: BackgroundActionDefinition;
  target: BackgroundActionTarget;
  instanceKey: string;
  instance?: BackgroundActionInstance;
}

export interface BackgroundActionLifecycle {
  setActionLabel(label: string): void;
  setActionStatus(status: BackgroundActionStatus, statusText?: string): void;
  setActionError(error: unknown, statusText?: string): void;
  setResult(result: unknown): void;
  setResultsAvailable(available: boolean): void;
}

export interface BackgroundActionRunContext extends BackgroundActionContext, BackgroundActionLifecycle {
  signal: AbortSignal;
}

export interface BackgroundActionRenderContext extends BackgroundActionSystemContext {
  definition: BackgroundActionDefinition;
}

export interface BackgroundActionDefinition {
  id: string;
  label: string;
  summary?: string;
  section?: string;
  order?: number;
  resourceTypes?: string[];
  supports?: (ctx: BackgroundActionContext) => boolean;
  prepare?: (ctx: BackgroundActionRunContext) => boolean | void | Promise<boolean | void>;
  run: (ctx: BackgroundActionRunContext) => unknown | Promise<unknown>;
  render?: (ctx: BackgroundActionRenderContext) => ReactNode | null;
  onResults?: (ctx: BackgroundActionContext) => unknown | Promise<unknown>;
}

export interface AvailableBackgroundAction {
  definition: BackgroundActionDefinition;
  target: BackgroundActionTarget;
  instanceKey: string;
  instance?: BackgroundActionInstance;
  context: BackgroundActionContext;
}

export interface BackgroundActionGroup {
  id: string;
  label: string;
  target: BackgroundActionTarget;
  actions: AvailableBackgroundAction[];
}
