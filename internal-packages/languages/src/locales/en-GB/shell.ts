/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  project: {
    open: "Open project",
    export: "Export",
    settings: "Settings",
    plugins: "Plugins",
    notebook: "Notebook",
    noResource: "No resource selected",
  },
  panels: {
    editor: "Editor",
    creator: "Create",
    preview: "Preview",
    backgroundActions: "Background actions",
  },
  plugins: {
    title: "Plugins",
    enable: "Enable",
    disable: "Disable",
    settings: "Plugin settings",
    loading: "Loading plugin…",
    loadFailed: "Could not load {{pluginName}}",
  },
  background: {
    running: "Running",
    complete: "Complete",
    cancelled: "Cancelled",
    failed: "Failed",
    progress: "{{current}} of {{total}}",
    tasks_one: "{{count}} task",
    tasks_other: "{{count}} tasks",
  },
  onboarding: {
    chooseTemplate: "Choose a template",
    dismiss: "Dismiss",
    start: "Start editing",
  },
} as const;
