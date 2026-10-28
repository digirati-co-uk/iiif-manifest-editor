/**
 * Dutch (nl) — manifest namespace
 *
 * "Canvassen" is the standard Dutch plural of the loanword "canvas".
 * "Ranges" is kept untranslated (IIIF technical term; plain wording uses "secties").
 * "Tags" is kept untranslated (established term in Dutch digital tooling).
 * Panel labels use the same casing as English (nouns, not sentences).
 */
export const catalog = {
  app: {
    title: "Manifest Editor",
  },
  panels: {
    overview: "Overzicht",
    currentCanvas: "Huidig canvas",
    canvases: "Canvassen",
    ranges: "Ranges",
    tags: "Tags",
    notebook: "Notitieboek",
  },
  canvas: {
    empty: "Geen canvassen",
    add: "Canvas toevoegen",
    removeConfirm: "Weet je zeker dat je dit canvas wilt verwijderen?",
  },
  range: {
    create: "Range aanmaken",
    empty: "Geen ranges",
    removeConfirm: "Weet je zeker dat je deze range wilt verwijderen?",
  },
  tags: {
    empty: "Geen tags",
    add: "Tag toevoegen",
  },
  selection: {
    canvases_one: "{{count}} canvas geselecteerd",
    canvases_other: "{{count}} canvassen geselecteerd",
  },
} as const;
