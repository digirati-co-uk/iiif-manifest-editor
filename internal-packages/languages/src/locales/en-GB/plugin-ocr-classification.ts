/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  metadata: {
    label: "OCR classification",
    description: "Classify OCR content.",
  },
  settings: {
    model: "Model",
    language: "Language",
    run: "Run classification",
  },
  results: {
    empty: "No results",
    complete: "Classification complete",
  },
} as const;
