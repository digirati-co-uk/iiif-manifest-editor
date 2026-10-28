import { defaultLocales, dutchLocale, type EditorI18nOptions } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain, dutchExhibition, dutchExhibitionPlain } from "@manifest-editor/i18n/nl";
import {
  additionalLocales,
  additionalCatalogs,
  additionalPlain,
  additionalExhibition,
  additionalExhibitionPlain,
} from "./additional-resources";

/** Forward resources, not a hook snapshot, when a shell/preset needs its own runtime. */
export const webUiResources = {
  // Registration includes fallback metadata; host policy still constrains selection.
  locales: [...defaultLocales, dutchLocale, ...additionalLocales],
  catalogs: { ...dutchCatalogs, ...additionalCatalogs },
  profiles: { plain: { ...dutchPlain, ...additionalPlain } },
} satisfies EditorI18nOptions;

/** Only exhibition hosts apply this layer; ordinary manifests keep canvas terminology. */
export const webExhibitionResources = {
  presets: [{ ...dutchExhibition, ...additionalExhibition }],
  presetProfiles: { plain: { ...dutchExhibitionPlain, ...additionalExhibitionPlain } },
} satisfies EditorI18nOptions;
