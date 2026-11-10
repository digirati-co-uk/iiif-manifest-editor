/** Project controls. Authored project names and persisted creation defaults are never translated. */
export const catalog = {
  menu: {
    apps: "Apps",
    quickSettings: "Quick Settings",
    show: "Show menu",
    hide: "Hide menu",
    toggle: "App menu",
    open: "Open",
    rename: "Rename",
    delete: "Delete",
    export: "Export",
  },
  draft: {
    list: "Drafts",
    edit: "Edit project title: {{name}}",
    // Display-only fallback; never save this as a title or use it to derive a filename.
    untitledProject: "Untitled project",
    title: "Draft title",
    untitled: "Untitled",
    save: "Save draft",
  },
  status: { loading: "Loading..." },
  delete: {
    confirm: "Delete this project?",
  },
} as const;
