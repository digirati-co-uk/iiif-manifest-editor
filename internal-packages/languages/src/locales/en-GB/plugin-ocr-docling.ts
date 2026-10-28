/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  metadata: {
    label: "Docling OCR",
    description: "Extract text with Docling.",
  },
  settings: {
    language: "Language",
    run: "Run OCR",
    options: "OCR options",
  },
  results: {
    empty: "No results",
    apply: "Apply results",
  },
} as const;
