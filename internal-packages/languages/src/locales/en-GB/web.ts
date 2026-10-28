/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  launcher: {
    title: "Manifest Editor",
    open: "Open",
    create: "Create",
    recent: "Recent projects",
  },
  settings: {
    title: "Settings",
    interfaceLanguage: "Interface language",
    availableLanguages: "Available languages",
    wording: "Wording",
    contentLanguages: "Content languages",
  },
  browser: {
    open: "Open in editor",
    loading: "Loading…",
  },
} as const;
