/**
 * Dutch (nl) — plugin-translation namespace
 *
 * This plugin translates IIIF textual content, not the editor UI.
 * "Brontaal/doeltaal" are standard Dutch terms in translation tooling.
 * "Runtime" is kept as-is (established technical term in Dutch).
 * "Taallabels" (language tags) — "label" here means a BCP-47 tag, not the IIIF label
 * property; "taallabels beheren" makes this clear in context.
 *
 * Plural of "veld" → "velden" (standard Dutch plural of a neuter noun).
 */
export const catalog = {
  metadata: {
    label: "Vertaling",
    description: "IIIF-tekstinhoud vertalen en taallabels beheren.",
  },
  settings: {
    sourceLanguage: "Brontaal",
    targetLanguage: "Doeltaal",
    runtime: "Runtime",
  },
  actions: {
    translate: "Vertalen",
    apply: "Vertalingen toepassen",
    cancel: "Vertaling annuleren",
  },
  progress: {
    translated_one: "{{count}} veld vertaald",
    translated_other: "{{count}} velden vertaald",
  },
  results: {
    empty: "Geen vertalingen",
    existing: "Bestaand",
    suggested: "Voorgesteld",
  },
} as const;
