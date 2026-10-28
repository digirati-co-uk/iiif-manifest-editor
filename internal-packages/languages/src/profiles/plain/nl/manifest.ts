import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

/**
 * Dutch (nl) plain-wording overlay — manifest namespace
 *
 * Plain wording substitutions (matching the English plain profile):
 *   Manifest Editor → Itemeditor
 *   canvas(sen)     → pagina('s)  (apostrophe required in "pagina's")
 *   range(s)        → sectie(s)
 *   Current canvas  → Huidige pagina
 *
 * "Itemeditor" (no hyphen): "item" ends in a consonant in Dutch phonology,
 * so the compound does not require a hyphen.
 */
export const catalog = {
  app: {
    title: "Itemeditor",
  },
  panels: {
    currentCanvas: "Huidige pagina",
    canvases: "Pagina's",
    ranges: "Secties",
  },
  canvas: {
    empty: "Geen pagina's",
    add: "Pagina toevoegen",
    removeConfirm: "Deze pagina uit het item verwijderen?",
  },
  range: {
    create: "Sectie toevoegen",
    empty: "Geen secties",
    removeConfirm: "Deze sectie verwijderen?",
  },
  selection: {
    canvases_one: "{{count}} pagina geselecteerd",
    canvases_other: "{{count}} pagina's geselecteerd",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["manifest"]>;
