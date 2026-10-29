/**
 * Dutch (nl) — plugin-specifications namespace
 *
 * "Specificaties" is a direct translation; "Projectspecificaties" is a compound noun.
 * "Huidige resource" and "Alle resources" keep "resource" as an established loanword.
 * Status labels "Geslaagd/Mislukt/Overgeslagen" match standard Dutch test-result terminology.
 */
export const catalog = {
  metadata: {
    label: "Specificaties",
    description: "Projectspecificaties en vereist manifestwerk bekijken.",
  },
  filters: {
    current: "Huidige resource",
    all: "Alle resources",
    hideCompleted: "Voltooide verbergen",
  },
  status: {
    passed: "Geslaagd",
    failed: "Mislukt",
    skipped: "Overgeslagen",
  },
} as const;
