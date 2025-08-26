import type { Collection } from "@iiif/presentation-3";
import {
  type ReactNode,
  createContext,
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
  },
  uploadBackends: [],
  export: {
    baseIdentifier: null,
    version: 3,
  },
};

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
    () => ({
      ...DEFAULT_CONFIG,
      ...(config || {}),
      ...(runtimeConfig || {}),
      editorFeatureFlags: {
        ...DEFAULT_CONFIG.editorFeatureFlags,
        ...(config?.editorFeatureFlags || {}),
        ...runtimeConfig?.editorFeatureFlags,
      },
    }),
    [config, runtimeConfig],
  );

  const memoSaveConfig = useCallback(
    (config: Partial<Config>) => {
      setRuntimeConfig(config);
      if (saveConfig) {
        saveConfig(config);
      }
    },
    [config],
  );

  return (
    <SaveConfigReactContext.Provider value={memoSaveConfig}>
      <ConfigReactContext.Provider value={resolvedConfig}>
        {children}
      </ConfigReactContext.Provider>
    </SaveConfigReactContext.Provider>
  );
}
