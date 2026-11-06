/**
 * Dutch (nl) — plugin-ocr-docling namespace
 *
 * "Docling OCR" kept as-is (brand name).
 * "OCR-opties" uses a hyphen (abbreviation compound).
 * "Resultaten toepassen" is natural Dutch for "Apply results".
 */
export const catalog = {
  metadata: {
    label: "Docling OCR",
    description: "Tekst extraheren met Docling.",
  },
  settings: {
    language: "Taal",
    run: "OCR uitvoeren",
    options: "OCR-opties",
  },
  results: {
    empty: "Geen resultaten",
    apply: "Resultaten toepassen",
  },
} as const;
