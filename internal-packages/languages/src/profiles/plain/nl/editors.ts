import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

/**
 * Dutch (nl) plain-wording overlay — editors namespace
 *
 * Replaces IIIF terminology with plain Dutch equivalents:
 *   canvas   → pagina (page)
 *   manifest → item  (handled in the manifest overlay)
 *   label    → titel (title)
 *   summary  → beschrijving (description)
 *
 * "Pagina's" uses an apostrophe before -s; this is mandatory Dutch orthography
 * for words ending in a vowel sound (pagina ends in /a/).
 *
 * "Sorteerdatum" (nav date) and "Bronvermelding" (required statement / credit line)
 * follow the same plain-language substitutions as the English plain profile.
 */
export const catalog = {
  fields: {
    label: "Titel",
    summary: "Beschrijving",
    navDate: "Sorteerdatum",
    requiredStatement: "Bronvermelding",
  },
  canvas: {
    add: "Pagina toevoegen",
    current: "Huidige pagina",
    removeConfirm: "Deze pagina uit het item verwijderen?",
    count_one: "{{count}} pagina",
    count_other: "{{count}} pagina's",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["editors"]>;
