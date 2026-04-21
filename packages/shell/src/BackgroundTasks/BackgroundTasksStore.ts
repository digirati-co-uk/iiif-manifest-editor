import { createContext, createElement, type ReactNode, useContext, useEffect, useMemo } from "react";
import { createStore, type StoreApi, useStore } from "zustand";
import { useApp } from "../AppContext/AppContext";
import { createTrackingCanvasProgressApi, type ManifestEditorCanvasProgressApi } from "../CanvasProgress";
import {
  type BackgroundActionDefinition,
  type BackgroundActionError,
  type BackgroundActionEvent,
  type BackgroundActionEventType,
  type BackgroundActionGroup,
  type BackgroundActionInstance,
  type BackgroundActionLogEntry,
  type BackgroundActionLogLevel,
  type BackgroundActionProgress,
  type BackgroundActionProgressInput,
  type BackgroundActionRunContext,
  type BackgroundActionStatus,
  type BackgroundActionSystemContext,
  type BackgroundActionTarget,
  type BackgroundActionContext,
} from "./BackgroundTasks.types";

export interface BackgroundActionsStore {
  definitions: BackgroundActionDefinition[];
  instances: Record<string, BackgroundActionInstance>;
  histories: Record<string, BackgroundActionInstance[]>;
  controllers: Record<string, AbortController>;
  setDefinitions(definitions: BackgroundActionDefinition[]): void;
  registerAction(definition: BackgroundActionDefinition): () => void;
  unregisterAction(id: string): void;
  resetAction(instanceKey: string): void;
  startAction(
    instanceKey: string,
    definition: BackgroundActionDefinition,
    target: BackgroundActionTarget,
    controller?: AbortController,
  ): void;
  cancelAction(instanceKey: string): void;
  setActionLabel(instanceKey: string, label: string): void;
  setActionStatus(instanceKey: string, status: BackgroundActionStatus, statusText?: string): void;
  setActionError(instanceKey: string, error: unknown, statusText?: string): void;
  appendActionLog(instanceKey: string, message: string, level?: BackgroundActionLogLevel, data?: unknown): void;
  setActionProgress(instanceKey: string, progress: BackgroundActionProgressInput | null): void;
  setResult(instanceKey: string, result: unknown): void;
  setResultsAvailable(instanceKey: string, available: boolean): void;
}

