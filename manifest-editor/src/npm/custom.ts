import { render } from "react-dom";
import { createElement, StrictMode } from "react";
import { internalGetApps } from "@/apps/app-loader";
import { ShellProvider } from "@/shell/ShellContext/ShellContext";
import { GlobalStyle } from "@/atoms/GlobalStyle";
import { Main } from "@/atoms/Main";
import { RenderApp } from "@/_next/pages/render-app";
import { Config } from "@/shell/ConfigContext/ConfigContext";

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
    return createElement(
      ShellProvider,
      {
        apps,
        config: { ...(preset.config || {}) },
        initialApp: preset.initialApp,
      } as any,
      [createElement(GlobalStyle, {}), createElement(Main, {}, [createElement(RenderApp, {})])]
    );
  }

  render(createElement(StrictMode, {}, [createElement(App, {})]), element);
}
