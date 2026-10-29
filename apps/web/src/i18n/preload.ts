import type { EditorI18nResources } from "@manifest-editor/i18n/core";
import { webLocaleImports } from "./additional-resources";

export interface WebResourcePreload {
  readonly locale: string;
  readonly ui: EditorI18nResources;
  readonly exhibition: EditorI18nResources;
}

/** Only this request's initial locale crosses the server/client boundary as data. */
export async function preloadWebResources(locale: string): Promise<WebResourcePreload> {
  const load = webLocaleImports[locale as keyof typeof webLocaleImports];
  if (!load) {
    if (locale !== "en-GB") throw new RangeError(`Unknown web UI locale: ${locale}`);
    return { locale, ui: {}, exhibition: {} };
  }
  const data = await load();
  return {
    locale,
    ui: { catalogs: data.catalogs, profiles: { plain: data.plain } },
    exhibition: { presets: [data.exhibition], presetProfiles: { plain: data.exhibitionPlain } },
  };
}
