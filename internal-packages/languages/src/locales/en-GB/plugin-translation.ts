/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  metadata: {
    label: "Translation",
    description: "Translate IIIF textual content and manage language tags.",
  },
  settings: {
    sourceLanguage: "Source language",
    targetLanguage: "Target language",
    runtime: "Runtime",
  },
  actions: {
    translate: "Translate",
    apply: "Apply translations",
    cancel: "Cancel translation",
  },
  progress: {
    translated_one: "{{count}} field translated",
    translated_other: "{{count}} fields translated",
  },
  results: {
    empty: "No translations",
    existing: "Existing",
    suggested: "Suggested",
  },
} as const;
