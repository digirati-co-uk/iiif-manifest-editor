import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

export const catalog = {
  resource: {
    create: "Add something",
    chooseType: "Choose what to add",
  },
  canvas: {
    create: "Add page",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["creators"]>;
