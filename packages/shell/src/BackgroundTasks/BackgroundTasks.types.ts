import type { EditorI18n, MessageReference } from "@manifest-editor/i18n/core";
import type { Reference } from "@iiif/presentation-3";
import type { Vault } from "@iiif/helpers/vault";
import type { ReactNode } from "react";
import type { Resource } from "../AppResourceProvider/AppResourceProvider";
import type { Config } from "../ConfigContext/ConfigContext";
import type { LayoutActions, LayoutState } from "../Layout/Layout.types";
import type { ManifestEditorCanvasProgressApi } from "../CanvasProgress";
import type { PluginRuntimeApi } from "../PluginContext/PluginContext.types";
import type { ManifestEditorTagsApi } from "../Tags";

export type BackgroundActionStatus = "idle" | "preparing" | "running" | "complete" | "error" | "cancelled";
export type BackgroundActionLogLevel = "debug" | "info" | "warn" | "error";
export type BackgroundActionTaskStatus = "queued" | "running" | "complete" | "skipped" | "error" | "cancelled";
export type BackgroundActionEventType =
  | "started"
  | "label"
  | "status"
  | "log"
  | "result"
  | "results-available"
  | "error"
  | "cancel-requested";

export interface BackgroundActionTarget extends Reference {
  label: string;
  labelMessage?: import("@manifest-editor/i18n/core").MessageReference;
  scope: "root" | "canvas";
}

export interface BackgroundActionError {
  message: string;
  messageReference?: MessageReference;
  stack?: string;
  detail?: unknown;
}

export interface BackgroundActionLogEntry {
  id: string;
  createdAt: number;
  level: BackgroundActionLogLevel;
  message: string;
  messageReference?: MessageReference;
  data?: unknown;
}

export interface BackgroundActionEvent {
  id: string;
  createdAt: number;
  type: BackgroundActionEventType;
  message?: string;
  messageReference?: MessageReference;
  data?: unknown;
}

export interface BackgroundActionProgress {
  percent: number;
  current?: number;
  total?: number;
  label?: string;
  labelMessage?: import("@manifest-editor/i18n/core").MessageReference;
}

export type BackgroundActionProgressInput =
  | {
      percent: number;
      current?: number;
      total?: number;
      label?: string;
      labelMessage?: import("@manifest-editor/i18n/core").MessageReference;
    }
  | {
      current: number;
      total: number;
      percent?: number;
      label?: string;
      labelMessage?: import("@manifest-editor/i18n/core").MessageReference;
    };

export interface BackgroundActionTask {
  id: string;
  label: string;
  labelMessage?: import("@manifest-editor/i18n/core").MessageReference;
  target?: BackgroundActionTarget;
  input?: unknown;
  status?: BackgroundActionTaskStatus;
  statusText?: string;
  statusTextMessage?: MessageReference;
  result?: unknown;
  error?: BackgroundActionError | null;
  createdAt?: number;
  startedAt?: number;
  completedAt?: number;
}

export interface BackgroundActionPlan {
  version: 1;
  data?: unknown;
  tasks: BackgroundActionTask[];
}

export interface BackgroundActionPersistedState {
  version: 1;
  savedAt: number;
  instances: Record<string, BackgroundActionInstance>;
  histories: Record<string, BackgroundActionInstance[]>;
  plans: Record<string, BackgroundActionPlan>;
}

export interface BackgroundActionPersistenceKey {
  appId: string;
  instanceId: string;
  rootResource: Reference;
}

export interface BackgroundActionPersistence {
  load(key: BackgroundActionPersistenceKey): Promise<BackgroundActionPersistedState | null | undefined>;
  save(key: BackgroundActionPersistenceKey, state: BackgroundActionPersistedState): Promise<void>;
  clear(key: BackgroundActionPersistenceKey): Promise<void>;
}

export type BackgroundActionTaskRunResult =
  | {
      taskStatus?: "complete" | "skipped";
      result?: unknown;
      statusText?: string;
      statusTextMessage?: MessageReference;
    }
  | unknown;

