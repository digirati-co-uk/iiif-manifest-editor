/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  app: {
    title: "Collection Editor",
  },
  panels: {
    summary: "Summary",
    items: "Items",
    overview: "Overview",
  },
  items: {
    empty: "No items",
    add: "Add item",
    count_one: "{{count}} item",
    count_other: "{{count}} items",
    removeConfirm: "Remove this item from the collection?",
  },
  manifest: {
    notSelected: "No manifest selected",
  },
} as const;
