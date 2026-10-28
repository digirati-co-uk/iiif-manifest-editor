import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

export const catalog = {
  fields: {
    label: "Title",
    summary: "Description",
    navDate: "Date for sorting",
    requiredStatement: "Credit line",
  },
  canvas: {
    add: "Add page",
    current: "Current page",
    removeConfirm: "Remove this page from the item?",
    count_one: "{{count}} page",
    count_other: "{{count}} pages",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["editors"]>;
