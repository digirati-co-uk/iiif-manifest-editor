import { GlobalStyle } from "@/atoms/GlobalStyle";
import { Main } from "@/atoms/Main";
import { RenderApp } from "@/_next/pages/render-app";
import { ShellProvider } from "@/shell/ShellContext/ShellContext";
import React, { useMemo } from "react";
import { Config } from "@/shell/ConfigContext/ConfigContext";
import { Collection } from "@iiif/presentation-3";
import { internalGetApps, LoadedApp } from "@/apps/app-loader";

interface ManifestEditorProps {
  apps: Record<string, LoadedApp>;
  initialApp?: { id: string; args?: any };
  config: Partial<Config>;
  templates?: Collection;
  onClickLogo?: () => void;
}

export function ManifestEditor(props: ManifestEditorProps) {
  const { apps, initialApp, config, templates } = props;
  const mapped = useMemo(() => internalGetApps(apps), [apps]);
  return (
    <ShellProvider apps={mapped} config={{ ...(config || {}), newTemplates: templates }} initialApp={initialApp}>
      <GlobalStyle />
      <Main>
        <RenderApp onClickLogo={props.onClickLogo} />
      </Main>
    </ShellProvider>
  );
}
