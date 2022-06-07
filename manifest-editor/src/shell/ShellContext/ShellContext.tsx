import React, { ReactNode, useMemo } from "react";
import { LayoutProvider } from "../Layout/Layout.context";
import { ProjectProvider } from "../ProjectContext/ProjectContext";
import { PreviewProvider } from "../PreviewContext/PreviewContext";
import { PreviewConfiguration } from "../PreviewContext/PreviewContext.types";
import { ManifestEditorProvider } from "../../apps/ManifestEditor/ManifestEditor.context";
import { AppProvider } from "../AppContext/AppContext";
import { getApps } from "../../apps/app-loader";
import { Config, ConfigProvider } from "../ConfigContext/ConfigContext";
import { defaultTheme } from "../../themes/default-theme";
import { ThemeProvider } from "styled-components";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";

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
}: {
  config?: Partial<Config>;
  children: ReactNode;
  theme?: any;
}) => {
  const apps = useMemo(getApps, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme || defaultTheme}>
        <ConfigProvider config={config}>
          <AppProvider apps={apps.allApps}>
            <LayoutProvider>
              <ProjectProvider>
                {/* @todo swap these out for (config?.previews || []) */}
                <PreviewProvider configs={config?.previews || previewConfigs}>
                  <ManifestEditorProvider>{children}</ManifestEditorProvider>
                </PreviewProvider>
              </ProjectProvider>
            </LayoutProvider>
          </AppProvider>
        </ConfigProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
