import localforage from "localforage";
import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { createStore, type StoreApi, useStore } from "zustand";
import { useApp, useAppInstance } from "../AppContext/AppContext";
import { createTrackingCanvasProgressApi, type ManifestEditorCanvasProgressApi } from "../CanvasProgress";
import {
  type BackgroundActionContext,
  type BackgroundActionDefinition,
  type BackgroundActionError,
  type BackgroundActionEvent,
  type BackgroundActionEventType,
  type BackgroundActionGroup,
  type BackgroundActionInstance,
  type BackgroundActionLogEntry,
  type BackgroundActionLogLevel,
  type BackgroundActionPersistence,
  type BackgroundActionPersistenceKey,
  type BackgroundActionPersistedState,
  type BackgroundActionPlan,
  type BackgroundActionProgress,
  type BackgroundActionProgressInput,
  type BackgroundActionRunContext,
  type BackgroundActionStatus,
  type BackgroundActionTarget,
  type BackgroundActionTask,
  type BackgroundActionTaskRunOptions,
  type BackgroundActionTaskRunResult,
  type BackgroundActionTaskStatus,
  type BackgroundActionTasksApi,
  type BackgroundActionSystemContext,
} from "./BackgroundTasks.types";

export interface BackgroundActionsStore {
  definitions: BackgroundActionDefinition[];
  instances: Record<string, BackgroundActionInstance>;
  histories: Record<string, BackgroundActionInstance[]>;
  plans: Record<string, BackgroundActionPlan>;
  controllers: Record<string, AbortController>;
  hasHydrated: boolean;
  setDefinitions(definitions: BackgroundActionDefinition[]): void;
  setPersistence(persistence: BackgroundActionPersistence | null, key: BackgroundActionPersistenceKey | null): void;
  hydrate(snapshot?: BackgroundActionPersistedState | null): void;
  persist(immediate?: boolean): void;
  flushPersistence(): Promise<void>;
  registerAction(definition: BackgroundActionDefinition): () => void;
  unregisterAction(id: string): void;
  resetAction(instanceKey: string): void;
  startAction(
    instanceKey: string,
    definition: BackgroundActionDefinition,
    target: BackgroundActionTarget,
    controller?: AbortController,
  ): void;
  resumeAction(instanceKey: string, controller: AbortController): void;
  cancelAction(instanceKey: string): void;
  setActionLabel(instanceKey: string, label: string): void;
  setActionStatus(instanceKey: string, status: BackgroundActionStatus, statusText?: string): void;
  setActionError(instanceKey: string, error: unknown, statusText?: string): void;
  appendActionLog(instanceKey: string, message: string, level?: BackgroundActionLogLevel, data?: unknown): void;
  setActionProgress(instanceKey: string, progress: BackgroundActionProgressInput | null): void;
  setResult(instanceKey: string, result: unknown): void;
  setResultsAvailable(instanceKey: string, available: boolean): void;
  setActionPlan(instanceKey: string, plan: BackgroundActionPlan): void;
  updateActionTask(
    instanceKey: string,
    taskId: string,
    patch: Partial<BackgroundActionTask>,
    persistImmediately?: boolean,
  ): void;
}

export interface RunBackgroundActionOptions {
  store: StoreApi<BackgroundActionsStore>;
  context: BackgroundActionContext;
  signal?: AbortSignal;
  resume?: boolean;
}

export interface GetAvailableBackgroundActionGroupsOptions {
  definitions: BackgroundActionDefinition[];
  instances: Record<string, BackgroundActionInstance>;
  systemContext: BackgroundActionSystemContext;
  targets: BackgroundActionTarget[];
  onSupportsError?: (definition: BackgroundActionDefinition, error: unknown) => void;
}

export function getBackgroundActionInstanceKey(actionId: string, target: BackgroundActionTarget) {
  return `${actionId}::${target.type}::${target.id}`;
}

export function mergeBackgroundActionDefinitions(
  base: BackgroundActionDefinition[] = [],
  extensions: BackgroundActionDefinition[] = [],
) {
  const uniqueExtensions: BackgroundActionDefinition[] = [];
  const extensionIds = new Set<string>();

  for (let index = extensions.length - 1; index >= 0; index -= 1) {
    const definition = extensions[index];
    if (definition && !extensionIds.has(definition.id)) {
      extensionIds.add(definition.id);
      uniqueExtensions.unshift(definition);
    }
  }

  return [...base.filter((definition) => !extensionIds.has(definition.id)), ...uniqueExtensions];
}

export function sortBackgroundActionDefinitions(definitions: BackgroundActionDefinition[]) {
  return [...definitions].sort((a, b) => {
    const section = (a.section || "").localeCompare(b.section || "");
    if (section !== 0) return section;

    const order = (a.order || 0) - (b.order || 0);
    if (order !== 0) return order;

    const label = a.label.localeCompare(b.label);
    if (label !== 0) return label;

    return a.id.localeCompare(b.id);
  });
}

export function normaliseBackgroundActionError(error: unknown): BackgroundActionError {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      detail: error,
    };
  }

  return {
    message: typeof error === "string" ? error : "Background action failed",
    detail: error,
  };
}

function normaliseStoredBackgroundActionError(error: unknown): BackgroundActionError {
  if (error && typeof error === "object" && typeof (error as BackgroundActionError).message === "string") {
    return {
      message: (error as BackgroundActionError).message,
      stack: typeof (error as BackgroundActionError).stack === "string" ? (error as BackgroundActionError).stack : undefined,
      detail: (error as BackgroundActionError).detail,
    };
  }

  return normaliseBackgroundActionError(error);
}

