import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

/** Same terminology choices as the editor fields: item, pagina, sectie, titel and bronvermelding. */
export const catalog = {
  resources: { manifest: "Item", canvas: "Pagina", range: "Sectie" },
  fields: {
    label: "Titel",
    summary: "Beschrijving",
    navDate: "Sorteerdatum",
    requiredStatement: "Bronvermelding",
    start: "Beginpagina",
  },
  layout: { blank: "Lege pagina" },
  behavior: {
    groups: {
      manifestOrdering: "Volgorde van het item",
      canvasOrdering: "Paginavolgorde",
      range: "Sectie",
      rangeOrdering: "Volgorde van secties",
    },
    values: { individuals: "Afzonderlijke pagina's" },
  },
} as const satisfies CatalogOverlay<SourceCatalogs["editor-api"]>;
