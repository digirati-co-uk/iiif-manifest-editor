/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  metadata: {
    label: "Переклад",
    description: "Перекладайте текстовий вміст IIIF і керуйте мовними тегами.",
  },
  settings: {
    sourceLanguage: "Мова оригіналу",
    targetLanguage: "Цільова мова",
    runtime: "Час виконання",
  },
  actions: {
    translate: "Перекласти",
    apply: "Застосувати переклади",
    cancel: "Скасувати переклад",
  },
  progress: {
    translated_one: "Перекладено {{count}} поле",
    translated_few: "Перекладено {{count}} поля",
    translated_many: "Перекладено {{count}} полів",
    translated_other: "Перекладено {{count}} поля",
  },
  results: {
    empty: "Немає перекладів",
    existing: "Існуючий",
    suggested: "Запропоновано",
  },
} as const;
