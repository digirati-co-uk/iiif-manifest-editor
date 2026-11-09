/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Tom side",
      summary: "Start med et billedlayout eller en tom side",
    },
    internalCanvas: {
      label: "Eksisterende side",
      summary: "Vælg en side fra dette element.",
    },
    example: {
      label: "Eksempel på tom side",
      summary: "Opret en stor tom side med en titel.",
    },
    contents: {
      summary: "Opret en sektion for at organisere dette elements indhold.",
    },
    range: {
      summary: "Gruppér sider eller andre sektioner i en sektion.",
    },
    highlight: {
      summary: "Marker et område på siden uden at tilføje indhold.",
    },
    html: {
      summary: "Skriv formateret tekst, der skal vises på en side.",
    },
    browser: {
      summary:
        "Gennemse et IIIF-element, en samling eller en understøttet samlingswebside, og vælg indhold, der skal tilføjes.",
      copyMetadata: "Kopier vareoplysninger til importerede sider",
      copyMetadataHelp: "Kopierer beskrivende detaljer fra kildeelementet, når browseren opretter en side.",
    },
    manifestBrowser: {
      summary: "Gennemse IIIF genstande og samlinger for at vælge noget at tilføje.",
    },
    vtt: {
      summary: "Tilføj undertekster eller billedtekster fra en WebVTT-fil til en lyd- eller videoside.",
    },
  },
  browser: {
    selectCanvas: "Vælg side",
    addToManifest: "Tilføj til vare",
  },
  errors: {
    vttCanvas: "WebVTT billedtekster skal tilhøre en side.",
    canvas: "Kunne ikke indlæse den valgte side.",
    manifest: "Kunne ikke indlæse det valgte element.",
  },
  form: {
    vttHelp:
      "Link en eksisterende WebVTT (.vtt) fil til denne side. Host filen på en offentlig URL, før du tilføjer den.",
    createRange: "Opret sektion",
  },
  resource: {
    create: "Tilføj noget",
    chooseType: "Vælg, hvad du vil tilføje",
  },
  canvas: {
    create: "Tilføj side",
  },
} as const;
