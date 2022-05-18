import { render } from "react-dom";
import React, { StrictMode } from "react";
import CustomApp from "./_next/pages/_app";
import data from "../config.json";
import config from "../public/config/built-in-manifest-editor-templates.json";
import { defaultTheme } from "./themes/default-theme";

// Vite index, eventually.
const $root = document.getElementById("root");

render(
  <StrictMode>
    <CustomApp
      config={{
        // 50% working..
        config: data,
        theme: defaultTheme,
        welcome: {},
        templates: JSON.stringify(config),
      }}
    />
  </StrictMode>,
  $root
);
