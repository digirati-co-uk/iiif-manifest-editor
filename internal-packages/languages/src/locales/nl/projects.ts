/**
 * Dutch (nl) — projects namespace
 *
 * "Concept" is the standard Dutch word for a draft/unsaved document.
 * "Naam wijzigen" (rename) is standard in Dutch file-management contexts.
 * "Zonder titel" is the conventional Dutch placeholder for untitled documents.
 */
export const catalog = {
  menu: {
    apps: "Toepassingen",
    quickSettings: "Snelle instellingen",
    show: "Menu tonen",
    hide: "Menu verbergen",
    toggle: "Toepassingsmenu",
    open: "Openen",
    rename: "Naam wijzigen",
    delete: "Verwijderen",
    export: "Exporteren",
  },
  draft: {
    list: "Concepten",
    edit: "Projecttitel bewerken: {{name}}",
    // Display-only fallback; never save this as a title or use it to derive a filename.
    untitledProject: "Project zonder titel",
    title: "Concepttitel",
    untitled: "Zonder titel",
    save: "Concept opslaan",
  },
  status: { loading: "Laden..." },
  delete: {
    confirm: "Dit project verwijderen?",
  },
} as const;
