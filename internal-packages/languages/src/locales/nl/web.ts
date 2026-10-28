/**
 * Dutch (nl) — web namespace
 *
 * "Manifest Editor" is kept as the product name.
 * "Interfacetaal" (interface language) is a standard compound in Dutch software.
 * "Woordgebruik" (wording) captures the wording-profile concept naturally.
 * "Inhoudstalen" (content languages) is the plural of "inhoudstaal" — distinct
 * from "interfacetaal" to preserve the separation the plan requires.
 */
export const catalog = {
  launcher: {
    title: "Manifest Editor",
    open: "Openen",
    create: "Aanmaken",
    recent: "Recente projecten",
  },
  settings: {
    title: "Instellingen",
    interfaceLanguage: "Interfacetaal",
    wording: "Woordgebruik",
    contentLanguages: "Inhoudstalen",
  },
  browser: {
    open: "Openen in editor",
    loading: "Laden…",
  },
} as const;
