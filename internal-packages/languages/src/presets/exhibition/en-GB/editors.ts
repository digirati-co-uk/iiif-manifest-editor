import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

export const catalog = {
  canvas: {
    add: "Add slide",
    current: "Current slide",
    removeConfirm: "Remove this slide from the exhibition?",
    count_one: "{{count}} slide",
    count_other: "{{count}} slides",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["editors"]>;
