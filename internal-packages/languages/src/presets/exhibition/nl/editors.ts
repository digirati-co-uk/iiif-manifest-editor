import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

/**
 * Dutch (nl) exhibition-preset overlay — editors namespace
 *
 * Replaces canvas terminology with exhibition-specific "dia" (slide/slide of a presentation).
 * "Dia's" requires an apostrophe before -s in Dutch (word ends in vowel /a/).
 * These are the same substitutions as the English exhibition overlay, rendered in Dutch.
 */
export const catalog = {
  canvas: {
    add: "Dia toevoegen",
    current: "Huidige dia",
    removeConfirm: "Deze dia uit de tentoonstelling verwijderen?",
    count_one: "{{count}} dia",
    count_other: "{{count}} dia's",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["editors"]>;
