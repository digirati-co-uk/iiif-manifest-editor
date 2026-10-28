/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  app: {
    title: "Manifest Editor",
  },
  panels: {
    overview: "Overview",
    currentCanvas: "Current canvas",
    canvases: "Canvases",
    ranges: "Ranges",
    tags: "Tags",
    notebook: "Notebook",
  },
  canvas: {
    empty: "No canvases",
    add: "Add canvas",
    removeConfirm: "Are you sure you want to remove this canvas?",
  },
  range: {
    create: "Create range",
    empty: "No ranges",
    removeConfirm: "Are you sure you want to delete this range?",
  },
  tags: {
    empty: "No tags",
    add: "Add tag",
  },
  selection: {
    canvases_one: "{{count}} canvas selected",
    canvases_other: "{{count}} canvases selected",
  },
} as const;
