/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  metadata: {
    label: "Oversættelse",
    description: "Oversæt IIIF tekstindhold og administrer sprogtags.",
  },
  settings: {
    sourceLanguage: "Kildesprog",
    targetLanguage: "Målsprog",
    runtime: "Runtime",
  },
  actions: {
    translate: "Oversætte",
    apply: "Anvend oversættelser",
    cancel: "Annuller oversættelse",
  },
  progress: {
    translated_one: "{{count}} felt oversat",
    translated_other: "{{count}} felter oversat",
  },
  results: {
    empty: "Ingen oversættelser",
    existing: "Eksisterende",
    suggested: "Foreslået",
  },
} as const;
