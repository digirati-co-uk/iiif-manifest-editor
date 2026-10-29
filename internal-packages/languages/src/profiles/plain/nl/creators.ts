import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

/**
 * Dutch (nl) plain-wording overlay — creators namespace
 *
 * "Iets toevoegen" (add something) matches the English plain "Add something".
 * "Kies wat je wilt toevoegen" is a natural Dutch plain-language instruction.
 * "Pagina toevoegen" replaces "Canvas aanmaken" for plain wording.
 */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Lege pagina",
      summary: "Begin met een afbeeldingsindeling of een lege pagina",
    },
    internalCanvas: {
      label: "Bestaande pagina",
      summary: "Kies een pagina uit dit item.",
    },
    example: {
      label: "Voorbeeld van een lege pagina",
      summary: "Maak een grote lege pagina met een titel.",
    },
    contents: {
      summary: "Maak een sectie om de inhoud van dit item te ordenen.",
    },
    range: {
      summary: "Groepeer pagina’s of andere secties in een sectie.",
    },
    highlight: {
      summary: "Markeer een gebied op de pagina zonder inhoud toe te voegen.",
    },
    html: {
      summary: "Schrijf opgemaakte tekst om op een pagina weer te geven.",
    },
    browser: {
      summary: "Doorzoek een IIIF-item, collectie of ondersteunde collectiewebpagina en kies inhoud om toe te voegen.",
      copyMetadata: "Itemgegevens naar geïmporteerde pagina’s kopiëren",
      copyMetadataHelp: "Kopieert beschrijvende gegevens van het bronitem wanneer de browser een pagina aanmaakt.",
    },
    manifestBrowser: {
      summary: "Doorzoek IIIF-items en collecties om iets te kiezen dat je wilt toevoegen.",
    },
    vtt: {
      summary: "Voeg ondertiteling uit een WebVTT-bestand toe aan een audio- of videopagina.",
    },
  },
  browser: {
    selectCanvas: "Pagina selecteren",
    addToManifest: "Aan item toevoegen",
  },
  errors: {
    vttCanvas: "WebVTT-ondertiteling moet bij een pagina horen.",
    canvas: "De geselecteerde pagina kon niet worden geladen.",
    manifest: "Het geselecteerde item kon niet worden geladen.",
  },
  form: {
    vttHelp:
      "Koppel een bestaand WebVTT-bestand (.vtt) aan deze pagina. Zet het bestand op een openbaar toegankelijke URL voordat je het toevoegt.",
    createRange: "Sectie aanmaken",
  },
  resource: {
    create: "Iets toevoegen",
    chooseType: "Kies wat je wilt toevoegen",
  },
  canvas: {
    create: "Pagina toevoegen",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["creators"]>;
