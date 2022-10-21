import { render } from "react-dom";
import React, { StrictMode } from "react";
import templates from "./manifest-templates/built-in-manifest-editor-templates.json?import";
import { GlobalStyle } from "./atoms/GlobalStyle";
import { ShellProvider } from "./shell/ShellContext/ShellContext";
import { RenderApp } from "./_next/pages/render-app";
import { Main } from "./atoms/Main";
import { internalGetApps } from "./apps/app-loader";
import { Config } from "./shell/ConfigContext/ConfigContext";

export function init(
  element: HTMLElement,
  imports: any,
  preset: {
    initialApp?: { id: string; args?: any };
    config?: Partial<Config>;
  }
) {
  const modules = imports.reduce((state: any, mapping: any) => ({ ...state, ...mapping }), {});

  const apps = internalGetApps(modules);

  function App() {
    return (
      <ShellProvider
        apps={apps}
        config={{ ...(preset.config || {}), newTemplates: templates }}
        initialApp={preset.initialApp}
      >
        <GlobalStyle />
        <Main>
          <RenderApp />
        </Main>
      </ShellProvider>
    );
  }

  render(
    <StrictMode>
      <App />
    </StrictMode>,
    element
  );
}
