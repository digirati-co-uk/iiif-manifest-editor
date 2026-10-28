/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  metadata: {
    label: "Traducción",
    description: "Traduce contenido textual IIIF y administra etiquetas de idioma.",
  },
  settings: {
    sourceLanguage: "Idioma de origen",
    targetLanguage: "Lengua de llegada",
    runtime: "Tiempo de ejecución",
  },
  actions: {
    translate: "Traducir",
    apply: "Aplicar traducciones",
    cancel: "Cancelar traducción",
  },
  progress: {
    translated_one: "{{count}} campo traducido",
    translated_many: "{{count}} campos traducidos",
    translated_other: "{{count}} campos traducidos",
  },
  results: {
    empty: "Sin traducciones",
    existing: "Existente",
    suggested: "sugerido",
  },
} as const;
