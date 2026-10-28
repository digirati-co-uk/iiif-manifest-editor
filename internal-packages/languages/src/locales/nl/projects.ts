/**
 * Dutch (nl) — projects namespace
 *
 * "Concept" is the standard Dutch word for a draft/unsaved document.
 * "Naam wijzigen" (rename) is standard in Dutch file-management contexts.
 * "Zonder titel" is the conventional Dutch placeholder for untitled documents.
 */
export const catalog = {
  menu: {
    open: "Openen",
    rename: "Naam wijzigen",
    delete: "Verwijderen",
    export: "Exporteren",
  },
  draft: {
    title: "Concepttitel",
    untitled: "Zonder titel",
    save: "Concept opslaan",
  },
  delete: {
    confirm: "Dit project verwijderen?",
  },
} as const;
