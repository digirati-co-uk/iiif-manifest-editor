/**
 * Dutch (nl) — plugin-annotations namespace
 *
 * "Annotaties" is the standard Dutch plural.
 * Description is a complete Dutch sentence ending in a period.
 */
export const catalog = {
  metadata: {
    label: "Annotaties",
    description: "Annotaties aanmaken en bewerken.",
  },
  panel: {
    empty: "Geen annotaties",
    create: "Annotatie aanmaken",
    import: "Annotaties importeren",
  },
  progress: {
    imported_one: "{{count}} annotatie geïmporteerd",
    imported_other: "{{count}} annotaties geïmporteerd",
  },
} as const;
