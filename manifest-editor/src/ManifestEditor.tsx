import { GlobalStyle } from "@/atoms/GlobalStyle";
import { Main } from "@/atoms/Main";
import { RenderApp } from "@/_next/pages/render-app";
import { ShellProvider } from "@/shell/ShellContext/ShellContext";
import React, { ReactNode, useMemo } from "react";
import { Config } from "@/shell/ConfigContext/ConfigContext";
import { Collection } from "@iiif/presentation-3";
import { AppDefinition, internalGetApps, LoadedApp } from "@/apps/app-loader";
import { ProjectProviderProps } from "@/shell/ProjectContext/ProjectContext.internal";
import { LayoutProps } from "@/shell";

interface ManifestEditorProps {
  apps: Record<string, LoadedApp>;
  initialApp?: { id: string; args?: any };
  saveCurrentApp?: boolean;
  config?: Partial<Config>;
  templates?: Collection;
  onClickLogo?: () => void;
  project?: Partial<ProjectProviderProps>;
  hideHeader?: boolean;
  layout?: Partial<LayoutProps>;
  children?: ReactNode;
}

export function ManifestEditor(props: ManifestEditorProps) {
  const { apps, initialApp, config, templates } = props;
  const mapped = useMemo(() => (apps.allApps ? (apps as any) : internalGetApps(apps as any)), [apps]);
  return (
    <ShellProvider
      apps={mapped}
      config={{ ...(config || {}), newTemplates: templates }}
      initialApp={initialApp}
      saveCurrentApp={props.saveCurrentApp}
      project={props.project}
    >
      <GlobalStyle />
      <Main>
        <RenderApp onClickLogo={props.onClickLogo} hideHeader={props.hideHeader} layout={props.layout} />
        {props.children}
      </Main>
    </ShellProvider>
  );
}
