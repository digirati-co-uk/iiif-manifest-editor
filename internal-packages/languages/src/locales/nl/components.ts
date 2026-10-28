/**
 * Dutch (nl) — components namespace
 *
 * Error titles use a complete Dutch sentence: "Er is iets misgegaan."
 * "Volledig scherm" is two words in Dutch (unlike the compound "Vollbildmodus" in German).
 */
export const catalog = {
  empty: {
    manifest: "Dit manifest heeft geen canvassen",
    selection: "Geen items geselecteerd",
  },
  controls: {
    zoomIn: "Inzoomen",
    zoomOut: "Uitzoomen",
    resetView: "Weergave resetten",
    toggleFullscreen: "Volledig scherm in-/uitschakelen",
    resizeList: "Lijst van grootte wijzigen",
  },
  errors: {
    title: "Er is iets misgegaan",
    retry: "Opnieuw proberen",
  },
  selection: {
    selectItem: "{{itemName}} selecteren",
  },
} as const;
