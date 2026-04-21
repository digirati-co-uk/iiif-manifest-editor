import { createStore } from "zustand";
import {
  disablePluginInConfig,
  enablePluginInConfig,
  pluginAppConfigEquals,
} from "./PluginContext.helpers";
import type {
  MappedPlugin,
  PluginAppConfig,
  PluginStore,
} from "./PluginContext.types";

function unique(values: string[] = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normaliseAppConfig(config: PluginAppConfig = {}): PluginAppConfig {
  return {
    ...config,
    enabled: unique(config.enabled || []),
    disabled: unique(config.disabled || []),
  };
}

export function createPluginStore({
  plugins = [],
  enabled = [],
  disabled = [],
}: {
  plugins?: MappedPlugin[];
  enabled?: string[];
  disabled?: string[];
} = {}) {
  return createStore<PluginStore>((set) => ({
    plugins,
    enabled: unique(enabled),
    disabled: unique(disabled),
    apps: {},

    setProviderState(state) {
      set((prev) => ({
        ...prev,
        plugins: state.plugins || [],
        enabled: unique(state.enabled || []),
        disabled: unique(state.disabled || []),
      }));
    },

    setAppConfig(appId, config) {
      const nextConfig = normaliseAppConfig(config);
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

    enable(appId, id) {
      set((prev) => ({
        ...prev,
        apps: {
          ...prev.apps,
          [appId]: enablePluginInConfig(prev.apps[appId], id),
        },
      }));
    },

    disable(appId, id) {
      set((prev) => ({
        ...prev,
        apps: {
          ...prev.apps,
          [appId]: disablePluginInConfig(prev.apps[appId], id),
        },
      }));
    },
  }));
}
