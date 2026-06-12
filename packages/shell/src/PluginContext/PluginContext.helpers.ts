import type { AppExtension, MappedApp } from "../AppContext/AppContext";
import { mergeBackgroundActionDefinitions } from "../BackgroundTasks/BackgroundTasksStore";
import { mergePartialConfig } from "../ConfigContext/ConfigContext";
import { extendApp } from "../helpers";
import type {
  MappedPlugin,
  PluginAppConfig,
  PluginConfigScope,
  PluginHostApp,
  PluginInput,
  LazyPluginModule,
  PluginModule,
  PluginRuntimeApi,
  PluginSettingsValue,
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
  globalApps: {},
  apps: {},
};

export function getEmptyPluginState(): PluginStoreSnapshot {
  return emptyPluginState;
}

function unique(values: string[] = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function normalisePluginAppConfig(config: PluginAppConfig = {}): PluginAppConfig {
  return {
    ...config,
    enabled: unique(config.enabled || []),
    disabled: unique(config.disabled || []),
    settings: config.settings ? { ...config.settings } : undefined,
  };
}

export function normalisePluginAppsConfig(config?: { apps?: Record<string, PluginAppConfig> }) {
  const apps: Record<string, PluginAppConfig> = {};

  for (const [appId, appConfig] of Object.entries(config?.apps || {})) {
    apps[appId] = normalisePluginAppConfig(appConfig);
  }

  return apps;
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

export function resetPluginInConfig(config: PluginAppConfig = {}, id: string): PluginAppConfig {
  return {
    ...config,
    enabled: (config.enabled || []).filter((existing) => existing !== id),
    disabled: (config.disabled || []).filter((existing) => existing !== id),
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
  const { default: metadata, config, settings, ...props } = input;
  const plugin: MappedPlugin = {
    metadata,
    extension: {
      ...(props as AppExtension),
      config,
    },
    settings,
  };

  return map ? map(plugin) : plugin;
}

export function mapLazyPlugin(input: LazyPluginModule): MappedPlugin {
  return {
    metadata: input.default,
    extension: {},
    settings: input.settings,
    load: input.load,
    loadStatus: "idle",
  };
}

export function isMappedPlugin(input: PluginInput): input is MappedPlugin {
  return !!input && "metadata" in input && "extension" in input;
}

export function isLazyPlugin(input: PluginInput): input is LazyPluginModule {
  return !!input && "load" in input && "default" in input;
}

export function normalisePlugin(input: PluginInput): MappedPlugin {
  if (isMappedPlugin(input)) return input;
  if (isLazyPlugin(input)) return mapLazyPlugin(input);
  return mapPlugin(input);
}

export function normalisePlugins(plugins: PluginInput[] = []): MappedPlugin[] {
  return plugins.map(normalisePlugin);
}

export function mergeProviderPlugins(previous: MappedPlugin[], next: MappedPlugin[]) {
  const previousById = new Map(previous.map((plugin) => [plugin.metadata.id, plugin]));

  return next.map((plugin) => {
    const previousPlugin = previousById.get(plugin.metadata.id);
    if (!previousPlugin) return plugin;

    if (previousPlugin.loadStatus === "loaded" && plugin.load) {
      return {
        ...previousPlugin,
        metadata: plugin.metadata,
        load: plugin.load,
      };
    }

    if (previousPlugin.loadStatus === "loading" && plugin.load) {
      return {
        ...plugin,
        loadStatus: "loading" as const,
      };
    }

    if (previousPlugin.loadStatus === "error" && plugin.load) {
      return {
        ...plugin,
        loadStatus: "error" as const,
        loadError: previousPlugin.loadError,
      };
    }

    return plugin;
  });
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

export function getPluginCompatibilityReason(plugin: MappedPlugin, app?: PluginHostApp | null, appId?: string | null) {
  const supports = plugin.metadata.supports;
  if (!supports) return null;

  if (supports.apps?.length) {
    const appIds = new Set([appId, app?.metadata.id].filter(Boolean));
    if (!supports.apps.some((supportedAppId) => appIds.has(supportedAppId))) {
      return "This plugin does not support the current app.";
    }
  }

  if (supports.projectTypes?.length) {
    const projectType = app?.metadata.projectType;
    if (!projectType || !supports.projectTypes.includes(projectType)) {
      return "This plugin does not support the current project type.";
    }
  }

  return null;
}

export function isPluginSelected(plugin: MappedPlugin, state: PluginStoreSnapshot, appId?: string | null) {
  const appConfig = appId ? state.apps[appId] : undefined;
  const globalAppConfig = appId ? state.globalApps[appId] : undefined;
  const id = plugin.metadata.id;

  if (appConfig?.disabled?.includes(id)) return false;
  if (appConfig?.enabled?.includes(id)) return true;
  if (globalAppConfig?.disabled?.includes(id)) return false;
  if (globalAppConfig?.enabled?.includes(id)) return true;
  if (state.disabled.includes(id)) return false;
  if (state.enabled.includes(id)) return true;

  return plugin.metadata.defaultEnabled === true;
}

export function getPluginSelectionSource(
  plugin: MappedPlugin,
  state: PluginStoreSnapshot,
  appId?: string | null,
): PluginConfigScope | "provider" | "default" {
  const appConfig = appId ? state.apps[appId] : undefined;
  const globalAppConfig = appId ? state.globalApps[appId] : undefined;
  const id = plugin.metadata.id;

  if (appConfig?.disabled?.includes(id) || appConfig?.enabled?.includes(id)) return "workspace";
  if (globalAppConfig?.disabled?.includes(id) || globalAppConfig?.enabled?.includes(id)) return "global";
  if (state.disabled.includes(id) || state.enabled.includes(id)) return "provider";
  return "default";
}

export function getEnabledPluginsForApp(
  state: PluginStoreSnapshot,
  app?: PluginHostApp | null,
  appId?: string | null,
): MappedPlugin[] {
  const enabled: MappedPlugin[] = [];
  const activeIds = new Set<string>();
  const skippedIds = new Set<string>();
  const selected = new Set(
    state.plugins
      .filter((plugin) => isPluginCompatible(plugin, app, appId) && isPluginSelected(plugin, state, appId))
      .map((plugin) => plugin.metadata.id),
  );
  const byId = new Map(state.plugins.map((plugin) => [plugin.metadata.id, plugin]));
  const visiting = new Set<string>();

  function activate(plugin: MappedPlugin): boolean {
    const id = plugin.metadata.id;
    if (activeIds.has(id)) return true;
    if (skippedIds.has(id)) return false;

    if (visiting.has(id)) {
      warnPlugin(`Plugin "${id}" was not enabled because its dependency graph contains a cycle.`);
      skippedIds.add(id);
      return false;
    }

    visiting.add(id);

    for (const dependencyId of plugin.metadata.dependencies || []) {
      const dependency = byId.get(dependencyId);
      if (!dependency || !selected.has(dependencyId)) {
        warnPlugin(`Plugin "${id}" was not enabled because dependency "${dependencyId}" is not enabled.`);
        visiting.delete(id);
        skippedIds.add(id);
        return false;
      }

      if (!isPluginCompatible(dependency, app, appId)) {
        warnPlugin(`Plugin "${id}" was not enabled because dependency "${dependencyId}" is not compatible.`);
        visiting.delete(id);
        skippedIds.add(id);
        return false;
      }

      if (!activate(dependency)) {
        visiting.delete(id);
        skippedIds.add(id);
        return false;
      }
    }

    visiting.delete(id);
    enabled.push(plugin);
    activeIds.add(id);
    return true;
  }

  for (const plugin of state.plugins) {
    if (!isPluginCompatible(plugin, app, appId)) {
      continue;
    }

    if (!isPluginSelected(plugin, state, appId)) {
      continue;
    }

    activate(plugin);
  }

  return enabled;
}

export function getPluginSettingsFromConfig<T extends PluginSettingsValue = PluginSettingsValue>(
  config: PluginAppConfig | undefined,
  pluginId: string,
): Partial<T> {
  const settings = config?.settings?.[pluginId];
  return isPlainObject(settings) ? (settings as Partial<T>) : {};
}

export function setPluginSettingsInConfig<T extends PluginSettingsValue = PluginSettingsValue>(
  config: PluginAppConfig = {},
  pluginId: string,
  settings: T,
): PluginAppConfig {
  return {
    ...config,
    settings: {
      ...(config.settings || {}),
      [pluginId]: settings,
    },
  };
}

export function resetPluginSettingsInConfig(config: PluginAppConfig = {}, pluginId: string): PluginAppConfig {
  const settings = { ...(config.settings || {}) };
  delete settings[pluginId];

  return {
    ...config,
    settings,
  };
}

export function getPluginDefaultSettings<T extends PluginSettingsValue = PluginSettingsValue>(
  plugin?: MappedPlugin,
): T {
  return ({ ...(plugin?.settings?.defaults || {}) } as unknown) as T;
}

export function getEffectivePluginSettings<T extends PluginSettingsValue = PluginSettingsValue>(
  state: PluginStoreSnapshot,
  pluginId: string,
  appId?: string | null,
): T {
  const plugin = state.plugins.find((item) => item.metadata.id === pluginId);
  const globalAppConfig = appId ? state.globalApps[appId] : undefined;
  const workspaceAppConfig = appId ? state.apps[appId] : undefined;

  return {
    ...getPluginDefaultSettings<T>(plugin),
    ...getPluginSettingsFromConfig<T>(globalAppConfig, pluginId),
    ...getPluginSettingsFromConfig<T>(workspaceAppConfig, pluginId),
  };
}

export function createPluginRuntimeApi(state: PluginStoreSnapshot, appId?: string | null): PluginRuntimeApi {
  return {
    getSettings<T extends PluginSettingsValue = PluginSettingsValue>(pluginId: string): T {
      return getEffectivePluginSettings<T>(state, pluginId, appId);
    },
  };
}

export function enablePluginAndDependenciesInConfig(
  config: PluginAppConfig,
  state: PluginStoreSnapshot,
  plugin: MappedPlugin,
  app?: PluginHostApp | null,
  appId?: string | null,
): { config: PluginAppConfig; enabledIds: string[]; blocked: string[] } {
  const byId = new Map(state.plugins.map((item) => [item.metadata.id, item]));
  const enabledIds: string[] = [];
  const blocked: string[] = [];
  const visiting = new Set<string>();
  let nextConfig = config;

  function enableOne(current: MappedPlugin) {
    const id = current.metadata.id;
    if (enabledIds.includes(id)) return;
    if (visiting.has(id)) {
      blocked.push(`${id} has a circular dependency`);
      return;
    }

    visiting.add(id);

    for (const dependencyId of current.metadata.dependencies || []) {
      const dependency = byId.get(dependencyId);
      if (!dependency) {
        blocked.push(`${dependencyId} is not available`);
        continue;
      }

      if (!isPluginCompatible(dependency, app, appId)) {
        blocked.push(`${dependency.metadata.label} is not compatible`);
        continue;
      }

      enableOne(dependency);
    }

    visiting.delete(id);
    nextConfig = enablePluginInConfig(nextConfig, id);
    enabledIds.push(id);
  }

  enableOne(plugin);

  if (blocked.length) {
    return { config, enabledIds: [], blocked };
  }

  return { config: nextConfig, enabledIds, blocked };
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

  // Reorder leftPanels: built-ins first, then plugin panels (with separator before first),
  // then divide panels (e.g. settings) always last.
  const originalIds = new Set(app.layout.leftPanels.map((p) => p.id));
  const dividePanels = nextApp.layout.leftPanels.filter((p) => p.divide);
  const nonDividePanels = nextApp.layout.leftPanels.filter((p) => !p.divide);

  let firstPluginPanelMarked = false;
  const orderedPanels = nonDividePanels.map((panel) => {
    if (!firstPluginPanelMarked && !originalIds.has(panel.id)) {
      firstPluginPanelMarked = true;
      return { ...panel, separator: true };
    }
    return panel;
  });

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
      leftPanels: [...orderedPanels, ...dividePanels],
      backgroundActions: mergeBackgroundActionDefinitions([], nextApp.layout.backgroundActions || []),
    },
  };
}
