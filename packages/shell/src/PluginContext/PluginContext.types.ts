import type { AppExtension, MappedApp } from "../AppContext/AppContext";
import type { Config } from "../ConfigContext/ConfigContext";

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
} & AppExtension;

export type MappedPlugin = {
  metadata: PluginMetadata;
  extension: AppExtension;
};

export type PluginAppConfig = {
  enabled?: string[];
  disabled?: string[];
  settings?: Record<string, unknown>;
};

export type PluginStoreSnapshot = {
  plugins: MappedPlugin[];
  enabled: string[];
  disabled: string[];
  apps: Record<string, PluginAppConfig>;
};

export type PluginStore = PluginStoreSnapshot & {
  setProviderState(state: {
    plugins?: MappedPlugin[];
    enabled?: string[];
    disabled?: string[];
  }): void;
  setAppConfig(appId: string, config: PluginAppConfig): void;
  enable(appId: string, id: string): void;
  disable(appId: string, id: string): void;
};

export type PluginHostApp = Pick<MappedApp, "metadata" | "layout">;
