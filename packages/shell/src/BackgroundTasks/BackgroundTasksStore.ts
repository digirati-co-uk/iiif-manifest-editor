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
  setDefinitions(definitions: BackgroundActionDefinition[]): void;
  registerAction(definition: BackgroundActionDefinition): () => void;
  unregisterAction(id: string): void;
  resetAction(instanceKey: string): void;
  startAction(instanceKey: string, definition: BackgroundActionDefinition, target: BackgroundActionTarget): void;
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

export function createBackgroundActionsStore(initialDefinitions: BackgroundActionDefinition[] = []) {
  return createStore<BackgroundActionsStore>((set, get) => ({
    definitions: mergeBackgroundActionDefinitions([], initialDefinitions),
    instances: {},

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

        return {
          definitions: prev.definitions.filter((definition) => definition.id !== id),
          instances,
        };
      });
    },

    resetAction(instanceKey) {
      set((prev) => {
        const instances = { ...prev.instances };
        delete instances[instanceKey];
        return { instances };
      });
    },

    startAction(instanceKey, definition, target) {
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
      }));
    },

    setActionLabel(instanceKey, label) {
      set((prev) => ({
        instances: updateInstance(prev.instances, instanceKey, { label }),
      }));
    },

    setActionStatus(instanceKey, status, statusText) {
      const completedAt = status === "complete" || status === "error" ? Date.now() : undefined;
      set((prev) => ({
        instances: updateInstance(prev.instances, instanceKey, { status, statusText, completedAt }),
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

  const signal = options.signal || new AbortController().signal;

  store.getState().startAction(instanceKey, definition, target);

  try {
    if (definition.prepare) {
      const prepareResult = await definition.prepare(createRunContext(options, signal));
      if (prepareResult === false) {
        store.getState().setActionStatus(instanceKey, "idle");
        return store.getState().instances[instanceKey];
      }
    }

    store.getState().setActionStatus(instanceKey, "running", "Running");
    const result = await definition.run(createRunContext(options, signal));

    if (typeof result !== "undefined") {
      store.getState().setResult(instanceKey, result);
    }

    const latest = store.getState().instances[instanceKey];
    if (latest?.status !== "error") {
      store.getState().setActionStatus(instanceKey, "complete", "Complete");
      if (typeof result !== "undefined" || latest?.resultsAvailable) {
        store.getState().setResultsAvailable(instanceKey, true);
      }
    }
  } catch (error) {
    store.getState().setActionError(instanceKey, error, "Error");
  }

  return store.getState().instances[instanceKey];
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
