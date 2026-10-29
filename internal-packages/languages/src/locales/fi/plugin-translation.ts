/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  metadata: {
    label: "Käännös",
    description: "Käännä IIIF-tekstisisältöä ja hallitse kielitunnisteita.",
  },
  settings: {
    sourceLanguage: "Alkuperäinen kieli",
    targetLanguage: "Kohdekieli",
    runtime: "Suoritusaika",
  },
  actions: {
    translate: "Kääntää",
    apply: "Käytä käännöksiä",
    cancel: "Peruuta käännös",
  },
  progress: {
    translated_one: "{{count}} kenttä käännetty",
    translated_other: "{{count}} kenttää käännetty",
  },
  results: {
    empty: "Ei käännöksiä",
    existing: "Olemassa",
    suggested: "Ehdotettu",
  },
} as const;
