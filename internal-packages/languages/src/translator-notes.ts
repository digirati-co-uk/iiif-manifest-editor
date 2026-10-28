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
      terminology:
        "Use Title/Titel in plain wording, consistent with the editors namespace; the property remains label.",
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
    "browser.selectResource": {
      context: "Accessible selection action. The resource name remains literal authored IIIF content.",
      placeholders: { name: "Authored resource label or stable ID; never translate its value." },
    },
    "browser.historyCount_other": {
      context:
        "Whole count of visited resources. count chooses the grammatical form; value is the UI-locale formatted number. Dutch uses vermelding/vermeldingen.",
      placeholders: { count: "Raw numeric count for plural choice.", value: "Locale-formatted display count." },
    },
    "browser.preferredSize": {
      context:
        "Image API request dimensions. Only display numbers are formatted; the request URL and numeric dimensions stay unchanged.",
      placeholders: { width: "Display width in pixels.", height: "Display height in pixels." },
    },
    "mdx.codeMirror.replacedMatches": {
      context:
        "CodeMirror substitutes its literal single dollar-sign token after translation. Preserve $, unlike ordinary double-brace i18next interpolation.",
    },
    "media.time.range": {
      context:
        "Complete spoken time-range ARIA message. Each value is an already-localised duration, separate from subtitle/content language.",
      placeholders: { current: "Localised current duration.", duration: "Localised total duration." },
    },
    "media.time.seekBackward": {
      context: "Whole seek announcement; Dutch places the duration before the action, English after it.",
      placeholders: { time: "Localised duration, with semantic unit counts." },
    },
    "mdx.diffSource.parseError": {
      context:
        "Friendly feedback when authored Markdown cannot be parsed; the original parser diagnostic is separate technical data.",
    },
    "mdx.diffSource.recovery": {
      context:
        "Recovery instruction for malformed Markdown. Source mode means editing the literal Markdown; rich text is its formatted view.",
    },
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
    "creator.help": {
      context: "Accessible help action for a creator. The creator name is already resolved by its own namespace.",
      placeholders: { name: "Resolved creator display name, never an ID or authored IIIF label." },
    },
    "background.items": {
      context: "Whole progress sentence. Plural category follows the total count; current may be zero.",
      placeholders: { current: "Completed numeric count.", count: "Total numeric count; controls plurals." },
    },
    "background.toastComplete": {
      context:
        "Whole completion notification; action names are resolved at render time, including in an already visible toast.",
      placeholders: { name: "Resolved action display name. Do not translate placeholder contents." },
    },
    "background.timeZone": {
      context: "Explains the explicit timezone used by task timestamps. Defaults to UTC; never changes authored dates.",
      placeholders: { timeZone: "IANA timezone identifier from host UI configuration, preserved literally." },
    },
    "settings.contentDefault": {
      context:
        "Default language for authored IIIF content. This setting is independent from interface locale and wording profile.",
    },
    "specification.required": {
      context:
        "Specification report feedback; the field label is host terminology or a protocol-path fallback. Authored expected/actual values are untouched.",
      placeholders: { label: "Field display label. Preserve its text and do not change IIIF paths." },
    },
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
  ui: {
    "property.add": {
      context:
        "Accessible action label for adding a property; label is the caller-supplied display label, never a protocol property ID.",
      placeholders: { label: "Display label supplied by the caller; preserve it literally." },
    },
    "canvas.imageDimensions": {
      context:
        "Explains the dimensions of the source image and the canvas that will be created. Translate the complete sentence.",
      placeholders: {
        width: "Source width in pixels; do not alter the numeric value.",
        height: "Source height in pixels.",
      },
    },
    "annotation.count": {
      context: "Number of annotations on an internal annotation page; provide singular and plural forms.",
      placeholders: { count: "Numeric cardinal count of annotations." },
    },
    "annotation.items": {
      context: "Number of items on the legacy annotation page; provide singular and plural forms.",
      placeholders: { count: "Numeric cardinal count of page items." },
    },
    "region.selected": {
      context:
        "Whole accessible description of the selected image region, also used as preview image alternative text.",
      placeholders: {
        x: "Horizontal pixel coordinate.",
        y: "Vertical pixel coordinate.",
        width: "Region width in pixels.",
        height: "Region height in pixels.",
      },
    },
    "save.replace": {
      context: "Save option that replaces the existing permalink; keep the URL intact.",
      placeholders: { url: "Existing permalink URL; never translate or modify." },
    },
    "annotation.unavailable": {
      context: "Failure to retrieve a legacy annotation page from the Vault.",
      placeholders: { id: "Unmodified annotation-page resource identifier." },
    },
    "media.unknownError": {
      context:
        "Fallback when the browser media element supplies no error message. Browser-provided diagnostic text remains outside catalogs.",
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
