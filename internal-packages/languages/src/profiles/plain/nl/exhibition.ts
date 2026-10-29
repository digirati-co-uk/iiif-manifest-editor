import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

/**
 * Dutch (nl) plain-wording overlay — exhibition namespace
 *
 * "Punt van interesse" (point of interest) matches the English plain profile.
 * Plural: "punten van interesse" (regular Dutch plural of "punt").
 * These replace IIIF tour-step terminology with plain visitor-oriented language.
 */
export const catalog = {
  tourStep: {
    add: "Punt van interesse toevoegen",
    empty: "Geen punten van interesse",
    count_one: "{{count}} punt van interesse",
    count_other: "{{count}} punten van interesse",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["exhibition"]>;