function supportsTarget(definition: BackgroundActionDefinition, target: BackgroundActionTarget) {
  if (!definition.resourceTypes?.length) {
    return true;
  }

  return definition.resourceTypes.includes(target.type);
}

export function getAvailableBackgroundActionGroups({
  definitions,
  instances,
  systemContext,
  targets,
  onSupportsError,
}: GetAvailableBackgroundActionGroupsOptions): BackgroundActionGroup[] {
  const sortedDefinitions = sortBackgroundActionDefinitions(definitions);
  const groups: BackgroundActionGroup[] = [];

  for (const target of targets) {
    const actions = [];

    for (const definition of sortedDefinitions) {
      if (!supportsTarget(definition, target)) {
        continue;
      }

      const instanceKey = getBackgroundActionInstanceKey(definition.id, target);
      const context: BackgroundActionContext = {
        ...systemContext,
        definition,
        target,
        instanceKey,
        instance: instances[instanceKey],
      };

      try {
        if (definition.supports && !definition.supports(context)) {
          continue;
        }
      } catch (error) {
        onSupportsError?.(definition, error);
        continue;
      }

      actions.push({
        definition,
        target,
        instanceKey,
        instance: instances[instanceKey],
        context,
      });
    }

    if (actions.length) {
      groups.push({
        id: `${target.scope}:${target.type}:${target.id}`,
        label: target.label,
        target,
        actions,
      });
    }
  }

  return groups;
}

let backgroundActionEntryCounter = 0;

function createBackgroundActionEntryId(prefix: string) {
  backgroundActionEntryCounter += 1;
  return `${prefix}-${Date.now()}-${backgroundActionEntryCounter}`;
}

function createBackgroundActionEvent(
  type: BackgroundActionEventType,
  message?: string,
  data?: unknown,
  createdAt = Date.now(),
): BackgroundActionEvent {
  return {
    id: createBackgroundActionEntryId("event"),
    createdAt,
    type,
    message,
    data,
  };
}

function appendEvent(
  instance: BackgroundActionInstance,
  type: BackgroundActionEventType,
  message?: string,
  data?: unknown,
  createdAt = Date.now(),
) {
  return {
    ...instance,
    events: [...instance.events, createBackgroundActionEvent(type, message, data, createdAt)],
  };
}

function withoutProgressEvents(events: BackgroundActionEvent[]): BackgroundActionEvent[] {
  return events.filter((event) => String(event.type) !== "progress");
}

function cloneInstanceForHistory(instance: BackgroundActionInstance): BackgroundActionInstance {
  return {
    ...instance,
    logs: [...instance.logs],
    events: withoutProgressEvents(instance.events),
    progress: instance.progress ? { ...instance.progress } : undefined,
  };
}

function upsertHistoryInstance(
  histories: Record<string, BackgroundActionInstance[]>,
  instanceKey: string,
  instance: BackgroundActionInstance,
) {
  if (!isCompletedStatus(instance.status)) {
    return histories;
  }

  const history = histories[instanceKey] || [];
  const snapshot = cloneInstanceForHistory(instance);
  const existingIndex = history.findIndex((item) => item.runId === instance.runId);
  const nextHistory =
    existingIndex >= 0
      ? history.map((item, index) => (index === existingIndex ? snapshot : item))
      : [...history, snapshot];

  return {
    ...histories,
    [instanceKey]: nextHistory,
  };
}

function updateStoredInstance(
  state: Pick<BackgroundActionsStore, "instances" | "histories">,
  instanceKey: string,
  updater: (instance: BackgroundActionInstance) => BackgroundActionInstance,
) {
  const instance = state.instances[instanceKey];
  if (!instance) {
    return {
      instances: state.instances,
      histories: state.histories,
    };
  }

  const updated = updater(instance);
  const instances = {
    ...state.instances,
    [instanceKey]: updated,
  };

  return {
    instances,
    histories: upsertHistoryInstance(state.histories, instanceKey, updated),
  };
}

function clampProgressPercent(percent: number) {
  if (!Number.isFinite(percent)) {
    return 0;
  }

  return Math.min(100, Math.max(0, percent));
}

function normaliseProgress(progress: BackgroundActionProgressInput): BackgroundActionProgress {
  const input = progress as {
    percent?: number;
    current?: number;
    total?: number;
    label?: string;
  };
  const current = typeof input.current === "number" && Number.isFinite(input.current) ? input.current : undefined;
  const total = typeof input.total === "number" && Number.isFinite(input.total) ? input.total : undefined;
  const percent =
    typeof input.percent === "number" && Number.isFinite(input.percent)
      ? input.percent
      : typeof current === "number" && typeof total === "number" && total > 0
        ? (current / total) * 100
        : 0;

  return {
    percent: clampProgressPercent(percent),
    current,
    total,
    label: input.label,
  };
}

function isActiveStatus(status: BackgroundActionStatus) {
  return status === "preparing" || status === "running";
}

function isCompletedStatus(status: BackgroundActionStatus) {
  return status === "complete" || status === "error" || status === "cancelled";
}

function isTaskStatus(status: unknown): status is BackgroundActionTaskStatus {
  return (
    status === "queued" ||
    status === "running" ||
    status === "complete" ||
    status === "skipped" ||
    status === "error" ||
    status === "cancelled"
  );
}

function isPendingTaskStatus(status: BackgroundActionTaskStatus | undefined) {
  return !status || status === "queued" || status === "running";
}

function isTerminalTaskStatus(status: BackgroundActionTaskStatus | undefined) {
  return status === "complete" || status === "skipped" || status === "error" || status === "cancelled";
}

function toJsonValue<T>(value: T): T | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }

  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return undefined;
  }
}

