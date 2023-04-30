import React, { ReactNode, useMemo } from "react";
import { LayoutProvider } from "../Layout/Layout.context-internal";
import { ProjectProvider } from "../ProjectContext/ProjectContext.internal";
import { PreviewProvider } from "../PreviewContext/PreviewContext";
import { PreviewConfiguration } from "../PreviewContext/PreviewContext.types";
import { ManifestEditorProvider } from "@/apps/ManifestEditorLegacy/ManifestEditor.context";
import { AppProvider } from "../AppContext/AppContext";
import { AppDefinition } from "@/apps/app-loader";
import { Config, ConfigProvider } from "../ConfigContext/ConfigContext";
import { defaultTheme } from "@/themes/default-theme";
import { ThemeProvider } from "styled-components";
import { ErrorBoundary } from "@/atoms/ErrorBoundary";
import { EditingStack } from "@/shell/EditingStack/EditingStack";
import { PreviewVaultContext } from "@/shell/PreviewVault/PreviewVault";

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
  apps,
  initialApp,
}: {
  config?: Partial<Config>;
  children: ReactNode;
  theme?: any;
  apps: AppDefinition;
  initialApp?: { id: string; args?: any };
}) => {
  return (
    <ErrorBoundary>
      <PreviewVaultContext>
        <ThemeProvider theme={theme || defaultTheme}>
          <ConfigProvider config={config}>
            <AppProvider apps={apps.allApps} initialApp={initialApp}>
              <ProjectProvider>
                <EditingStack>
                  <LayoutProvider>
                    {/* @todo swap these out for (config?.previews || []) */}
                    <PreviewProvider configs={config?.previews || previewConfigs}>
                      <ManifestEditorProvider>{children}</ManifestEditorProvider>
                    </PreviewProvider>
                  </LayoutProvider>
                </EditingStack>
              </ProjectProvider>
            </AppProvider>
          </ConfigProvider>
        </ThemeProvider>
      </PreviewVaultContext>
    </ErrorBoundary>
  );
};
