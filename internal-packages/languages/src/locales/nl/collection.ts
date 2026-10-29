/**
 * Dutch (nl) — collection namespace
 *
 * "Collectie-editor" uses a hyphen because "editor" is a foreign word compounded
 * with the Dutch "Collectie". The standard Dutch practice for foreign loanword
 * compounds is to use a hyphen to prevent ambiguity.
 * "Items" is kept as-is (established loanword in Dutch).
 */
export const catalog = {
  app: {
    title: "Collectie-editor",
  },
  panels: {
    summary: "Samenvatting",
    items: "Items",
    overview: "Overzicht",
  },
  items: {
    empty: "Geen items",
    add: "Item toevoegen",
    count_one: "{{count}} item",
    count_other: "{{count}} items",
    removeConfirm: "Dit item uit de collectie verwijderen?",
  },
  manifest: {
    notSelected: "Geen manifest geselecteerd",
  },
} as const;