function serialiseError(error: BackgroundActionError | null | undefined): BackgroundActionError | null | undefined {
  if (!error) {
    return error;
  }

  return {
    message: error.message,
    stack: error.stack,
    detail: toJsonValue(error.detail),
  };
}

function serialiseInstance(instance: BackgroundActionInstance): BackgroundActionInstance {
  return {
    ...instance,
    error: serialiseError(instance.error) || null,
    result: toJsonValue(instance.result),
    logs: instance.logs.map((log) => ({
      ...log,
      data: toJsonValue(log.data),
    })),
    events: withoutProgressEvents(instance.events).map((event) => ({
      ...event,
      data: toJsonValue(event.data),
    })),
    progress: instance.progress ? { ...instance.progress } : undefined,
  };
}

function serialiseTask(task: BackgroundActionTask): BackgroundActionTask {
  return {
    ...task,
    status: normaliseTaskStatus(task.status),
    input: toJsonValue(task.input),
    result: toJsonValue(task.result),
    error: serialiseError(task.error) || null,
  };
}

function serialisePlan(plan: BackgroundActionPlan): BackgroundActionPlan {
  return {
    version: 1,
    data: toJsonValue(plan.data),
    tasks: plan.tasks.map(serialiseTask),
  };
}

function createPersistedState(state: BackgroundActionsStore): BackgroundActionPersistedState {
  return {
    version: 1,
    savedAt: Date.now(),
    instances: Object.fromEntries(
      Object.entries(state.instances).map(([key, instance]) => [key, serialiseInstance(instance)]),
    ),
    histories: Object.fromEntries(
      Object.entries(state.histories).map(([key, history]) => [key, history.map(serialiseInstance)]),
    ),
    plans: Object.fromEntries(Object.entries(state.plans).map(([key, plan]) => [key, serialisePlan(plan)])),
  };
}

function persistedStateIsEmpty(state: BackgroundActionPersistedState) {
  return (
    !Object.keys(state.instances).length &&
    !Object.keys(state.histories).length &&
    !Object.keys(state.plans).length
  );
}

function normaliseTaskStatus(status: unknown): BackgroundActionTaskStatus {
  return isTaskStatus(status) ? status : "queued";
}

function normaliseTask(task: BackgroundActionTask, fallbackIndex: number): BackgroundActionTask {
  const now = Date.now();
  const id = typeof task.id === "string" && task.id ? task.id : `task-${fallbackIndex + 1}`;
  return {
    ...task,
    id,
    label: typeof task.label === "string" && task.label ? task.label : id,
    status: normaliseTaskStatus(task.status),
    error: task.error ? normaliseStoredBackgroundActionError(task.error) : null,
    createdAt: typeof task.createdAt === "number" ? task.createdAt : now,
  };
}

function normalisePlan(plan: BackgroundActionPlan | undefined | null): BackgroundActionPlan | null {
  if (!plan || plan.version !== 1 || !Array.isArray(plan.tasks)) {
    return null;
  }

  return {
    version: 1,
    data: plan.data,
    tasks: plan.tasks.map(normaliseTask),
  };
}

function requeueActivePlanTasks(plan: BackgroundActionPlan): BackgroundActionPlan {
  return {
    ...plan,
    tasks: plan.tasks.map((task) =>
      task.status === "running"
        ? {
            ...task,
            status: "queued",
            statusText: "Queued after reload",
            startedAt: undefined,
          }
        : task,
    ),
  };
}

function cancelPendingPlanTasks(plan: BackgroundActionPlan, completedAt = Date.now()): BackgroundActionPlan {
  return {
    ...plan,
    tasks: plan.tasks.map((task) =>
      isPendingTaskStatus(task.status)
        ? {
            ...task,
            status: "cancelled",
            statusText: "Cancelled",
            error: null,
            completedAt,
          }
        : task,
    ),
  };
}

function normaliseInstance(instance: BackgroundActionInstance): BackgroundActionInstance {
  return {
    ...instance,
    error: instance.error ? normaliseStoredBackgroundActionError(instance.error) : null,
    logs: Array.isArray(instance.logs) ? instance.logs : [],
    events: withoutProgressEvents(Array.isArray(instance.events) ? instance.events : []),
    resultsAvailable: instance.resultsAvailable === true,
  };
}

function normalisePersistedState(snapshot?: BackgroundActionPersistedState | null): BackgroundActionPersistedState {
  if (!snapshot || snapshot.version !== 1) {
    return {
      version: 1,
      savedAt: Date.now(),
      instances: {},
      histories: {},
      plans: {},
    };
  }

  return {
    version: 1,
    savedAt: typeof snapshot.savedAt === "number" ? snapshot.savedAt : Date.now(),
    instances: snapshot.instances || {},
    histories: snapshot.histories || {},
    plans: snapshot.plans || {},
  };
}

function getPlanProgress(plan: BackgroundActionPlan, label?: string): BackgroundActionProgress | undefined {
  const total = plan.tasks.length;
  if (!total) {
    return undefined;
  }

  const current = plan.tasks.filter((task) => isTerminalTaskStatus(task.status)).length;
  return normaliseProgress({ current, total, label });
}

function getTaskRunResult(result: BackgroundActionTaskRunResult): {
  taskStatus: "complete" | "skipped";
  result: unknown;
  statusText?: string;
} {
  if (
    result &&
    typeof result === "object" &&
    "taskStatus" in result &&
    ((result as any).taskStatus === "complete" || (result as any).taskStatus === "skipped")
  ) {
    return {
      taskStatus: (result as any).taskStatus,
      result: (result as any).result,
      statusText: (result as any).statusText,
    };
  }

  return {
    taskStatus: "complete",
    result,
  };
}

