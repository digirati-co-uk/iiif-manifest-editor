/**
 * Dutch (nl) — plugin-ocr-classification namespace
 *
 * "OCR-classificatie" uses a hyphen because OCR is an abbreviation.
 * "Model" is kept as-is (established technical term in Dutch AI/ML context).
 * "Taal" is the correct translation for the source-language setting.
 */
export const catalog = {
  metadata: {
    label: "OCR-classificatie",
    description: "OCR-inhoud classificeren.",
  },
  settings: {
    model: "Model",
    language: "Taal",
    run: "Classificatie uitvoeren",
  },
  results: {
    empty: "Geen resultaten",
    complete: "Classificatie voltooid",
  },
} as const;
