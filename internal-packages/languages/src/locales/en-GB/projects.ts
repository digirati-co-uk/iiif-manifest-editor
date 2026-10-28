/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  menu: {
    open: "Open",
    rename: "Rename",
    delete: "Delete",
    export: "Export",
  },
  draft: {
    title: "Draft title",
    untitled: "Untitled",
    save: "Save draft",
  },
  delete: {
    confirm: "Delete this project?",
  },
} as const;