function restoreCanvasProgressFromPlan(canvasProgress: ManifestEditorCanvasProgressApi, plan: BackgroundActionPlan) {
  for (const task of plan.tasks) {
    if (!task.target || task.target.type !== "Canvas") {
      continue;
    }

    if (task.status === "running") {
      canvasProgress.setStatus(task.target, "pending");
    } else if (task.status === "queued") {
      canvasProgress.setStatus(task.target, "queued");
    }
  }
}

function createTaskApi(
  options: RunBackgroundActionOptions,
  signal: AbortSignal,
  canvasProgress: ManifestEditorCanvasProgressApi,
): BackgroundActionTasksApi {
  const { store, context } = options;
  const { instanceKey } = context;

  function getPlan() {
    return store.getState().plans[instanceKey];
  }

  function getAll() {
    return getPlan()?.tasks || [];
  }

  function getPending(statuses: BackgroundActionTaskStatus[] = ["queued", "running"]) {
    const allowed = new Set(statuses);
    return getAll().filter((task) => allowed.has(normaliseTaskStatus(task.status)));
  }

  function update(id: string, patch: Partial<BackgroundActionTask>, persistImmediately = false) {
    store.getState().updateActionTask(instanceKey, id, patch, persistImmediately);
  }

  async function runEach(
    handler: (
      task: BackgroundActionTask,
      context: { index: number; total: number; pendingIndex: number; pendingTotal: number },
    ) => BackgroundActionTaskRunResult | Promise<BackgroundActionTaskRunResult>,
    runOptions: BackgroundActionTaskRunOptions = {},
  ) {
    const statuses = runOptions.statuses || ["queued", "running"];
    const pending = getPending(statuses);
    const total = getAll().length;
    const pendingTotal = pending.length;

    for (const [pendingIndex, pendingTask] of pending.entries()) {
      if (signal.aborted) {
        throw new Error("Background action cancelled.");
      }

      const latestTask = getAll().find((task) => task.id === pendingTask.id) || pendingTask;
      const index = getAll().findIndex((task) => task.id === latestTask.id);
      const label =
        runOptions.progressLabel?.(latestTask, index, total) ||
        latestTask.label ||
        `Task ${index + 1}/${total}`;

      if (latestTask.target?.type === "Canvas") {
        canvasProgress.setStatus(latestTask.target, "pending");
      }
      update(latestTask.id, {
        status: "running",
        statusText: label,
        error: null,
        startedAt: Date.now(),
        completedAt: undefined,
      }, true);
      store.getState().setActionStatus(instanceKey, "running", label);
      store.getState().setActionProgress(instanceKey, {
        current: getAll().filter((task) => isTerminalTaskStatus(task.status)).length,
        total,
        label,
      });

      try {
        const handlerResult = await handler(latestTask, {
          index,
          total,
          pendingIndex,
          pendingTotal,
        });

        if (signal.aborted) {
          throw new Error("Background action cancelled.");
        }

        const taskResult = getTaskRunResult(handlerResult);
        update(
          latestTask.id,
          {
            status: taskResult.taskStatus,
            statusText: taskResult.statusText || (taskResult.taskStatus === "skipped" ? "Skipped" : "Complete"),
            result: taskResult.result,
            error: null,
            completedAt: Date.now(),
          },
          true,
        );
        if (latestTask.target?.type === "Canvas") {
          canvasProgress.setStatus(latestTask.target, "done");
        }
      } catch (error) {
        if (signal.aborted || isAbortLikeError(error)) {
          update(
            latestTask.id,
            {
              status: "cancelled",
              statusText: "Cancelled",
              error: null,
              completedAt: Date.now(),
            },
            true,
          );
          throw error;
        }

        const normalisedError = normaliseBackgroundActionError(error);
        update(
          latestTask.id,
          {
            status: "error",
            statusText: normalisedError.message,
            error: normalisedError,
            completedAt: Date.now(),
          },
          true,
        );
        store.getState().appendActionLog(instanceKey, `Task failed: ${latestTask.label}`, "warn", {
          taskId: latestTask.id,
          error: normalisedError.message,
        });
      } finally {
        const latestPlan = getPlan();
        if (latestPlan) {
          store.getState().setActionProgress(instanceKey, {
            current: latestPlan.tasks.filter((task) => isTerminalTaskStatus(task.status)).length,
            total,
            label,
          });
        }
      }
    }

    return getAll();
  }

  return {
    getAll,
    getPending: () => getPending(),
    update,
    runEach,
  };
}

