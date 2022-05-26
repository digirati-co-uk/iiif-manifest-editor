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
    label: "Universal viewer 4",
  },
  {
    id: "universal-viewer-3",
    config: { url: "https://uv-v3.netlify.app/#?manifest={manifestId}" },
    type: "external-manifest-preview",
    label: "Universal viewer 3",
  },
  {
    id: "iiif-preview",
    config: { url: "https://iiif-preview.stephen.wf/store" },
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
                <PreviewProvider configs={previewConfigs}>
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