export interface RunBackgroundActionOptions {
  store: StoreApi<BackgroundActionsStore>;
  context: BackgroundActionContext;
  signal?: AbortSignal;
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

function cloneInstanceForHistory(instance: BackgroundActionInstance): BackgroundActionInstance {
  return {
    ...instance,
    logs: [...instance.logs],
    events: [...instance.events],
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

export function createBackgroundActionsStore(initialDefinitions: BackgroundActionDefinition[] = []) {
  return createStore<BackgroundActionsStore>((set, get) => ({
    definitions: mergeBackgroundActionDefinitions([], initialDefinitions),
    instances: {},
    histories: {},
    controllers: {},

    setDefinitions(definitions) {
      set((prev) => {
        const nextDefinitions = mergeBackgroundActionDefinitions([], definitions);
        const nextDefinitionIds = new Set(nextDefinitions.map((definition) => definition.id));
        const nextInstances: Record<string, BackgroundActionInstance> = {};
        const nextHistories: Record<string, BackgroundActionInstance[]> = {};

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

        return {
          definitions: nextDefinitions,
          instances: nextInstances,
          histories: nextHistories,
          controllers: Object.fromEntries(
            Object.entries(prev.controllers).filter(([key]) => nextInstances[key]?.status && isActiveStatus(nextInstances[key].status)),
          ),
        };
      });
    },

    registerAction(definition) {
      set((prev) => ({
        definitions: mergeBackgroundActionDefinitions(prev.definitions, [definition]),
      }));

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

        const controllers = { ...prev.controllers };
        for (const [key, instance] of Object.entries(prev.instances)) {
          if (instance.actionId === id) {
            controllers[key]?.abort();
            delete controllers[key];
          }
        }

        return {
          definitions: prev.definitions.filter((definition) => definition.id !== id),
          instances,
          histories,
          controllers,
        };
      });
    },

    resetAction(instanceKey) {
      set((prev) => {
        prev.controllers[instanceKey]?.abort();
        const instances = { ...prev.instances };
        const histories = { ...prev.histories };
        const controllers = { ...prev.controllers };
        delete instances[instanceKey];
        delete histories[instanceKey];
        delete controllers[instanceKey];
        return { instances, histories, controllers };
      });
    },

    startAction(instanceKey, definition, target, controller) {
      const startedAt = Date.now();
      set((prev) => ({
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
            events: [
              createBackgroundActionEvent("started", "Preparing", { status: "preparing" }, startedAt),
            ],
            progress: undefined,
            startedAt,
            completedAt: undefined,
            cancelRequestedAt: undefined,
            cancelledAt: undefined,
          },
        },
        controllers: controller
          ? {
              ...prev.controllers,
              [instanceKey]: controller,
            }
          : prev.controllers,
      }));
    },

    cancelAction(instanceKey) {
      const controller = get().controllers[instanceKey];
      if (!controller || controller.signal.aborted) {
        return;
      }

      const requestedAt = Date.now();
      set((prev) => ({
        ...updateStoredInstance(prev, instanceKey, (instance) =>
          appendEvent(
            {
              ...instance,
              status: "running",
              statusText: "Cancelling",
              cancelRequestedAt: instance.cancelRequestedAt || requestedAt,
            },
            "cancel-requested",
            "Cancelling",
            undefined,
            requestedAt,
          ),
        ),
      }));
      controller.abort();
    },

    setActionLabel(instanceKey, label) {
      const createdAt = Date.now();
      set((prev) => ({
        ...updateStoredInstance(prev, instanceKey, (instance) =>
          appendEvent({ ...instance, label }, "label", label, { label }, createdAt),
        ),
      }));
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
    },

    setActionProgress(instanceKey, progress) {
      const createdAt = Date.now();
      const nextProgress = progress ? normaliseProgress(progress) : undefined;
      set((prev) => ({
        ...updateStoredInstance(prev, instanceKey, (instance) =>
          appendEvent(
            {
              ...instance,
              progress: nextProgress,
            },
            "progress",
            nextProgress?.label || (nextProgress ? `${Math.round(nextProgress.percent)}%` : "Progress cleared"),
            nextProgress || null,
            createdAt,
          ),
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
    },
  }));
}

function createRunContext(
  options: RunBackgroundActionOptions,
  signal: AbortSignal,
  canvasProgress: ManifestEditorCanvasProgressApi,
): BackgroundActionRunContext {
  const { store, context } = options;
  const { instanceKey } = context;

  return {
    ...context,
    canvasProgress,
    instance: store.getState().instances[instanceKey],
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

export async function runBackgroundAction(options: RunBackgroundActionOptions) {
  const { store, context } = options;
  const { definition, instanceKey, target } = context;
  const existing = store.getState().instances[instanceKey];

  if (existing?.status === "preparing" || existing?.status === "running") {
    return existing;
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

  store.getState().startAction(instanceKey, definition, target, controller);

  try {
    if (definition.prepare) {
      const prepareResult = await definition.prepare(createRunContext(options, signal, canvasProgress));
      if (signal.aborted) {
        store.getState().setActionStatus(instanceKey, "cancelled", "Cancelled");
        return store.getState().instances[instanceKey];
      }

      if (prepareResult === false) {
        store.getState().setActionStatus(instanceKey, "idle");
        return store.getState().instances[instanceKey];
      }
    }

    if (signal.aborted) {
      store.getState().setActionStatus(instanceKey, "cancelled", "Cancelled");
      return store.getState().instances[instanceKey];
    }

    store.getState().setActionStatus(instanceKey, "running", "Running");
    const result = await definition.run(createRunContext(options, signal, canvasProgress));

    if (signal.aborted) {
      store.getState().setActionStatus(instanceKey, "cancelled", "Cancelled");
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
      store.getState().setActionStatus(instanceKey, "cancelled", "Cancelled");
    } else {
      store.getState().setActionError(instanceKey, error, "Error");
    }
  } finally {
    canvasProgress.clearTrackedStatuses();
    options.signal?.removeEventListener("abort", abortFromExternalSignal);
  }

  return store.getState().instances[instanceKey];
}

function isAbortLikeError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.message.toLowerCase().includes("aborted"))
  );
}

export const BackgroundActionsReactContext = createContext<StoreApi<BackgroundActionsStore> | null>(null);

export function BackgroundActionsProvider({ children }: { children: ReactNode }) {
  const app = useApp();
  const store = useMemo(() => createBackgroundActionsStore(), []);
  const definitions = app.layout.backgroundActions || [];

  useEffect(() => {
    store.getState().setDefinitions(definitions);
  }, [store, definitions]);

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
