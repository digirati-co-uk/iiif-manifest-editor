/**
 * Dutch (nl) — shell namespace
 *
 * "Plug-in" (with hyphen) is the official Dutch Van Dale spelling.
 * "Plug-in-instellingen" uses double hyphens for a three-part compound.
 * Panel labels use noun/infinitive forms matching the English ("Aanmaken" for "Create").
 */
export const catalog = {
  project: {
    open: "Project openen",
    export: "Exporteren",
    settings: "Instellingen",
    plugins: "Plug-ins",
    notebook: "Notitieboek",
    noResource: "Geen resource geselecteerd",
  },
  panels: {
    editor: "Editor",
    creator: "Aanmaken",
    preview: "Voorbeeld",
    backgroundActions: "Achtergrondacties",
  },
  plugins: {
    title: "Plug-ins",
    enable: "Inschakelen",
    disable: "Uitschakelen",
    settings: "Plug-in-instellingen",
    loading: "Plug-in laden…",
    loadFailed: "Kon {{pluginName}} niet laden",
  },
  background: {
    running: "Actief",
    complete: "Voltooid",
    cancelled: "Geannuleerd",
    failed: "Mislukt",
    progress: "{{current}} van {{total}}",
    tasks_one: "{{count}} taak",
    tasks_other: "{{count}} taken",
  },
  onboarding: {
    chooseTemplate: "Kies een sjabloon",
    dismiss: "Sluiten",
    start: "Beginnen met bewerken",
  },
} as const;
