import { createRoot } from "react-dom/client";
import React, { useMemo } from "react";
import config from "../config.json";
import templates from "./manifest-templates/built-in-manifest-editor-templates.json?import";
import { GlobalStyle } from "./atoms/GlobalStyle";
import { ShellProvider } from "@/shell";
import { RenderApp } from "./_next/pages/render-app";
import { Main } from "./atoms/Main";
import { getApps } from "./apps/apps";
import qs from "query-string";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { OptionalEmbed } from "@/shell/Embed/OptionalEmbed";

const instance = i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {},
    lng: "en", // if you're using a language detector, do not define the lng option
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

// Vite index, eventually.
const $root = document.getElementById("root")!;

function useInitialApp() {
  if ((import.meta.env.DEV || import.meta.env.PULL_REQUEST === "true") && window) {
    const queryString = qs.parse(window.location.toString().split("?")[1] || "");

    if (queryString.app) {
      return { id: queryString.app as string };
    }
  }

  return undefined;
}

function App() {
  const apps = useMemo(getApps, []);

  return (
    <OptionalEmbed apps={apps}>
      <ShellProvider apps={apps} config={{ ...config, newTemplates: templates }}>
        <GlobalStyle />
        <Main>
          <RenderApp />
        </Main>
      </ShellProvider>
    </OptionalEmbed>
  );
}

createRoot($root).render(<App />);
