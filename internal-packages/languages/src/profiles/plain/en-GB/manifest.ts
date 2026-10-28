import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

export const catalog = {
  app: {
    title: "Item editor",
  },
  panels: {
    currentCanvas: "Current page",
    canvases: "Pages",
    ranges: "Sections",
  },
  canvas: {
    empty: "No pages",
    add: "Add page",
    removeConfirm: "Remove this page from the item?",
  },
  range: {
    create: "Add section",
    empty: "No sections",
    removeConfirm: "Delete this section?",
  },
  selection: {
    canvases_one: "{{count}} page selected",
    canvases_other: "{{count}} pages selected",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["manifest"]>;
