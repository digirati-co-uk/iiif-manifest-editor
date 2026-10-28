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
  navigation: {
    home: "Startpagina van Manifest Editor",
    github: "GitHub",
    documentation: "Documentatie",
  },
  launcher: {
    title: "Manifest Editor",
    open: "Openen",
    create: "Aanmaken",
    recent: "Recente projecten",
  },
  settings: {
    changeFailed: "De interface-instellingen konden niet worden gewijzigd. Probeer het opnieuw.",
    title: "Instellingen",
    interfaceLanguage: "Interfacetaal",
    availableLanguages: "Beschikbare talen",
    wording: "Woordgebruik",
    contentLanguages: "Inhoudstalen",
  },
  browser: {
    open: "Openen in editor",
    loading: "Laden…",
  },
} as const;
