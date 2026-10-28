import type { BuiltinNamespace } from "./catalog-types.ts";
import type { MessageKey } from "./messages.ts";

export interface TranslatorNote {
  readonly context: string;
  readonly placeholders?: Readonly<Record<string, string>>;
  readonly terminology?: string;
}

/** Add context as catalogs expand. IDs and English wording alone do not fully specify meaning. */
export const translatorNotes = {
  common: {
    "actions.remove": {
      context:
        "Remove a reference/selection from its parent. May differ from permanently deleting the underlying resource.",
    },
    "actions.delete": {
      context: "Delete the object indicated by the surrounding UI; keep distinct from removing a reference.",
    },
  },
  editors: {
    "fields.label": {
      context: "The form label for the IIIF label property, not the authored value of that property.",
      terminology: "The plain English profile calls this Title. The stored IIIF property remains label.",
    },
    "fields.navDate": {
      context: "A date used for navigation or sorting, not necessarily the creation/publication date.",
      terminology: "Use a whole plain-language explanation rather than translating the identifier navDate literally.",
    },
    "canvas.removeConfirm": {
      context: "Confirmation before removing a canvas from its containing manifest.",
      terminology:
        "Standard: canvas/manifest. Plain: page/item. Exhibition: slide/exhibition. Translate the whole sentence for grammatical agreement.",
    },
    "canvas.count": {
      context: "Visible number of canvases in the current workflow.",
      placeholders: { count: "Numeric cardinal count; keep this placeholder name unchanged in every plural form." },
    },
  },
  shell: {
    "plugins.loadFailed": {
      context: "An editor plugin failed to load.",
      placeholders: {
        pluginName: "Plugin display name supplied by the host; do not translate as part of this message.",
      },
    },
    "background.progress": {
      context: "Completed units compared with total units in a background task.",
      placeholders: { current: "Completed count.", total: "Total count." },
    },
  },
  "plugin-translation": {
    "settings.sourceLanguage": {
      context: "Language of authored IIIF content given to machine translation. Independent of interface language.",
    },
    "settings.targetLanguage": {
      context: "Requested language of machine-translated IIIF content. Independent of interface language.",
    },
  },
} as const satisfies { readonly [N in BuiltinNamespace]?: Readonly<Partial<Record<MessageKey<N>, TranslatorNote>>> };