export function createBackgroundActionsStore(initialDefinitions: BackgroundActionDefinition[] = []) {
  let persistence: BackgroundActionPersistence | null = null;
  let persistenceKey: BackgroundActionPersistenceKey | null = null;
  let persistTimer: ReturnType<typeof setTimeout> | null = null;

  return createStore<BackgroundActionsStore>((set, get) => {
    async function flushPersistence() {
      if (persistTimer) {
        clearTimeout(persistTimer);
        persistTimer = null;
      }

      if (!persistence || !persistenceKey || !get().hasHydrated) {
        return;
      }

      const snapshot = createPersistedState(get());
      if (persistedStateIsEmpty(snapshot)) {
        await persistence.clear(persistenceKey);
        return;
      }

      await persistence.save(persistenceKey, snapshot);
    }

    function queuePersist(immediate = false) {
      if (!persistence || !persistenceKey || !get().hasHydrated) {
        return;
      }

      if (immediate) {
        void flushPersistence();
        return;
      }

      if (persistTimer) {
        clearTimeout(persistTimer);
      }

      persistTimer = setTimeout(() => {
        void flushPersistence();
      }, 300);
    }

    return {
      definitions: mergeBackgroundActionDefinitions([], initialDefinitions),
      instances: {},
      histories: {},
      plans: {},
      controllers: {},
      hasHydrated: true,

      setDefinitions(definitions) {
        set((prev) => {
          const nextDefinitions = mergeBackgroundActionDefinitions([], definitions);
          const nextDefinitionIds = new Set(nextDefinitions.map((definition) => definition.id));
          const nextInstances: Record<string, BackgroundActionInstance> = {};
          const nextHistories: Record<string, BackgroundActionInstance[]> = {};
          const nextPlans: Record<string, BackgroundActionPlan> = {};

          for (const [key, instance] of Object.entries(prev.instances)) {
            if (nextDefinitionIds.has(instance.actionId)) {
              nextInstances[key] = instance;
            }
          }

          for (const [key, history] of Object.entries(prev.histories)) {
            const nextHistory = history.filter((instance) => nextDefinitionIds.has(instance.actionId));
            if (nextHistory.length) {
              nextHistories[key] = nextHistory;
            }
          }

          for (const [key, plan] of Object.entries(prev.plans)) {
            if (nextInstances[key]) {
              nextPlans[key] = plan;
            }
          }

          return {
            definitions: nextDefinitions,
            instances: nextInstances,
            histories: nextHistories,
            plans: nextPlans,
            controllers: Object.fromEntries(
              Object.entries(prev.controllers).filter(
                ([key]) => nextInstances[key]?.status && isActiveStatus(nextInstances[key].status),
              ),
            ),
          };
        });
        queuePersist();
      },

      setPersistence(nextPersistence, nextKey) {
        persistence = nextPersistence;
        persistenceKey = nextPersistence && nextKey ? nextKey : null;
        set({ hasHydrated: !persistence });
      },

      hydrate(snapshot) {
        const persisted = normalisePersistedState(snapshot);
        const definitionsById = new Map(get().definitions.map((definition) => [definition.id, definition]));
        const nextInstances: Record<string, BackgroundActionInstance> = {};
        let nextHistories: Record<string, BackgroundActionInstance[]> = {};
        const nextPlans: Record<string, BackgroundActionPlan> = {};

        for (const [key, history] of Object.entries(persisted.histories)) {
          const filtered = (Array.isArray(history) ? history : [])
            .map(normaliseInstance)
            .filter((instance) => definitionsById.has(instance.actionId));
          if (filtered.length) {
            nextHistories[key] = filtered;
          }
        }

        for (const [key, rawInstance] of Object.entries(persisted.instances)) {
          const instance = normaliseInstance(rawInstance);
          const definition = definitionsById.get(instance.actionId);
          if (!definition) {
            continue;
          }

          let nextInstance = instance;
          let plan = normalisePlan(persisted.plans[key]);

          if (isActiveStatus(instance.status)) {
            if (instance.cancelRequestedAt) {
              const cancelledAt = Date.now();
              plan = plan ? cancelPendingPlanTasks(plan, cancelledAt) : plan;
              nextInstance = appendEvent(
                {
                  ...instance,
                  status: "cancelled",
                  statusText: "Cancelled",
                  completedAt: cancelledAt,
                  cancelledAt,
                },
                "status",
                "Cancelled",
                { status: "cancelled" },
                cancelledAt,
              );
            } else if (definition.resumable && plan) {
              plan = requeueActivePlanTasks(plan);
              nextInstance = appendEvent(
                {
                  ...instance,
                  status: "running",
                  statusText: "Resuming",
                  completedAt: undefined,
                  cancelledAt: undefined,
                },
                "status",
                "Resuming",
                { status: "running" },
              );
            } else {
              const cancelledAt = Date.now();
              nextInstance = appendEvent(
                {
                  ...instance,
                  status: "cancelled",
                  statusText: "Interrupted by page reload",
                  completedAt: cancelledAt,
                  cancelledAt,
                },
                "status",
                "Interrupted by page reload",
                { status: "cancelled" },
                cancelledAt,
              );
            }
          }

          nextInstances[key] = nextInstance;
          nextHistories = upsertHistoryInstance(nextHistories, key, nextInstance);

          if (plan) {
            nextPlans[key] = plan;
          }
        }

        set({
          instances: nextInstances,
          histories: nextHistories,
          plans: nextPlans,
          controllers: {},
          hasHydrated: true,
        });
        queuePersist(true);
      },

      persist(immediate = false) {
        queuePersist(immediate);
      },

      flushPersistence,

      registerAction(definition) {
        set((prev) => ({
          definitions: mergeBackgroundActionDefinitions(prev.definitions, [definition]),
        }));
        queuePersist();

        return () => get().unregisterAction(definition.id);
      },

      unregisterAction(id) {
        set((prev) => {
          const instances: Record<string, BackgroundActionInstance> = {};
          for (const [key, instance] of Object.entries(prev.instances)) {
            if (instance.actionId !== id) {
              instances[key] = instance;
            }
          }

          const histories: Record<string, BackgroundActionInstance[]> = {};
          for (const [key, history] of Object.entries(prev.histories)) {
            const nextHistory = history.filter((instance) => instance.actionId !== id);
            if (nextHistory.length) {
              histories[key] = nextHistory;
            }
          }

          const plans = { ...prev.plans };
          const controllers = { ...prev.controllers };
          for (const [key, instance] of Object.entries(prev.instances)) {
            if (instance.actionId === id) {
              controllers[key]?.abort();
              delete controllers[key];
              delete plans[key];
            }
          }

          return {
            definitions: prev.definitions.filter((definition) => definition.id !== id),
            instances,
            histories,
            plans,
            controllers,
          };
        });
        queuePersist(true);
      },

      resetAction(instanceKey) {
        set((prev) => {
          prev.controllers[instanceKey]?.abort();
          const instances = { ...prev.instances };
          const histories = { ...prev.histories };
          const plans = { ...prev.plans };
          const controllers = { ...prev.controllers };
          delete instances[instanceKey];
          delete histories[instanceKey];
          delete plans[instanceKey];
          delete controllers[instanceKey];
          return { instances, histories, plans, controllers };
        });
        queuePersist(true);
      },

      startAction(instanceKey, definition, target, controller) {
        const startedAt = Date.now();
        set((prev) => {
          const plans = { ...prev.plans };
          delete plans[instanceKey];
          return {
            instances: {
              ...prev.instances,
              [instanceKey]: {
                id: instanceKey,
                runId: createBackgroundActionEntryId("run"),
                actionId: definition.id,
                target,
                label: definition.label,
                status: "preparing",
                statusText: "Preparing",
                error: null,
                result: undefined,
                resultsAvailable: false,
                logs: [],
                events: [createBackgroundActionEvent("started", "Preparing", { status: "preparing" }, startedAt)],
                progress: undefined,
                startedAt,
                completedAt: undefined,
                cancelRequestedAt: undefined,
                cancelledAt: undefined,
              },
            },
            plans,
            controllers: controller
              ? {
                  ...prev.controllers,
                  [instanceKey]: controller,
                }
              : prev.controllers,
          };
        });
        queuePersist(true);
      },

      resumeAction(instanceKey, controller) {
        const createdAt = Date.now();
        set((prev) => ({
          ...updateStoredInstance(prev, instanceKey, (instance) =>
            appendEvent(
              {
                ...instance,
                status: "running",
                statusText: "Resuming",
                completedAt: undefined,
                cancelledAt: undefined,
              },
              "status",
              "Resuming",
              { status: "running" },
              createdAt,
            ),
          ),
          controllers: {
            ...prev.controllers,
            [instanceKey]: controller,
          },
        }));
        queuePersist(true);
      },

      cancelAction(instanceKey) {
        const controller = get().controllers[instanceKey];
        const instance = get().instances[instanceKey];
        if (!instance || !isActiveStatus(instance.status)) {
          return;
        }

        const requestedAt = Date.now();
        set((prev) => {
          const updated = updateStoredInstance(prev, instanceKey, (current) =>
            appendEvent(
              appendEvent(
                {
                  ...current,
                  status: "cancelled",
                  statusText: "Cancelled",
                  completedAt: requestedAt,
                  cancelledAt: requestedAt,
                  cancelRequestedAt: current.cancelRequestedAt || requestedAt,
                },
                "cancel-requested",
                "Cancelling",
                undefined,
                requestedAt,
              ),
              "status",
              "Cancelled",
              { status: "cancelled" },
              requestedAt,
            ),
          );
          const plan = prev.plans[instanceKey];

          return {
            ...updated,
            plans: plan
              ? {
                  ...prev.plans,
                  [instanceKey]: cancelPendingPlanTasks(plan, requestedAt),
                }
              : prev.plans,
            controllers: Object.fromEntries(Object.entries(prev.controllers).filter(([key]) => key !== instanceKey)),
          };
        });
        queuePersist(true);
        controller?.abort();
      },

      setActionLabel(instanceKey, label) {
        const createdAt = Date.now();
        set((prev) => ({
          ...updateStoredInstance(prev, instanceKey, (instance) =>
            appendEvent({ ...instance, label }, "label", label, { label }, createdAt),
          ),
        }));
        queuePersist();
      },

      setActionStatus(instanceKey, status, statusText) {
        const createdAt = Date.now();
        const completedAt = isCompletedStatus(status) ? createdAt : undefined;
        set((prev) => ({
          ...updateStoredInstance(prev, instanceKey, (instance) =>
            appendEvent(
              {
                ...instance,
                status,
                statusText,
                completedAt,
                cancelledAt: status === "cancelled" ? createdAt : undefined,
              },
              "status",
              statusText || status,
              { status },
              createdAt,
            ),
          ),
          controllers: isActiveStatus(status)
            ? prev.controllers
            : Object.fromEntries(Object.entries(prev.controllers).filter(([key]) => key !== instanceKey)),
        }));
        queuePersist(isCompletedStatus(status));
      },

      setActionError(instanceKey, error, statusText) {
        const createdAt = Date.now();
        const normalisedError = normaliseBackgroundActionError(error);
        set((prev) => ({
          ...updateStoredInstance(prev, instanceKey, (instance) =>
            appendEvent(
              {
                ...instance,
                status: "error",
                statusText,
                error: normalisedError,
                completedAt: createdAt,
                cancelledAt: undefined,
              },
              "error",
              statusText || normalisedError.message,
              normalisedError,
              createdAt,
            ),
          ),
          controllers: Object.fromEntries(Object.entries(prev.controllers).filter(([key]) => key !== instanceKey)),
        }));
        queuePersist(true);
      },

      appendActionLog(instanceKey, message, level = "info", data) {
        const createdAt = Date.now();
        const log: BackgroundActionLogEntry = {
          id: createBackgroundActionEntryId("log"),
          createdAt,
          level,
          message,
          data,
        };

        set((prev) => ({
          ...updateStoredInstance(prev, instanceKey, (instance) =>
            appendEvent(
              {
                ...instance,
                logs: [...instance.logs, log],
              },
              "log",
              message,
              { level, data },
              createdAt,
            ),
          ),
        }));
        queuePersist();
      },

      setActionProgress(instanceKey, progress) {
        const nextProgress = progress ? normaliseProgress(progress) : undefined;
        set((prev) => ({
          ...updateStoredInstance(prev, instanceKey, (instance) =>
            ({
              ...instance,
              progress: nextProgress,
            }),
          ),
        }));
      },

      setResult(instanceKey, result) {
        const createdAt = Date.now();
        set((prev) => ({
          ...updateStoredInstance(prev, instanceKey, (instance) =>
            appendEvent({ ...instance, result }, "result", "Result recorded", undefined, createdAt),
          ),
        }));
        queuePersist(true);
      },

      setResultsAvailable(instanceKey, available) {
        const createdAt = Date.now();
        set((prev) => ({
          ...updateStoredInstance(prev, instanceKey, (instance) =>
            appendEvent(
              { ...instance, resultsAvailable: available },
              "results-available",
              available ? "Results available" : "Results hidden",
              { available },
              createdAt,
            ),
          ),
        }));
        queuePersist(true);
      },

      setActionPlan(instanceKey, plan) {
        const normalisedPlan = normalisePlan(plan);
        if (!normalisedPlan) {
          return;
        }

        set((prev) => {
          const nextState = updateStoredInstance(prev, instanceKey, (instance) => ({
            ...instance,
            progress: getPlanProgress(normalisedPlan, "Queued"),
          }));

          return {
            ...nextState,
            plans: {
              ...prev.plans,
              [instanceKey]: normalisedPlan,
            },
          };
        });
        queuePersist(true);
      },

      updateActionTask(instanceKey, taskId, patch, persistImmediately = false) {
        set((prev) => {
          const plan = prev.plans[instanceKey];
          if (!plan) {
            return prev;
          }

          const tasks = plan.tasks.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            return normaliseTask(
              {
                ...task,
                ...patch,
                status: patch.status ? normaliseTaskStatus(patch.status) : task.status,
                error: patch.error ? normaliseStoredBackgroundActionError(patch.error) : patch.error === null ? null : task.error,
              },
              0,
            );
          });
          const nextPlan = {
            ...plan,
            tasks,
          };
          const nextState = updateStoredInstance(prev, instanceKey, (instance) => ({
            ...instance,
            progress: getPlanProgress(nextPlan, patch.statusText || patch.label),
          }));

          return {
            ...nextState,
            plans: {
              ...prev.plans,
              [instanceKey]: nextPlan,
            },
          };
        });
        queuePersist(persistImmediately);
      },
    };
  });
}

