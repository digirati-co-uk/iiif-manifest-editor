import { PreviewConfiguration } from "../PreviewContext/PreviewContext.types";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { Collection } from "@iiif/presentation-3";

export interface Config {
  // Previous configuration.
  previews: PreviewConfiguration[];
  behaviorPresets: string[];
  newTemplates: Collection | null;

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
  };

  editorFeatureFlags: {
    enableMultiImageCanvases?: boolean;
    enableMultiMediaCanvases?: boolean;
  };

  // Internationalisation options
  i18n: {
    defaultLanguage: string;
    availableLanguages: string[];
    advancedLanguageMode: boolean;
  };

  // Options when exporting from Vault.
  export: {
    baseIdentifier: string | null;
    version: 3 | 2;
  };

  uploadBackends: Array<UploadBackendConfig>;
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
  },
  uploadBackends: [],
  export: {
    baseIdentifier: null,
    version: 3,
  },
};

const ConfigReactContext = createContext<Config>(DEFAULT_CONFIG);
const SaveConfigReactContext = createContext<(config: Partial<Config>) => void>(() => {});

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
  const [runtimeConfig, setRuntimeConfig] = useState<Partial<Config> | null>(null);
  const resolvedConfig: Config = useMemo(
    () => ({
      ...DEFAULT_CONFIG,
      ...(config || {}),
      ...(runtimeConfig || {}),
    }),
    [config, runtimeConfig]
  );
  const memoSaveConfig = useCallback(
    (config: Partial<Config>) => {
      setRuntimeConfig(config);
      if (saveConfig) {
        saveConfig(config);
      }
    },
    [config]
  );

  return (
    <SaveConfigReactContext.Provider value={memoSaveConfig}>
      <ConfigReactContext.Provider value={resolvedConfig}>{children}</ConfigReactContext.Provider>
    </SaveConfigReactContext.Provider>
  );
}
