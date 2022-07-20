import { render } from "react-dom";
import React, { StrictMode, useMemo } from "react";
import config from "./config.json";
import templates from "../public/config/built-in-manifest-editor-templates.json?import";
import { GlobalStyle } from "./atoms/GlobalStyle";
import { ShellProvider } from "./shell/ShellContext/ShellContext";
import { RenderApp } from "./_next/pages/render-app";
import { Main } from "./atoms/Main";
import { getApps } from "./apps/app-loader";

// Vite index, eventually.
const $root = document.getElementById("root");

function App() {
  const apps = useMemo(getApps, []);

  return (
    <ShellProvider apps={apps} config={{ ...config, newTemplates: templates }}>
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
  $root
);
