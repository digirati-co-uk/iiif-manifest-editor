import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

export const catalog = {
  tourStep: {
    add: "Add a point of interest",
    empty: "No points of interest",
    count_one: "{{count}} point of interest",
    count_other: "{{count}} points of interest",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["exhibition"]>;
