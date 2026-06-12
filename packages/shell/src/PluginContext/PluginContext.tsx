import {
  createContext,
  createElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { type StoreApi, useStore } from "zustand";
import {
  AppReactContext,
  type MappedApp,
  PrimeAppReactContext,
} from "../AppContext/AppContext";
import { type Config, useConfig, useSaveConfig } from "../ConfigContext/ConfigContext";
import {
  applyPlugins,
  createPluginRuntimeApi,
  getEmptyPluginState,
  getEnabledPluginsForApp,
  getEffectivePluginSettings,
  getPluginDefaultSettings,
  getPluginSettingsFromConfig,
  normalisePlugin,
  normalisePlugins,
  resetPluginSettingsInConfig,
  setPluginSettingsInConfig,
} from "./PluginContext.helpers";
import { createPluginStore } from "./PluginContext.store";
import type {
  MappedPlugin,
  PluginAppConfig,
  PluginConfigScope,
  PluginRuntimeApi,
  PluginSettingsValue,
  PluginStore,
  PluginStoreSnapshot,
  PluginInput,
} from "./PluginContext.types";

export const PluginReactContext = createContext<StoreApi<PluginStore> | null>(null);
export const PluginGlobalConfigReactContext = createContext<{
  globalPluginConfig?: Config["plugins"];
  saveGlobalPluginConfig?: (config: Config["plugins"]) => void | Promise<void>;
}>({});

export function PluginProvider({
  plugins,
  enabled,
  disabled,
  globalPluginConfig,
  saveGlobalPluginConfig,
  children,
}: {
  plugins: PluginInput[];
  enabled?: string[];
  disabled?: string[];
  globalPluginConfig?: Config["plugins"];
  saveGlobalPluginConfig?: (config: Config["plugins"]) => void | Promise<void>;
  children: ReactNode;
}): ReactElement {
  const mappedPlugins = useMemo(() => normalisePlugins(plugins), [plugins]);
  const store = useMemo(
    () => createPluginStore({ plugins: mappedPlugins, enabled, disabled, globalPluginConfig }),
    [],
  );

  useEffect(() => {
    store.getState().setProviderState({
      plugins: mappedPlugins,
      enabled,
      disabled,
      globalPluginConfig,
    });
  }, [store, mappedPlugins, enabled, disabled, globalPluginConfig]);

  const globalConfigContext = useMemo(
    () => ({ globalPluginConfig, saveGlobalPluginConfig }),
    [globalPluginConfig, saveGlobalPluginConfig],
  );

  return createElement(
    PluginGlobalConfigReactContext.Provider,
    { value: globalConfigContext },
    createElement(PluginReactContext.Provider, { value: store }, children),
  );
}

export function useOptionalPluginStoreApi() {
  return useContext(PluginReactContext);
}

export function usePluginStoreApi() {
  const store = useOptionalPluginStoreApi();
  if (!store) {
    throw new Error("usePluginStoreApi must be used within <PluginProvider />");
  }
  return store;
}

function usePluginStore<T>(selector: (state: PluginStoreSnapshot) => T): T {
  const store = useOptionalPluginStoreApi();
  if (!store) {
    return selector(getEmptyPluginState());
  }
  return useStore(store, selector);
}

export function usePlugins(): PluginStoreSnapshot {
  return usePluginStore((state) => ({
    plugins: state.plugins,
    enabled: state.enabled,
    disabled: state.disabled,
    globalApps: state.globalApps,
    apps: state.apps,
  }));
}

export function useEnabledPlugins(appId?: string): MappedPlugin[] {
  const appContext = useContext(AppReactContext);
  const app = useContext(PrimeAppReactContext);
  const state = usePlugins();
  const resolvedAppId = appId || appContext?.appId;

  return useMemo(
    () => getEnabledPluginsForApp(state, app, resolvedAppId),
    [state, app, resolvedAppId],
  );
}

export function usePluginActions(): {
  enable(appId: string, id: string, scope?: PluginConfigScope): void;
  disable(appId: string, id: string, scope?: PluginConfigScope): void;
  setAppConfig(appId: string, config: PluginAppConfig): void;
  setGlobalAppConfig(appId: string, config: PluginAppConfig): void;
} {
  const store = useOptionalPluginStoreApi();

  return useMemo(() => {
    if (!store) {
      return {
        enable() {
          // no-op
        },
        disable() {
          // no-op
        },
        setAppConfig() {
          // no-op
        },
        setGlobalAppConfig() {
          // no-op
        },
      };
    }

    return {
      enable(appId: string, id: string, scope?: PluginConfigScope) {
        store.getState().enable(appId, id, scope || "workspace");
      },
      disable(appId: string, id: string, scope?: PluginConfigScope) {
        store.getState().disable(appId, id, scope || "workspace");
      },
      setAppConfig(appId: string, config: PluginAppConfig) {
        store.getState().setAppConfig(appId, config);
      },
      setGlobalAppConfig(appId: string, config: PluginAppConfig) {
        store.getState().setGlobalAppConfig(appId, config);
      },
    };
  }, [store]);
}

export function usePluginRuntimeApi(appId?: string): PluginRuntimeApi {
  const appContext = useContext(AppReactContext);
  const state = usePlugins();
  const resolvedAppId = appId || appContext?.appId;

  return useMemo(() => createPluginRuntimeApi(state, resolvedAppId), [state, resolvedAppId]);
}

export function usePluginSettings<T extends PluginSettingsValue = PluginSettingsValue>(
  pluginId: string,
  appId?: string,
): T {
  const appContext = useContext(AppReactContext);
  const state = usePlugins();
  const resolvedAppId = appId || appContext?.appId;

  return useMemo(
    () => getEffectivePluginSettings<T>(state, pluginId, resolvedAppId),
    [state, pluginId, resolvedAppId],
  );
}

export function usePluginConfigApi<T extends PluginSettingsValue = PluginSettingsValue>(
  pluginId: string,
  appId?: string,
) {
  const appContext = useContext(AppReactContext);
  const store = useOptionalPluginStoreApi();
  const state = usePlugins();
  const config = useConfig();
  const saveConfig = useSaveConfig();
  const { saveGlobalPluginConfig } = useContext(PluginGlobalConfigReactContext);
  const resolvedAppId = appId || appContext?.appId || "";
  const plugin = state.plugins.find((item) => item.metadata.id === pluginId) || null;
  const globalAppConfig = resolvedAppId ? state.globalApps[resolvedAppId] : undefined;
  const workspaceAppConfig = resolvedAppId ? state.apps[resolvedAppId] : undefined;

  const defaults = useMemo(() => getPluginDefaultSettings<T>(plugin || undefined), [plugin]);
  const global = useMemo(
    () => getPluginSettingsFromConfig<T>(globalAppConfig, pluginId) as T,
    [globalAppConfig, pluginId],
  );
  const workspace = useMemo(
    () => getPluginSettingsFromConfig<T>(workspaceAppConfig, pluginId) as T,
    [workspaceAppConfig, pluginId],
  );
  const effective = useMemo(
    () => getEffectivePluginSettings<T>(state, pluginId, resolvedAppId),
    [state, pluginId, resolvedAppId],
  );

  const persistWorkspaceAppConfig = useCallback(
    (nextAppConfig: PluginAppConfig) => {
      if (!resolvedAppId) return;
      store?.getState().setAppConfig(resolvedAppId, nextAppConfig);
      saveConfig({
        plugins: {
          ...(config.plugins || {}),
          apps: {
            ...(config.plugins?.apps || {}),
            [resolvedAppId]: nextAppConfig,
          },
        },
      });
    },
    [config.plugins, resolvedAppId, saveConfig, store],
  );

  const setWorkspaceSettings = useCallback(
    (settings: T) => {
      persistWorkspaceAppConfig(setPluginSettingsInConfig(workspaceAppConfig || {}, pluginId, settings));
    },
    [persistWorkspaceAppConfig, pluginId, workspaceAppConfig],
  );

  const resetWorkspaceSettings = useCallback(() => {
    persistWorkspaceAppConfig(resetPluginSettingsInConfig(workspaceAppConfig || {}, pluginId));
  }, [persistWorkspaceAppConfig, pluginId, workspaceAppConfig]);

  const persistGlobalAppConfig = useCallback(
    async (nextAppConfig: PluginAppConfig) => {
      if (!resolvedAppId || !saveGlobalPluginConfig) return;

      const previousAppConfig = state.globalApps[resolvedAppId] || {};
      const nextGlobalConfig: Config["plugins"] = {
        apps: {
          ...state.globalApps,
          [resolvedAppId]: nextAppConfig,
        },
      };

      store?.getState().setGlobalAppConfig(resolvedAppId, nextAppConfig);

      try {
        await saveGlobalPluginConfig(nextGlobalConfig);
      } catch (error) {
        store?.getState().setGlobalAppConfig(resolvedAppId, previousAppConfig);
        throw error;
      }
    },
    [resolvedAppId, saveGlobalPluginConfig, state.globalApps, store],
  );

  const setGlobalSettings = useCallback(
    async (settings: T) => {
      await persistGlobalAppConfig(setPluginSettingsInConfig(globalAppConfig || {}, pluginId, settings));
    },
    [globalAppConfig, persistGlobalAppConfig, pluginId],
  );

  const resetGlobalSettings = useCallback(async () => {
    await persistGlobalAppConfig(resetPluginSettingsInConfig(globalAppConfig || {}, pluginId));
  }, [globalAppConfig, persistGlobalAppConfig, pluginId]);

  return {
    plugin,
    appId: resolvedAppId,
    defaults,
    global,
    workspace,
    effective,
    canSaveGlobal: !!saveGlobalPluginConfig,
    setWorkspaceSettings,
    resetWorkspaceSettings,
    setGlobalSettings,
    resetGlobalSettings,
  };
}

export function useResolvedPluginApp(definition: MappedApp, appId: string): MappedApp {
  const state = usePlugins();
  const store = useOptionalPluginStoreApi();
  const enabledPlugins = useMemo(
    () => getEnabledPluginsForApp(state, definition, appId),
    [state, definition, appId],
  );

  useEffect(() => {
    if (!store) {
      return;
    }

    for (const plugin of enabledPlugins) {
      if (
        !plugin.load ||
        plugin.loadStatus === "loading" ||
        plugin.loadStatus === "loaded" ||
        plugin.loadStatus === "error"
      ) {
        continue;
      }

      store.getState().setPluginLoading(plugin.metadata.id);
      plugin
        .load()
        .then((loadedPlugin) => {
          store.getState().setPluginLoaded(plugin.metadata.id, normalisePlugin(loadedPlugin));
        })
        .catch((error) => {
          store
            .getState()
            .setPluginLoadError(plugin.metadata.id, getPluginLoadErrorMessage(error));
        });
    }
  }, [store, enabledPlugins]);

  return useMemo(
    () =>
      applyPlugins(
        definition,
        enabledPlugins.filter((plugin) => !plugin.load || plugin.loadStatus === "loaded"),
        appId,
      ),
    [definition, enabledPlugins, appId],
  );
}

function getPluginLoadErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Plugin failed to load.";
}

export function PluginConfigBridge({ config }: { config?: Partial<Config> }) {
  const app = useContext(AppReactContext);
  const store = useOptionalPluginStoreApi();
  const appId = app?.appId;
  const appConfig = appId ? config?.plugins?.apps?.[appId] : undefined;

  useEffect(() => {
    if (!store || !appId) {
      return;
    }

    store.getState().setAppConfig(appId, appConfig || {});
  }, [store, appId, appConfig]);

  return null;
}
