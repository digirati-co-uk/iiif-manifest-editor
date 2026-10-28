/**
 * Dutch (nl) — editors namespace
 *
 * IIIF terms kept untranslated: "canvas", "manifest", "metadata", "label"
 * (as a form-field label for the IIIF label property).
 * "Label" as a form-field heading is an established UI term in Dutch.
 *
 * navDate: "navigatiedatum" – whole Dutch noun, not a literal transliteration.
 * Plural of "canvas" → "canvassen" (regular Dutch pluralisation of loanwords ending in a consonant).
 * Confirmation messages use direct phrasing; whole sentences are required
 * for grammatical agreement (see translator note editors:canvas.removeConfirm).
 */
export const catalog = {
  fields: {
    label: "Label",
    summary: "Samenvatting",
    thumbnail: "Miniatuur",
    rights: "Rechten",
    navDate: "Navigatiedatum",
    metadata: "Metadata",
    provider: "Aanbieder",
    language: "Taal",
    requiredStatement: "Vereiste verklaring",
  },
  canvas: {
    add: "Canvas toevoegen",
    current: "Huidig canvas",
    removeConfirm: "Dit canvas uit het manifest verwijderen?",
    count_one: "{{count}} canvas",
    count_other: "{{count}} canvassen",
  },
  metadata: {
    add: "Metadata toevoegen",
    label: "Label",
    value: "Waarde",
    empty: "Geen metadata",
  },
  language: {
    add: "Taal toevoegen",
    none: "Geen taal",
    remove: "Taal verwijderen",
    switchPlainConfirm:
      "Door over te schakelen naar platte tekst wordt opmaak zoals vet, koppelingen en koppen verwijderd. Doorgaan?",
  },
  thumbnail: {
    empty: "Geen miniatuur",
    choose: "Miniatuur kiezen",
  },
  navDate: {
    openCalendar: "Kalender voor navigatiedatum openen",
    clear: "Navigatiedatum wissen",
    day: "Dag navigatiedatum",
    month: "Maand navigatiedatum",
    year: "Jaar navigatiedatum",
    hour: "Uur navigatiedatum",
    minute: "Minuut navigatiedatum",
  },
  provider: {
    removeConfirm: "Weet je zeker dat je deze aanbieder wilt verwijderen?",
  },
} as const;
