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
  "editor-api": {
    "resources.canvas": {
      context: "System resource-type heading; never the stored IIIF type or an authored canvas label.",
      terminology: "Standard: Canvas. Plain: Page/Pagina. Exhibition may use Slide/Dia through its preset overlay.",
    },
    "fields.label": {
      context: "System heading for the IIIF label field.",
      terminology: "Use Title/Titel in plain wording, consistent with the editors namespace; the property remains label.",
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
  components: {
    "provider.editNamed": {
      context:
        "Accessible name for the provider edit button. Translate the whole action, preserving the authored provider name.",
      placeholders: { name: "Authored IIIF provider label; never translate this value." },
    },
    "background.summary": {
      context:
        "Accessible name for the background task menu. Both numbers can be zero, one or many; the complete sentence must work for all counts.",
      placeholders: { running: "Number of running tasks.", errors: "Number of failed tasks." },
    },
    "tour.nextProgress": {
      context:
        "Joyride button label. Keep its single-brace {step} and {steps} tokens intact: Joyride substitutes them after translation, rather than i18next.",
    },
    "mdx.linkPreview.open": {
      context: "Accessible action opening an authored link in a new window.",
      placeholders: { url: "Authored URL, preserved exactly as text." },
    },
    "mdx.toolbar.blockTypes.heading": {
      context: "Rich-text block style selector, for example Heading 2. The number is the semantic HTML heading level.",
      placeholders: { level: "Heading level, currently 2 or 3." },
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
