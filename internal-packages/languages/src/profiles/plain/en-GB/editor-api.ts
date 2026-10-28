import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

/** System display labels only; technical documentation and stored IIIF values retain their meaning. */
export const catalog = {
  resources: { manifest: "Item", canvas: "Page", range: "Section" },
  fields: {
    label: "Title",
    summary: "Description",
    navDate: "Date for sorting",
    requiredStatement: "Credit line",
    start: "Starting page",
  },
  layout: { blank: "Blank page" },
  behavior: {
    groups: {
      manifestOrdering: "Item order",
      canvasOrdering: "Page order",
      range: "Section",
      rangeOrdering: "Section order",
    },
    values: { individuals: "Individual pages" },
  },
} as const satisfies CatalogOverlay<SourceCatalogs["editor-api"]>;
