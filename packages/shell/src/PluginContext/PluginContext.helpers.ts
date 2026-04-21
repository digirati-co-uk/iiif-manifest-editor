import type { AppExtension, MappedApp } from "../AppContext/AppContext";
import { mergeBackgroundActionDefinitions } from "../BackgroundTasks/BackgroundTasksStore";
import { mergePartialConfig } from "../ConfigContext/ConfigContext";
import { extendApp } from "../helpers";
import type {
  MappedPlugin,
  PluginAppConfig,
  PluginHostApp,
  PluginModule,
  PluginStoreSnapshot,
} from "./PluginContext.types";

type ExtensionListKey =
  | "leftPanels"
  | "centerPanels"
  | "rightPanels"
  | "modalPanels"
  | "annotations"
  | "canvasEditors"
  | "editors"
  | "creators"
  | "background"
  | "backgroundActions";

const extensionListKeys: ExtensionListKey[] = [
  "leftPanels",
  "centerPanels",
  "rightPanels",
  "modalPanels",
  "annotations",
  "canvasEditors",
  "editors",
  "creators",
  "background",
  "backgroundActions",
];

const emptyPluginState: PluginStoreSnapshot = {
  plugins: [],
  enabled: [],
  disabled: [],
  apps: {},
};

export function getEmptyPluginState(): PluginStoreSnapshot {
  return emptyPluginState;
}