function createRunContext(
  options: RunBackgroundActionOptions,
  signal: AbortSignal,
  canvasProgress: ManifestEditorCanvasProgressApi,
): BackgroundActionRunContext {
  const { store, context } = options;
  const { instanceKey } = context;
  const tasks = createTaskApi(options, signal, canvasProgress);

  return {
    ...context,
    canvasProgress,
    instance: store.getState().instances[instanceKey],
    plan: store.getState().plans[instanceKey],
    tasks,
    signal,
    setActionLabel(label) {
      store.getState().setActionLabel(instanceKey, label);
    },
    setActionStatus(status, statusText) {
      store.getState().setActionStatus(instanceKey, status, statusText);
    },
    setActionError(error, statusText) {
      store.getState().setActionError(instanceKey, error, statusText);
    },
    appendActionLog(message, level, data) {
      store.getState().appendActionLog(instanceKey, message, level, data);
    },
    setActionProgress(progress) {
      store.getState().setActionProgress(instanceKey, progress);
    },
    setResult(result) {
      store.getState().setResult(instanceKey, result);
    },
    setResultsAvailable(available) {
      store.getState().setResultsAvailable(instanceKey, available);
    },
  };
}

function isBackgroundActionPlan(value: unknown): value is BackgroundActionPlan {
  return !!value && typeof value === "object" && (value as BackgroundActionPlan).version === 1 && Array.isArray((value as BackgroundActionPlan).tasks);
}