export interface BackgroundActionTaskRunOptions {
  statuses?: BackgroundActionTaskStatus[];
  progressLabel?: (task: BackgroundActionTask, index: number, total: number) => string;
  yieldEveryMs?: number | false;
}

export interface BackgroundActionTasksApi {
  getAll(): BackgroundActionTask[];
  getPending(): BackgroundActionTask[];
  update(id: string, patch: Partial<BackgroundActionTask>, persistImmediately?: boolean): void;
  runEach(
    handler: (
      task: BackgroundActionTask,
      context: {
        index: number;
        total: number;
        pendingIndex: number;
        pendingTotal: number;
      }
    ) => BackgroundActionTaskRunResult | Promise<BackgroundActionTaskRunResult>,
    options?: BackgroundActionTaskRunOptions
  ): Promise<BackgroundActionTask[]>;
}

export interface BackgroundActionInstance {
  id: string;
  runId: string;
  actionId: string;
  target: BackgroundActionTarget;
  label: string;
  labelMessage?: import("@manifest-editor/i18n/core").MessageReference;
  status: BackgroundActionStatus;
  statusText?: string;
  statusTextMessage?: MessageReference;
  error?: BackgroundActionError | null;
  result?: unknown;
  resultsAvailable: boolean;
  logs: BackgroundActionLogEntry[];
  events: BackgroundActionEvent[];
  progress?: BackgroundActionProgress;
  startedAt?: number;
  completedAt?: number;
  cancelRequestedAt?: number;
  cancelledAt?: number;
}

export interface BackgroundActionSystemContext {
  /** Local UI formatter. Never spread this context into worker transport. */
  i18n?: Pick<EditorI18n, "resolveMessage" | "translate">;
  rootResource: Resource;
  currentCanvas?: BackgroundActionTarget;
  vault: Vault;
  tags: ManifestEditorTagsApi;
  canvasProgress: ManifestEditorCanvasProgressApi;
  plugins: PluginRuntimeApi;
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
  setActionLabel(label: string, labelMessage?: MessageReference): void;
  setActionStatus(status: BackgroundActionStatus, statusText?: string, statusTextMessage?: MessageReference): void;
  setActionError(error: unknown, statusText?: string, statusTextMessage?: MessageReference): void;
  appendActionLog(
    message: string,
    level?: BackgroundActionLogLevel,
    data?: unknown,
    messageReference?: MessageReference
  ): void;
  setActionProgress(progress: BackgroundActionProgressInput | null): void;
  setResult(result: unknown): void;
  setResultsAvailable(available: boolean): void;
}

export interface BackgroundActionRunContext extends BackgroundActionContext, BackgroundActionLifecycle {
  i18n: Pick<EditorI18n, "resolveMessage" | "translate">;
  signal: AbortSignal;
  prepareData?: unknown;
  plan?: BackgroundActionPlan;
  tasks: BackgroundActionTasksApi;
}

export interface BackgroundActionRenderContext extends BackgroundActionSystemContext {
  definition: BackgroundActionDefinition;
}

export interface BackgroundActionDefinition {
  id: string;
  label: string;
  labelMessage?: import("@manifest-editor/i18n/core").MessageReference;
  summary?: string;
  summaryMessage?: import("@manifest-editor/i18n/core").MessageReference;
  section?: string;
  sectionMessage?: MessageReference;
  order?: number;
  resourceTypes?: string[];
  resumable?: boolean;
  supports?: (ctx: BackgroundActionContext) => boolean;
  prepare?: (
    ctx: BackgroundActionRunContext
  ) => BackgroundActionPlan | boolean | void | Promise<BackgroundActionPlan | boolean | void>;
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
  labelMessage?: import("@manifest-editor/i18n/core").MessageReference;
  target: BackgroundActionTarget;
  actions: AvailableBackgroundAction[];
}
