import { createStore } from "zustand";
import {
  disablePluginInConfig,
  enablePluginInConfig,
  normalisePluginAppConfig,
  normalisePluginAppsConfig,
  pluginAppConfigEquals,
} from "./PluginContext.helpers";
import type { Config } from "../ConfigContext/ConfigContext";
import type {
  MappedPlugin,
  PluginAppConfig,
  PluginConfigScope,
  PluginStore,
} from "./PluginContext.types";

export function createPluginStore({
  plugins = [],
  enabled = [],
  disabled = [],
  globalPluginConfig,
}: {
  plugins?: MappedPlugin[];
  enabled?: string[];
  disabled?: string[];
  globalPluginConfig?: Config["plugins"];
} = {}) {
  const unique = (values: string[] = []) => Array.from(new Set(values.filter(Boolean)));

  return createStore<PluginStore>((set) => ({
    plugins,
    enabled: unique(enabled),
    disabled: unique(disabled),
    globalApps: normalisePluginAppsConfig(globalPluginConfig),
    apps: {},

    setProviderState(state) {
      set((prev) => ({
        ...prev,
        plugins: state.plugins || [],
        enabled: unique(state.enabled || []),
        disabled: unique(state.disabled || []),
        globalApps: normalisePluginAppsConfig(state.globalPluginConfig),
      }));
    },

    setAppConfig(appId, config) {
      const nextConfig = normalisePluginAppConfig(config);
      set((prev) => {
        if (pluginAppConfigEquals(prev.apps[appId], nextConfig)) {
          return prev;
        }

        return {
          ...prev,
          apps: {
            ...prev.apps,
            [appId]: nextConfig,
          },
        };
      });
    },

    setGlobalConfig(config) {
      set((prev) => ({
        ...prev,
        globalApps: normalisePluginAppsConfig(config),
      }));
    },

    setGlobalAppConfig(appId, config) {
      const nextConfig = normalisePluginAppConfig(config);
      set((prev) => {
        if (pluginAppConfigEquals(prev.globalApps[appId], nextConfig)) {
          return prev;
        }

        return {
          ...prev,
          globalApps: {
            ...prev.globalApps,
            [appId]: nextConfig,
          },
        };
      });
    },

    enable(appId, id, scope: PluginConfigScope = "workspace") {
      set((prev) => ({
        ...prev,
        ...(scope === "global"
          ? {
              globalApps: {
                ...prev.globalApps,
                [appId]: enablePluginInConfig(prev.globalApps[appId], id),
              },
            }
          : {
              apps: {
                ...prev.apps,
                [appId]: enablePluginInConfig(prev.apps[appId], id),
              },
            }),
      }));
    },

    disable(appId, id, scope: PluginConfigScope = "workspace") {
      set((prev) => ({
        ...prev,
        ...(scope === "global"
          ? {
              globalApps: {
                ...prev.globalApps,
                [appId]: disablePluginInConfig(prev.globalApps[appId], id),
              },
            }
          : {
              apps: {
                ...prev.apps,
                [appId]: disablePluginInConfig(prev.apps[appId], id),
              },
            }),
      }));
    },
  }));
}