export async function runBackgroundAction(options: RunBackgroundActionOptions) {
  const { store, context } = options;
  const { definition, instanceKey, target } = context;
  const existing = store.getState().instances[instanceKey];
  const existingController = store.getState().controllers[instanceKey];

  if (existing?.status === "preparing" || existing?.status === "running") {
    if (!options.resume || existingController) {
      return existing;
    }
  }

  const controller = new AbortController();
  const signal = controller.signal;
  const canvasProgress = createTrackingCanvasProgressApi(context.canvasProgress);
  const abortFromExternalSignal = () => controller.abort();

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener("abort", abortFromExternalSignal, { once: true });
    }
  }

  if (options.resume && existing && isActiveStatus(existing.status)) {
    store.getState().resumeAction(instanceKey, controller);
  } else {
    store.getState().startAction(instanceKey, definition, target, controller);
  }

  const markCancelledIfActive = () => {
    const latest = store.getState().instances[instanceKey];
    if (latest && !isCompletedStatus(latest.status)) {
      store.getState().setActionStatus(instanceKey, "cancelled", "Cancelled");
    }
  };

  try {
    if (!options.resume && definition.prepare) {
      const prepareResult = await definition.prepare(createRunContext(options, signal, canvasProgress));
      if (signal.aborted) {
        markCancelledIfActive();
        return store.getState().instances[instanceKey];
      }

      if (prepareResult === false) {
        store.getState().setActionStatus(instanceKey, "idle");
        return store.getState().instances[instanceKey];
      }

      if (isBackgroundActionPlan(prepareResult)) {
        store.getState().setActionPlan(instanceKey, prepareResult);
      }
    }

    if (signal.aborted) {
      markCancelledIfActive();
      return store.getState().instances[instanceKey];
    }

    const plan = store.getState().plans[instanceKey];
    if (plan) {
      restoreCanvasProgressFromPlan(canvasProgress, plan);
    }

    store.getState().setActionStatus(instanceKey, "running", options.resume ? "Resuming" : "Running");
    const result = await definition.run(createRunContext(options, signal, canvasProgress));

    if (signal.aborted) {
      markCancelledIfActive();
      return store.getState().instances[instanceKey];
    }

    let latest = store.getState().instances[instanceKey];
    if (typeof result !== "undefined" && latest && !isCompletedStatus(latest.status)) {
      store.getState().setResult(instanceKey, result);
    }

    latest = store.getState().instances[instanceKey];
    if (latest && isActiveStatus(latest.status)) {
      if (typeof result !== "undefined" || latest?.resultsAvailable) {
        store.getState().setResultsAvailable(instanceKey, true);
      }
      store.getState().setActionStatus(instanceKey, "complete", "Complete");
    }
  } catch (error) {
    if (signal.aborted || isAbortLikeError(error)) {
      markCancelledIfActive();
    } else {
      store.getState().setActionError(instanceKey, error, "Error");
    }
  } finally {
    canvasProgress.clearTrackedStatuses();
    options.signal?.removeEventListener("abort", abortFromExternalSignal);
    await store.getState().flushPersistence();
  }

  return store.getState().instances[instanceKey];
}

