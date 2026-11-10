import type { CatalogOverlay } from "../../../../schema.ts";
import type { SourceCatalogs } from "../../../../catalog-types.ts";

/**
 * Dutch (nl) exhibition-preset + plain-profile intersection overlay — editors namespace
 *
 * In the exhibition context, even the plain profile uses "dia" (slide) rather than
 * "pagina" (page), because a dia is the plain-language name for an exhibition slide.
 * This mirrors the English intersection overlay (same content, Dutch wording).
 *
 * The plain-profile field-label overrides (titel/beschrijving) come from the plain
 * profile layer and are NOT repeated here; only the canvas group needs the
 * exhibition+plain intersection treatment.
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
