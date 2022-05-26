import { render } from "react-dom";
import React, { StrictMode } from "react";
import config from "../config.json";
import templates from "../public/config/built-in-manifest-editor-templates.json?import";
import { defaultTheme } from "./themes/default-theme";
import { GlobalStyle } from "./atoms/GlobalStyle";
import IndexPage from "./_next/pages";
import { ShellProvider } from "./shell/ShellContext/ShellContext";

// Vite index, eventually.
const $root = document.getElementById("root");

render(
  <StrictMode>
    <ShellProvider config={{ ...config, newTemplates: templates }}>
      <GlobalStyle />
      <IndexPage
        // left these in for now.
        config={config}
        theme={defaultTheme}
        templates={JSON.stringify(templates)}
      />
    </ShellProvider>
  </StrictMode>,
  $root
);
