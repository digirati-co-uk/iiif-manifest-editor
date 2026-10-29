/**
 * Dutch (nl) — common namespace
 *
 * Terminology choices
 *   Remove vs Delete: both map to "Verwijderen" (remove a reference or delete a resource).
 *   The translator-notes entry for common:actions.remove explains the semantic distinction;
 *   Dutch has no standard single-word split for this pair in UI contexts.
 *
 *   Register: infinitive verb forms for action labels (standard Dutch software convention).
 *   Confirmation messages use direct phrasing without "u/je" possessive where possible.
 */
export const catalog = {
  actions: {
    add: "Toevoegen",
    apply: "Toepassen",
    back: "Terug",
    cancel: "Annuleren",
    close: "Sluiten",
    confirm: "Bevestigen",
    continue: "Doorgaan",
    copy: "Kopiëren",
    create: "Aanmaken",
    delete: "Verwijderen",
    done: "Klaar",
    download: "Downloaden",
    edit: "Bewerken",
    open: "Openen",
    preview: "Voorbeeld",
    remove: "Verwijderen",
    reset: "Opnieuw instellen",
    retry: "Opnieuw proberen",
    save: "Opslaan",
    search: "Zoeken",
    select: "Selecteren",
    upload: "Uploaden",
  },
  status: {
    loading: "Laden…",
    saving: "Opslaan…",
    saved: "Opgeslagen",
    failed: "Mislukt",
    empty: "Geen items",
    selected_one: "{{count}} item geselecteerd",
    selected_other: "{{count}} items geselecteerd",
  },
  accessibility: {
    closeDialog: "Dialoogvenster sluiten",
    openMenu: "Menu openen",
    moreActions: "Meer acties",
    moveUp: "Omhoog verplaatsen",
    moveDown: "Omlaag verplaatsen",
  },
} as const;
