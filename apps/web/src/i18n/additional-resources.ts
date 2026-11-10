/** Locale metadata stays eager; message values live behind explicit chunk boundaries. */
import type { LocaleDefinition, LocaleResourceLoader } from "@manifest-editor/i18n/core";

export const additionalLocales: readonly LocaleDefinition[] = Object.freeze([
  { id: "fr", nativeName: "Français", direction: "ltr" },
  { id: "de", nativeName: "Deutsch", direction: "ltr" },
  { id: "it", nativeName: "Italiano", direction: "ltr" },
  { id: "es", nativeName: "Español", direction: "ltr" },
  { id: "pt", nativeName: "Português", direction: "ltr" },
  { id: "ja", nativeName: "日本語", direction: "ltr" },
  { id: "zh", nativeName: "中文", direction: "ltr" },
  { id: "tr", nativeName: "Türkçe", direction: "ltr" },
  { id: "fi", nativeName: "Suomi", direction: "ltr" },
  { id: "hi", nativeName: "हिन्दी", direction: "ltr" },
  { id: "pl", nativeName: "Polski", direction: "ltr" },
  { id: "uk", nativeName: "Українська", direction: "ltr" },
  { id: "cs", nativeName: "Čeština", direction: "ltr" },
  { id: "da", nativeName: "Dansk", direction: "ltr" },
  { id: "ms", nativeName: "Bahasa Melayu", direction: "ltr" },
  { id: "ta", nativeName: "தமிழ்", direction: "ltr" },
]);

export const webLocaleImports = {
  nl: () => import("./locales/nl"),
  fr: () => import("./locales/fr"),
  de: () => import("./locales/de"),
  it: () => import("./locales/it"),
  es: () => import("./locales/es"),
  pt: () => import("./locales/pt"),
  ja: () => import("./locales/ja"),
  zh: () => import("./locales/zh"),
  tr: () => import("./locales/tr"),
  fi: () => import("./locales/fi"),
  hi: () => import("./locales/hi"),
  pl: () => import("./locales/pl"),
  uk: () => import("./locales/uk"),
  cs: () => import("./locales/cs"),
  da: () => import("./locales/da"),
  ms: () => import("./locales/ms"),
  ta: () => import("./locales/ta"),
};

export const webLocaleLoaders: readonly LocaleResourceLoader[] = Object.entries(webLocaleImports).map(
  ([locale, load]) => ({
    locale,
    load: async () => {
      const data = await load();
      return { catalogs: data.catalogs, profiles: { plain: data.plain } };
    },
  })
);

export const webExhibitionLoaders: readonly LocaleResourceLoader[] = Object.entries(webLocaleImports).map(
  ([locale, load]) => ({
    locale,
    load: async () => {
      const data = await load();
      return { presets: [data.exhibition], presetProfiles: { plain: data.exhibitionPlain } };
    },
  })
);
