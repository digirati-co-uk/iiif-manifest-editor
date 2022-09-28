import { createRoot } from "react-dom/client";
import React, { StrictMode, useMemo } from "react";
import config from "../config.json";
import templates from "./manifest-templates/built-in-manifest-editor-templates.json?import";
import { GlobalStyle } from "./atoms/GlobalStyle";
import { ShellProvider } from "./shell/ShellContext/ShellContext";
import { RenderApp } from "./_next/pages/render-app";
import { Main } from "./atoms/Main";
import { getApps } from "./apps/app-loader";
import qs from "query-string";

// Vite index, eventually.
const $root = document.getElementById("root")!;

function useInitialApp() {
  if (import.meta.env.DEV && window) {
    const queryString = qs.parse(window.location.toString().split("?")[1] || "");

    if (queryString.app) {
      return { id: queryString.app as string };
    }
  }

  return undefined;
}

function App() {
  const apps = useMemo(getApps, []);
  const initialApp = useInitialApp();

  return (
    <ShellProvider apps={apps} config={{ ...config, newTemplates: templates }} initialApp={initialApp}>
      <GlobalStyle />
      <Main>
        <RenderApp />
      </Main>
    </ShellProvider>
  );
}

createRoot($root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
