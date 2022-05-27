import { render } from "react-dom";
import React, { StrictMode } from "react";
import config from "../config.json";
import templates from "../public/config/built-in-manifest-editor-templates.json?import";
import { GlobalStyle } from "./atoms/GlobalStyle";
import { ShellProvider } from "./shell/ShellContext/ShellContext";
import { RenderApp } from "./_next/pages/render-app";
import { Main } from "./atoms/Main";

// Vite index, eventually.
const $root = document.getElementById("root");

render(
  <StrictMode>
    <ShellProvider config={{ ...config, newTemplates: templates }}>
      <GlobalStyle />
      <Main>
        <RenderApp />
      </Main>
    </ShellProvider>
  </StrictMode>,
  $root
);
