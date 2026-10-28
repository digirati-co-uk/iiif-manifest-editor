/**
 * Dutch (nl) — plugin-canvas-label-generator namespace
 *
 * "Canvaslabels" is a Dutch compound (canvas + labels); no hyphen needed.
 * "Labelpatroon" and "Startnummer" follow the same compound-noun convention.
 * "Startnummer" is an established Dutch loanword for a starting number/index.
 */
export const catalog = {
  metadata: {
    label: "Canvaslabels",
    description: "Canvaslabels genereren.",
  },
  settings: {
    pattern: "Labelpatroon",
    start: "Startnummer",
    preview: "Labels bekijken",
  },
  results: {
    updated_one: "{{count}} canvas bijgewerkt",
    updated_other: "{{count}} canvassen bijgewerkt",
  },
} as const;
