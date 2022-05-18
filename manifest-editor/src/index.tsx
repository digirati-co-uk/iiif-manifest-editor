import { render } from "react-dom";
import React, { StrictMode } from "react";
import data from "../config.json";
import config from "../public/config/built-in-manifest-editor-templates.json";
import { defaultTheme } from "./themes/default-theme";
import { GlobalStyle } from "./atoms/GlobalStyle";
import IndexPage from "./_next/pages";
import { ShellProvider } from "./context/ShellContext/ShellContext";

// Vite index, eventually.
const $root = document.getElementById("root");

render(
  <StrictMode>
    <ShellProvider>
      <GlobalStyle />
      <IndexPage
        // left these in for now.
        config={data}
        theme={defaultTheme}
        welcome={{}}
        templates={JSON.stringify(config)}
      />
    </ShellProvider>
  </StrictMode>,
  $root
);
