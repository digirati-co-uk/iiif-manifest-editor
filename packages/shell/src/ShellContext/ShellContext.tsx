import { ImageServiceLoader } from "@atlas-viewer/iiif-image-api";
import { ErrorBoundary } from "@manifest-editor/ui/atoms/ErrorBoundary";
import { type ReactNode, useMemo } from "react";
import { ImageServiceLoaderContext } from "react-iiif-vault";
import { ThemeProvider } from "styled-components";
import {
  AppResourceProvider,
  type Resource,
} from "../AppResourceProvider/AppResourceProvider";
import { AtlasStoreProvider } from "../AtlasStore/AtlasStoreProvider";
import {
  type Config,
  ConfigProvider,
  useConfig,
} from "../ConfigContext/ConfigContext";
import { EditingStack } from "../EditingStack/EditingStack";
import { LayoutProvider } from "../Layout/Layout.context-internal";
import { PreviewProvider } from "../PreviewContext/PreviewContext";
import type {
  Preview,
  PreviewConfiguration,
} from "../PreviewContext/PreviewContext.types";
import { PreviewVaultContext } from "../PreviewVault/PreviewVault";
import { defaultTheme } from "./default-theme";

const previewConfigs: PreviewConfiguration[] = [
  {
    id: "universal-viewer",
    config: { url: "https://universalviewer.dev/#?iiifManifestId={manifestId}" },
    type: "external-manifest-preview",
    label: "Universal viewer",
  },
  {
    id: "mirador-3",
    type: "external-manifest-preview",
    label: "Mirador 3",
    config: {
      url: "https://tomcrane.github.io/scratch/mirador3/?iiif-content={manifestId}",
    },
  },
  {
    id: "annona",
    type: "external-manifest-preview",
    label: "Annona",
    config: {
      url: "https://ncsu-libraries.github.io/annona/tools/#/display?url={manifestId}&viewtype=iiif-storyboard&settings=%7B%22fullpage%22%3Atrue%7D",
    },
  },
  {
    id: "iiif-preview",
    config: { url: "https://iiif-preview.digirati.services/store" },
    type: "iiif-preview-service",
    label: "IIIF Preview",
  },
];

const imageServiceLoader = new ImageServiceLoader({
  approximateServices: true,
  verificationsRequired: 8,
  enableFetching: true,
});

export function ShellProvider({
  config,
  saveConfig,
  children,
  theme,
  previews,
  resource,
  editing,
}: {
  resource: Resource;
  config?: Partial<Config>;
  saveConfig?: (config: Partial<Config>) => void;
  children: ReactNode;
  theme?: any;
  previews?: Preview[];
  editing?: { id: string; type: string };
}) {
  const existingConfig = useConfig();
  const mergedConfig = useMemo(() => {
    return {
      ...existingConfig,
      ...config,
      previews: config?.previews || existingConfig.previews || previewConfigs,
    };
  }, [existingConfig, config]);

  return (
    <ErrorBoundary>
      <ImageServiceLoaderContext.Provider value={imageServiceLoader}>
        <AppResourceProvider resource={resource}>
          <PreviewVaultContext>
            <ThemeProvider theme={theme || defaultTheme}>
              <ConfigProvider config={mergedConfig} saveConfig={saveConfig}>
                <EditingStack>
                  <LayoutProvider>
                    {/* @todo swap these out for (config?.previews || []) */}
                    <PreviewProvider
                      previews={previews || []}
                      configs={mergedConfig.previews}
                    >
                      <AtlasStoreProvider>{children}</AtlasStoreProvider>
                    </PreviewProvider>
                  </LayoutProvider>
                </EditingStack>
              </ConfigProvider>
            </ThemeProvider>
          </PreviewVaultContext>
        </AppResourceProvider>
      </ImageServiceLoaderContext.Provider>
    </ErrorBoundary>
  );
}
