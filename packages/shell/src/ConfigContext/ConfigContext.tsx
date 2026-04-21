import type { Collection } from "@iiif/presentation-3";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { PreviewConfiguration } from "../PreviewContext/PreviewContext.types";

export interface Config {
  // Previous configuration.
  previews: PreviewConfiguration[];
  behaviorPresets: string[];
  newTemplates: Collection | null;

  defaultPreview: string | null;

  editorConfig: {
    All?: EditorConfig;
    Manifest?: EditorConfig;
    Canvas?: EditorConfig;
    Annotation?: EditorConfig;
    AnnotationPage?: EditorConfig;
    AnnotationCollection?: EditorConfig;
    Range?: EditorConfig;
    Collection?: EditorConfig;
    ContentResource?: EditorConfig;
    // Collection inside collection.
    EmbeddedCollection?: EditorConfig;
  };

  editorFeatureFlags: {
    enableMultiImageCanvases?: boolean;
    enableMultiMediaCanvases?: boolean;
    rememberCanvasId?: boolean;
    rememberLeftPanelId?: boolean;
    annotationPopups?: boolean;
    manifestGridOptions?: boolean;
  };

  // Internationalisation options
  i18n: {
    defaultLanguage: string;
    availableLanguages: string[];
    advancedLanguageMode: boolean;
    textGranularityEnabled?: boolean;
  };

  // Options when exporting from Vault.
  export: {
    baseIdentifier: string | null;
    version: 3 | 2;
  };

  uploadBackends: Array<UploadBackendConfig>;

  plugins?: {
    apps?: Record<
      string,
      {
        enabled?: string[];
        disabled?: string[];
        settings?: Record<string, unknown>;
      }
    >;
  };
}

export interface EditorConfig {
  singleTab?: string;
  fields?: string[];
  hideTabs?: string[];
  onlyTabs?: string[];
}

export interface UploadBackendConfig {
  id: string;
  label: string;
  resourceTypes: string[];
  canUpload?: () => Promise<boolean>;
  upload: (resource: File) => Promise<{ id: string; type: string }> | null;
}

const DEFAULT_CONFIG: Config = {
  previews: [],
  behaviorPresets: [
    "auto-advance",
    "no-auto-advance",
    "repeat",
    "no-repeat",
    "unordered",
    "individuals",
    "continuous",
    "paged",
    "non-paged",
    "facing-pages",
    "multi-part",
    "together",
    "sequence",
    "thumbnail-nav",
    "no-nav",
    "hidden",
  ],
  defaultPreview: null,
  editorConfig: {},
  newTemplates: null,
  i18n: {
    advancedLanguageMode: false,
    availableLanguages: ["en", "cy", "nl", "fr"],
    defaultLanguage: "en",
  },
  editorFeatureFlags: {
    enableMultiImageCanvases: true,
    enableMultiMediaCanvases: true,
    annotationPopups: false,
    rememberCanvasId: true,
    manifestGridOptions: false,
    rememberLeftPanelId: false,
  },
  uploadBackends: [],
  plugins: {
    apps: {},
  },
  export: {
    baseIdentifier: null,
    version: 3,
  },
};

function mergeEditorConfig(
  base: Config["editorConfig"] | undefined,
  override: Config["editorConfig"] | undefined,
): Config["editorConfig"] | undefined {
  if (!base && !override) return undefined;

  const next: Config["editorConfig"] = { ...(base || {}) };
  for (const [key, value] of Object.entries(override || {})) {
    next[key as keyof Config["editorConfig"]] = {
      ...((next as any)[key] || {}),
      ...(value || {}),
    };
  }
  return next;
}

function mergePluginConfig(
  base: Config["plugins"] | undefined,
  override: Config["plugins"] | undefined,
): Config["plugins"] | undefined {
  if (!base && !override) return undefined;

  const apps: NonNullable<Config["plugins"]>["apps"] = {
    ...(base?.apps || {}),
  };

  for (const [appId, appConfig] of Object.entries(override?.apps || {})) {
    const existing = apps[appId] || {};
    apps[appId] = {
      ...existing,
      ...appConfig,
      settings: {
        ...(existing.settings || {}),
        ...(appConfig.settings || {}),
      },
    };
  }

  return { apps };
}

export function mergePartialConfig(
  ...configs: Array<Partial<Config> | null | undefined>
): Partial<Config> {
  let merged: Partial<Config> = {};

  for (const config of configs) {
    if (!config) continue;

    merged = {
      ...merged,
      ...config,
      editorConfig: mergeEditorConfig(merged.editorConfig, config.editorConfig),
      editorFeatureFlags:
        merged.editorFeatureFlags || config.editorFeatureFlags
          ? {
              ...(merged.editorFeatureFlags || {}),
              ...(config.editorFeatureFlags || {}),
            }
          : undefined,
      i18n:
        merged.i18n || config.i18n
          ? {
              ...(merged.i18n || {}),
              ...(config.i18n || {}),
            } as Config["i18n"]
          : undefined,
      export:
        merged.export || config.export
          ? {
              ...(merged.export || {}),
              ...(config.export || {}),
            } as Config["export"]
          : undefined,
      plugins: mergePluginConfig(merged.plugins, config.plugins),
    };
  }

  return merged;
}

export function mergeConfig(
  ...configs: Array<Partial<Config> | null | undefined>
): Config {
  return mergePartialConfig(DEFAULT_CONFIG, ...configs) as Config;
}

export const ConfigReactContext = createContext<Config>(DEFAULT_CONFIG);
export const SaveConfigReactContext = createContext<
  (config: Partial<Config>) => void
>(() => {});

export function useConfig() {
  return useContext(ConfigReactContext);
}

export function useSaveConfig() {
  return useContext(SaveConfigReactContext);
}

export function ConfigProvider({
  children,
  config,
  saveConfig,
}: {
  children: ReactNode;
  config?: Partial<Config>;
  saveConfig?: (config: Partial<Config>) => void;
}) {
  const [runtimeConfig, setRuntimeConfig] = useState<Partial<Config> | null>(
    null,
  );
  const resolvedConfig: Config = useMemo(
    () => mergeConfig(config, runtimeConfig),
    [config, runtimeConfig],
  );

  const memoSaveConfig = useCallback(
    (config: Partial<Config>) => {
      setRuntimeConfig((existing) => mergePartialConfig(existing, config));
      if (saveConfig) {
        saveConfig(config);
      }
    },
    [saveConfig],
  );

  return (
    <SaveConfigReactContext.Provider value={memoSaveConfig}>
      <ConfigReactContext.Provider value={resolvedConfig}>
        {children}
      </ConfigReactContext.Provider>
    </SaveConfigReactContext.Provider>
  );
}
