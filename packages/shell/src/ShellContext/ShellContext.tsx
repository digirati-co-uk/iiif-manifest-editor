import { ErrorBoundary } from "@manifest-editor/ui/atoms/ErrorBoundary";
import { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { AppResourceProvider, Resource } from "../AppResourceProvider/AppResourceProvider";
import { Config, ConfigProvider } from "../ConfigContext/ConfigContext";
import { EditingStack } from "../EditingStack/EditingStack";
import { LayoutProvider } from "../Layout/Layout.context-internal";
import { PreviewProvider } from "../PreviewContext/PreviewContext";
import { Preview, PreviewConfiguration } from "../PreviewContext/PreviewContext.types";
import { PreviewVaultContext } from "../PreviewVault/PreviewVault";
import { defaultTheme } from "./default-theme";

const previewConfigs: PreviewConfiguration[] = [
  {
    id: "universal-viewer",
    config: { url: "https://uv-v4.netlify.app/#?iiifManifestId={manifestId}" },
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
    id: "iiif-preview",
    config: { url: "https://iiif-preview.digirati.services/store" },
    type: "iiif-preview-service",
    label: "IIIF Preview",
  },
];

export const ShellProvider = ({
  config,
  children,
  theme,
  previews,
  resource,
}: {
  resource: Resource;
  config?: Partial<Config>;
  children: ReactNode;
  theme?: any;
  previews?: Preview[];
}) => {
  return (
    <ErrorBoundary>
      <AppResourceProvider resource={resource}>
        <PreviewVaultContext>
          <ThemeProvider theme={theme || defaultTheme}>
            <ConfigProvider config={config}>
              <EditingStack>
                <LayoutProvider>
                  {/* @todo swap these out for (config?.previews || []) */}
                  <PreviewProvider previews={previews || []} configs={config?.previews || previewConfigs}>
                    {children}
                  </PreviewProvider>
                </LayoutProvider>
              </EditingStack>
            </ConfigProvider>
          </ThemeProvider>
        </PreviewVaultContext>
      </AppResourceProvider>
    </ErrorBoundary>
  );
};
