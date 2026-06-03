import type { AppExtension, MappedApp } from "../AppContext/AppContext";
import type { Config } from "../ConfigContext/ConfigContext";
import type { ReactNode } from "react";

export type PluginMetadata = {
  id: string;
  label: string;
  description?: string;
  author?: string | { name: string; url?: string };
  official?: boolean;
  image?: string | { src: string; alt?: string };
  screenshots?: Array<{ src: string; label?: string; alt?: string }>;
  version?: string;
  tags?: string[];
  supports?: {
    apps?: string[];
    projectTypes?: Array<"Manifest" | "Collection">;
  };
  defaultEnabled?: boolean;
  dependencies?: string[];
};

export type PluginModule = {
  default: PluginMetadata;
  config?: Partial<Config>;
  settings?: PluginSettingsDefinition;
} & AppExtension;

export type MappedPlugin = {
  metadata: PluginMetadata;
  extension: AppExtension;
  settings?: PluginSettingsDefinition;
};

export type PluginSettingsValue = Record<string, unknown>;

export type PluginSettingsRecord = Record<string, PluginSettingsValue>;

export type PluginSettingsFieldOption = {
  label: string;
  value: string | number | boolean;
};

export type PluginSettingsField = {
  id: string;
  label: string;
  description?: string;
  type?: "text" | "textarea" | "number" | "boolean" | "select";
  placeholder?: string;
  options?: PluginSettingsFieldOption[];
};

export type PluginSettingsRenderContext<T extends PluginSettingsValue = PluginSettingsValue> = {
  plugin: MappedPlugin;
  appId: string;
  scope: PluginConfigScope;
  value: T;
  defaults: T;
  effective: T;
  onChange: (value: T) => void;
};

export type PluginSettingsDefinition<T extends PluginSettingsValue = PluginSettingsValue> = {
  defaults?: T;
  fields?: PluginSettingsField[];
  validate?: (settings: T) => string | null | undefined | void;
  render?: (context: PluginSettingsRenderContext<T>) => ReactNode;
};

export type PluginConfigScope = "workspace" | "global";

export type PluginAppConfig = {
  enabled?: string[];
  disabled?: string[];
  settings?: PluginSettingsRecord & Record<string, unknown>;
};

export type PluginStoreSnapshot = {
  plugins: MappedPlugin[];
  enabled: string[];
  disabled: string[];
  globalApps: Record<string, PluginAppConfig>;
  apps: Record<string, PluginAppConfig>;
};

export type PluginStore = PluginStoreSnapshot & {
  setProviderState(state: {
    plugins?: MappedPlugin[];
    enabled?: string[];
    disabled?: string[];
    globalPluginConfig?: Config["plugins"];
  }): void;
  setAppConfig(appId: string, config: PluginAppConfig): void;
  setGlobalConfig(config?: Config["plugins"]): void;
  setGlobalAppConfig(appId: string, config: PluginAppConfig): void;
  enable(appId: string, id: string): void;
  enable(appId: string, id: string, scope: PluginConfigScope): void;
  disable(appId: string, id: string): void;
  disable(appId: string, id: string, scope: PluginConfigScope): void;
};

export type PluginHostApp = Pick<MappedApp, "metadata" | "layout">;

export type PluginRuntimeApi = {
  getSettings<T extends PluginSettingsValue = PluginSettingsValue>(pluginId: string): T;
};
