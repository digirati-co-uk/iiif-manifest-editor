import { createContext, createElement, type ReactNode, useContext, useEffect, useMemo } from "react";
import { createStore, type StoreApi, useStore } from "zustand";
import { useApp } from "../AppContext/AppContext";
import {
  type BackgroundActionDefinition,
  type BackgroundActionError,
  type BackgroundActionGroup,
  type BackgroundActionInstance,
  type BackgroundActionRunContext,
  type BackgroundActionStatus,
  type BackgroundActionSystemContext,
  type BackgroundActionTarget,
  type BackgroundActionContext,
} from "./BackgroundTasks.types";

export interface BackgroundActionsStore {
  definitions: BackgroundActionDefinition[];
  instances: Record<string, BackgroundActionInstance>;
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

function updateInstance(
  instances: Record<string, BackgroundActionInstance>,
  instanceKey: string,
  update: Partial<BackgroundActionInstance>,
) {
  const instance = instances[instanceKey];
  if (!instance) {
    return instances;
  }

  return {
    ...instances,
    [instanceKey]: {
      ...instance,
      ...update,
    },
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
    controllers: {},

    setDefinitions(definitions) {
      set((prev) => {
        const nextDefinitions = mergeBackgroundActionDefinitions([], definitions);
        const nextDefinitionIds = new Set(nextDefinitions.map((definition) => definition.id));
        const nextInstances: Record<string, BackgroundActionInstance> = {};

        for (const [key, instance] of Object.entries(prev.instances)) {
          if (nextDefinitionIds.has(instance.actionId)) {
            nextInstances[key] = instance;
          }
        }

        return {
          definitions: nextDefinitions,
          instances: nextInstances,
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
          controllers,
        };
      });
    },

    resetAction(instanceKey) {
      set((prev) => {
        prev.controllers[instanceKey]?.abort();
        const instances = { ...prev.instances };
        const controllers = { ...prev.controllers };
        delete instances[instanceKey];
        delete controllers[instanceKey];
        return { instances, controllers };
      });
    },

    startAction(instanceKey, definition, target, controller) {
      set((prev) => ({
        instances: {
          ...prev.instances,
          [instanceKey]: {
            id: instanceKey,
            actionId: definition.id,
            target,
            label: definition.label,
            status: "preparing",
            statusText: "Preparing",
            error: null,
            result: undefined,
            resultsAvailable: false,
            startedAt: Date.now(),
            completedAt: undefined,
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

      set((prev) => ({
        instances: updateInstance(prev.instances, instanceKey, {
          status: "running",
          statusText: "Cancelling",
        }),
      }));
      controller.abort();
    },

    setActionLabel(instanceKey, label) {
      set((prev) => ({
        instances: updateInstance(prev.instances, instanceKey, { label }),
      }));
    },

    setActionStatus(instanceKey, status, statusText) {
      const completedAt = isCompletedStatus(status) ? Date.now() : undefined;
      set((prev) => ({
        instances: updateInstance(prev.instances, instanceKey, { status, statusText, completedAt }),
        controllers: isActiveStatus(status)
          ? prev.controllers
          : Object.fromEntries(Object.entries(prev.controllers).filter(([key]) => key !== instanceKey)),
      }));
    },

    setActionError(instanceKey, error, statusText) {
      set((prev) => ({
        instances: updateInstance(prev.instances, instanceKey, {
          status: "error",
          statusText,
          error: normaliseBackgroundActionError(error),
          completedAt: Date.now(),
        }),
        controllers: Object.fromEntries(Object.entries(prev.controllers).filter(([key]) => key !== instanceKey)),
      }));
    },

    setResult(instanceKey, result) {
      set((prev) => ({
        instances: updateInstance(prev.instances, instanceKey, { result }),
      }));
    },

    setResultsAvailable(instanceKey, available) {
      set((prev) => ({
        instances: updateInstance(prev.instances, instanceKey, { resultsAvailable: available }),
      }));
    },
  }));
}

function createRunContext(options: RunBackgroundActionOptions, signal: AbortSignal): BackgroundActionRunContext {
  const { store, context } = options;
  const { instanceKey } = context;

  return {
    ...context,
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
      const prepareResult = await definition.prepare(createRunContext(options, signal));
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
    const result = await definition.run(createRunContext(options, signal));

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
      store.getState().setActionStatus(instanceKey, "complete", "Complete");
      if (typeof result !== "undefined" || latest?.resultsAvailable) {
        store.getState().setResultsAvailable(instanceKey, true);
      }
    }
  } catch (error) {
    if (signal.aborted || isAbortLikeError(error)) {
      store.getState().setActionStatus(instanceKey, "cancelled", "Cancelled");
    } else {
      store.getState().setActionError(instanceKey, error, "Error");
    }
  } finally {
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
