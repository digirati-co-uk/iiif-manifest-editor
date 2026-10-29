/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  metadata: {
    label: "Překlad",
    description: "Překládejte textový obsah IIIF a spravujte jazykové značky.",
  },
  settings: {
    sourceLanguage: "Zdrojový jazyk",
    targetLanguage: "Cílový jazyk",
    runtime: "Doba běhu",
  },
  actions: {
    translate: "Přeložit",
    apply: "Použít překlady",
    cancel: "Zrušit překlad",
  },
  progress: {
    translated_one: "{{count}} pole přeloženo",
    translated_few: "{{count}} pole přeložena",
    translated_many: "Přeloženo {{count}} pole",
    translated_other: "{{count}} polí přeloženo",
  },
  results: {
    empty: "Žádné překlady",
    existing: "Existující",
    suggested: "Doporučeno",
  },
} as const;