function isAbortLikeError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.message.toLowerCase().includes("aborted"))
  );
}

function createBackgroundActionStorageKey(key: BackgroundActionPersistenceKey) {
  return JSON.stringify([key.appId, key.instanceId, key.rootResource.type, key.rootResource.id]);
}

let defaultPersistence: BackgroundActionPersistence | null | undefined;

export function createLocalForageBackgroundActionPersistence(): BackgroundActionPersistence | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storage = localforage.createInstance({
    name: "manifest-editor-background-actions-v1",
    storeName: "background-actions",
  });

  return {
    async load(key) {
      return storage.getItem<BackgroundActionPersistedState>(createBackgroundActionStorageKey(key));
    },
    async save(key, state) {
      await storage.setItem(createBackgroundActionStorageKey(key), state);
    },
    async clear(key) {
      await storage.removeItem(createBackgroundActionStorageKey(key));
    },
  };
}

function getDefaultBackgroundActionPersistence() {
  if (typeof defaultPersistence === "undefined") {
    defaultPersistence = createLocalForageBackgroundActionPersistence();
  }

  return defaultPersistence;
}

export const BackgroundActionsReactContext = createContext<StoreApi<BackgroundActionsStore> | null>(null);

export function BackgroundActionsProvider({
  children,
  persistence,
  persistenceKey,
}: {
  children: ReactNode;
  persistence?: BackgroundActionPersistence | false | null;
  persistenceKey?: BackgroundActionPersistenceKey;
}) {
  const app = useApp();
  const appInstance = useAppInstance();
  const store = useMemo(() => createBackgroundActionsStore(), []);
  const definitions = app.layout.backgroundActions || [];
  const resolvedPersistence = useMemo(
    () => (persistence === false ? null : persistence || getDefaultBackgroundActionPersistence()),
    [persistence],
  );
  const resolvedPersistenceKey = useMemo<BackgroundActionPersistenceKey | null>(() => {
    if (!persistenceKey) {
      return null;
    }

    return persistenceKey;
  }, [persistenceKey]);

  useEffect(() => {
    store.getState().setDefinitions(definitions);
  }, [store, definitions]);

  useEffect(() => {
    const key =
      resolvedPersistenceKey || {
        appId: appInstance.appId,
        instanceId: appInstance.instanceId,
        rootResource: { id: "global", type: "Manifest" },
      };
    let cancelled = false;

    store.getState().setPersistence(resolvedPersistence, key);

    if (!resolvedPersistence) {
      store.getState().hydrate(null);
      return () => void 0;
    }

    resolvedPersistence
      .load(key)
      .then((snapshot) => {
        if (!cancelled) {
          store.getState().hydrate(snapshot);
        }
      })
      .catch((error) => {
        console.warn("[manifest-editor/background-actions] Failed to load persisted actions", error);
        if (!cancelled) {
          store.getState().hydrate(null);
        }
      });

    return () => {
      cancelled = true;
      void store.getState().flushPersistence();
    };
  }, [
    appInstance.appId,
    appInstance.instanceId,
    resolvedPersistence,
    resolvedPersistenceKey?.appId,
    resolvedPersistenceKey?.instanceId,
    resolvedPersistenceKey?.rootResource.id,
    resolvedPersistenceKey?.rootResource.type,
    store,
  ]);

  useEffect(() => {
    const flush = () => {
      void store.getState().flushPersistence();
    };

    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [store]);

  return createElement(BackgroundActionsReactContext.Provider, { value: store }, children);
}

export function useBackgroundActionsStoreApi() {
  const store = useContext(BackgroundActionsReactContext);

  if (!store) {
    throw new Error("useBackgroundActionsStore must be used within a BackgroundActionsProvider");
  }

  return store;
}

export function useBackgroundActionsStore<T = BackgroundActionsStore>(
  selector: (state: BackgroundActionsStore) => T = (state) => state as T,
) {
  return useStore(useBackgroundActionsStoreApi(), selector);
}

export function useBackgroundActionInstance(instanceKey: string) {
  return useBackgroundActionsStore((state) => state.instances[instanceKey]);
}

export function useBackgroundActionHistory(instanceKey: string) {
  return useBackgroundActionsStore((state) => state.histories[instanceKey] || []);
}
