import { PreviewConfiguration } from "../PreviewContext/PreviewContext.types";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { Collection } from "@iiif/presentation-3";

export interface Config {
  // Previous configuration.
  previews: PreviewConfiguration[];
  defaultLanguages: string[];
  behaviorPresets: string[];
  newTemplates: Collection | null;

  // New optional configuration.
  properties?: {
    All?: string[];
    Manifest?: string[];
    Canvas?: string[];
    Annotation?: string[];
    AnnotationPage?: string[];
    AnnotationCollection?: string[];
    Range?: string[];
    Collection?: string[];
    ContentResource?: string[];
  };
}

const ConfigReactContext = createContext<Config>(null as any);

export function useConfig() {
  return useContext(ConfigReactContext);
}

export function ConfigProvider({ children, config }: { children: ReactNode; config?: Partial<Config> }) {
  const resolvedConfig: Config = useMemo(
    () => ({
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
      defaultLanguages: ["en", "none"],
      newTemplates: null,
      ...(config || {}),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return <ConfigReactContext.Provider value={resolvedConfig}>{children}</ConfigReactContext.Provider>;
}