function unique(values: string[] = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function enablePluginInConfig(config: PluginAppConfig = {}, id: string): PluginAppConfig {
  return {
    ...config,
    enabled: unique([...(config.enabled || []).filter((existing) => existing !== id), id]),
    disabled: (config.disabled || []).filter((existing) => existing !== id),
  };
}

export function disablePluginInConfig(config: PluginAppConfig = {}, id: string): PluginAppConfig {
  return {
    ...config,
    enabled: (config.enabled || []).filter((existing) => existing !== id),
    disabled: unique([...(config.disabled || []).filter((existing) => existing !== id), id]),
  };
}

export function pluginAppConfigEquals(a: PluginAppConfig = {}, b: PluginAppConfig = {}) {
  const aEnabled = a.enabled || [];
  const bEnabled = b.enabled || [];
  const aDisabled = a.disabled || [];
  const bDisabled = b.disabled || [];

  return (
    aEnabled.length === bEnabled.length &&
    aEnabled.every((id, index) => id === bEnabled[index]) &&
    aDisabled.length === bDisabled.length &&
    aDisabled.every((id, index) => id === bDisabled[index]) &&
    JSON.stringify(a.settings || {}) === JSON.stringify(b.settings || {})
  );
}

export function mapPlugin(input: PluginModule, map?: (plugin: MappedPlugin) => MappedPlugin): MappedPlugin {
  const { default: metadata, config, ...props } = input;
  const plugin: MappedPlugin = {
    metadata,
    extension: {
      ...(props as AppExtension),
      config,
    },
  };

  return map ? map(plugin) : plugin;
}

export function isMappedPlugin(input: PluginModule | MappedPlugin): input is MappedPlugin {
  return !!input && "metadata" in input && "extension" in input;
}

export function normalisePlugin(input: PluginModule | MappedPlugin): MappedPlugin {
  return isMappedPlugin(input) ? input : mapPlugin(input);
}

export function normalisePlugins(plugins: Array<PluginModule | MappedPlugin> = []): MappedPlugin[] {
  return plugins.map(normalisePlugin);
}

export function isPluginCompatible(plugin: MappedPlugin, app?: PluginHostApp | null, appId?: string | null) {
  const supports = plugin.metadata.supports;
  if (!supports) return true;

  if (supports.apps?.length) {
    const appIds = new Set([appId, app?.metadata.id].filter(Boolean));
    if (!supports.apps.some((supportedAppId) => appIds.has(supportedAppId))) {
      return false;
    }
  }

  if (supports.projectTypes?.length) {
    const projectType = app?.metadata.projectType;
    if (!projectType || !supports.projectTypes.includes(projectType)) {
      return false;
    }
  }

  return true;
}

export function isPluginSelected(plugin: MappedPlugin, state: PluginStoreSnapshot, appId?: string | null) {
  const appConfig = appId ? state.apps[appId] : undefined;
  const id = plugin.metadata.id;

  if (appConfig?.disabled?.includes(id)) return false;
  if (appConfig?.enabled?.includes(id)) return true;
  if (state.disabled.includes(id)) return false;
  if (state.enabled.includes(id)) return true;

  return plugin.metadata.defaultEnabled === true;
}

export function getEnabledPluginsForApp(
  state: PluginStoreSnapshot,
  app?: PluginHostApp | null,
  appId?: string | null,
): MappedPlugin[] {
  const enabled: MappedPlugin[] = [];
  const activeIds = new Set<string>();

  for (const plugin of state.plugins) {
    if (!isPluginCompatible(plugin, app, appId)) {
      continue;
    }

    if (!isPluginSelected(plugin, state, appId)) {
      continue;
    }

    const missingDependencies = (plugin.metadata.dependencies || []).filter((dependency) => !activeIds.has(dependency));
    if (missingDependencies.length) {
      warnPlugin(
        `Plugin "${plugin.metadata.id}" was not enabled because dependencies are missing or later in the plugin order: ${missingDependencies.join(", ")}`,
      );
      continue;
    }

    enabled.push(plugin);
    activeIds.add(plugin.metadata.id);
  }

  return enabled;
}

function getLayoutList(app: MappedApp, key: ExtensionListKey): Array<{ id: string }> {
  if (key === "modalPanels") {
    return (app.layout.modals || []) as Array<{ id: string }>;
  }
  return ((app.layout as any)[key] || []) as Array<{ id: string }>;
}

function warnPlugin(message: string) {
  const processEnv = (globalThis as any).process?.env;
  if (processEnv?.NODE_ENV === "production") return;
  console.warn(`[manifest-editor/plugin] ${message}`);
}

function filterPluginList<T extends { id: string }>(
  plugin: MappedPlugin,
  key: ExtensionListKey,
  existing: Set<string>,
  items: T[] | undefined,
) {
  if (!items?.length) return undefined;

  const next: T[] = [];
  for (const item of items) {
    if (existing.has(item.id)) {
      warnPlugin(`Plugin "${plugin.metadata.id}" contribution "${item.id}" for "${key}" was skipped because that id already exists.`);
      continue;
    }

    existing.add(item.id);
    next.push(item);
  }

  return next.length ? next : undefined;
}

function sanitisePluginExtension(app: MappedApp, plugin: MappedPlugin): AppExtension {
  const extension = plugin.extension;
  const next: AppExtension = {
    config: extension.config,
    disableSideEffects: extension.disableSideEffects,
  };

  for (const key of extensionListKeys) {
    const existing = new Set(getLayoutList(app, key).map((item) => item.id));
    const filtered = filterPluginList(plugin, key, existing, (extension as any)[key]);
    if (filtered) {
      (next as any)[key] = filtered;
    }
  }

  return next;
}

export function applyPlugins(app: MappedApp, plugins: MappedPlugin[], appId?: string): MappedApp {
  if (!plugins.length) return app;

  let nextApp = app;
  const activeIds = new Set<string>();

  for (const plugin of plugins) {
    if (!isPluginCompatible(plugin, app, appId)) {
      continue;
    }

    const missingDependencies = (plugin.metadata.dependencies || []).filter((dependency) => !activeIds.has(dependency));
    if (missingDependencies.length) {
      warnPlugin(
        `Plugin "${plugin.metadata.id}" was not applied because dependencies are missing or later in the plugin order: ${missingDependencies.join(", ")}`,
      );
      continue;
    }

    const extension = sanitisePluginExtension(nextApp, plugin);
    nextApp = extendApp(nextApp, nextApp.metadata, extension);
    activeIds.add(plugin.metadata.id);
  }

  return {
    ...nextApp,
    config: mergePartialConfig(
      app.config || {},
      ...plugins
        .filter((plugin) => activeIds.has(plugin.metadata.id))
        .map((plugin) => plugin.extension.config || {}),
      nextApp.config || {},
    ),
    layout: {
      ...nextApp.layout,
      backgroundActions: mergeBackgroundActionDefinitions([], nextApp.layout.backgroundActions || []),
    },
  };
}
