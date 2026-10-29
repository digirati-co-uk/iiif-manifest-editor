/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  metadata: {
    label: "Annotations",
    description: "Create and edit annotations.",
  },
  panel: {
    empty: "No annotations",
    create: "Create annotation",
    import: "Import annotations",
  },
  progress: {
    imported_one: "{{count}} annotation imported",
    imported_other: "{{count}} annotations imported",
  },
} as const;
