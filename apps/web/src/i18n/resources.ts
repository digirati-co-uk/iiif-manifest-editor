import { defaultLocales, dutchLocale, type EditorI18nOptions } from "@manifest-editor/i18n/core";
import { additionalLocales, webLocaleLoaders, webExhibitionLoaders } from "./additional-resources";
import type { WebResourcePreload } from "./preload";

/** Forward resources, not a hook snapshot, when a shell/preset needs its own runtime. */
export const webUiResources = {
  // Registration includes fallback metadata; host policy still constrains selection.
  locales: [...defaultLocales, dutchLocale, ...additionalLocales],
  resourceLoaders: webLocaleLoaders,
} satisfies EditorI18nOptions;

/** Only exhibition hosts apply this layer; ordinary manifests keep canvas terminology. */
export const webExhibitionResources = {
  resourceLoaders: [...webLocaleLoaders, ...webExhibitionLoaders],
} satisfies EditorI18nOptions;

/** Seed the initial locale's loaders from serialized data rather than downloading it again after hydration. */
export function createWebResourceOptions(initial?: WebResourcePreload) {
  if (!initial) return { ui: webUiResources, exhibition: webExhibitionResources };
  const uiLoaders = webLocaleLoaders.map((loader) =>
    loader.locale === initial.locale ? { locale: loader.locale, load: async () => initial.ui } : loader
  );
  const exhibitionLoaders = webExhibitionLoaders.map((loader) =>
    loader.locale === initial.locale ? { locale: loader.locale, load: async () => initial.exhibition } : loader
  );
  return {
    ui: { ...webUiResources, ...initial.ui, resourceLoaders: uiLoaders },
    exhibition: { ...initial.exhibition, resourceLoaders: [...uiLoaders, ...exhibitionLoaders] },
  };
}
