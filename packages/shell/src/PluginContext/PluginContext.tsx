import {
  createContext,
  createElement,
  type ReactElement,
  type ReactNode,
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
import type { Config } from "../ConfigContext/ConfigContext";
import {
  applyPlugins,
  getEmptyPluginState,
  getEnabledPluginsForApp,
  normalisePlugins,
} from "./PluginContext.helpers";
import { createPluginStore } from "./PluginContext.store";
import type {
  MappedPlugin,
  PluginModule,
  PluginStore,
  PluginStoreSnapshot,
} from "./PluginContext.types";

export const PluginReactContext = createContext<StoreApi<PluginStore> | null>(null);

export function PluginProvider({
  plugins,
  enabled,
  disabled,
  children,
}: {
  plugins: Array<PluginModule | MappedPlugin>;
  enabled?: string[];
  disabled?: string[];
  children: ReactNode;
}): ReactElement {
  const mappedPlugins = useMemo(() => normalisePlugins(plugins), [plugins]);
  const store = useMemo(
    () => createPluginStore({ plugins: mappedPlugins, enabled, disabled }),
    [],
  );

  useEffect(() => {
    store.getState().setProviderState({
      plugins: mappedPlugins,
      enabled,
      disabled,
    });
  }, [store, mappedPlugins, enabled, disabled]);

  return createElement(PluginReactContext.Provider, { value: store }, children);
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
  enable(appId: string, id: string): void;
  disable(appId: string, id: string): void;
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
      };
    }

    return {
      enable(appId: string, id: string) {
        store.getState().enable(appId, id);
      },
      disable(appId: string, id: string) {
        store.getState().disable(appId, id);
      },
    };
  }, [store]);
}

export function useResolvedPluginApp(definition: MappedApp, appId: string): MappedApp {
  const state = usePlugins();
  const enabledPlugins = useMemo(
    () => getEnabledPluginsForApp(state, definition, appId),
    [state, definition, appId],
  );

  return useMemo(
    () => applyPlugins(definition, enabledPlugins, appId),
    [definition, enabledPlugins, appId],
  );
}

export function PluginConfigBridge({ config }: { config?: Partial<Config> }) {
  const app = useContext(AppReactContext);
  const store = useOptionalPluginStoreApi();
  const appId = app?.appId;
  const appConfig = appId ? config?.plugins?.apps?.[appId] : undefined;

  useEffect(() => {
    if (!store || !appId || !appConfig) {
      return;
    }

    store.getState().setAppConfig(appId, appConfig);
  }, [store, appId, appConfig]);

  return null;
}
