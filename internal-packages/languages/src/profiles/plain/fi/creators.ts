/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Tyhjä sivu",
      summary: "Aloita kuva-asettelulla tai tyhjällä sivulla",
    },
    internalCanvas: {
      label: "Olemassa oleva sivu",
      summary: "Valitse sivu tästä kohteesta.",
    },
    example: {
      label: "Esimerkki tyhjästä sivusta",
      summary: "Luo suuri tyhjä sivu otsikolla.",
    },
    contents: {
      summary: "Luo osio tämän kohteen sisällön järjestämiseksi.",
    },
    range: {
      summary: "Ryhmittele sivut tai muut osat osioon.",
    },
    highlight: {
      summary: "Merkitse sivun alue lisäämättä sisältöä.",
    },
    html: {
      summary: "Kirjoita muotoiltu teksti sivulla näytettäväksi.",
    },
    browser: {
      summary: "Selaa IIIF-kohdetta, -kokoelmaa tai tuetun kokoelman verkkosivua ja valitse lisättävä sisältö.",
      copyMetadata: "Kopioi kohteen tiedot tuoduille sivuille",
      copyMetadataHelp: "Kopioi kuvaavat tiedot lähdekohdasta, kun selain luo sivun.",
    },
    manifestBrowser: {
      summary: "Selaa IIIF-tuotteita ja -kokoelmia ja valitse jotain lisättävää.",
    },
    vtt: {
      summary: "Lisää tekstityksiä WebVTT-tiedostosta ääni- tai videosivulle.",
    },
  },
  browser: {
    selectCanvas: "Valitse sivu",
    addToManifest: "Lisää kohteeseen",
  },
  errors: {
    vttCanvas: "WebVTT-tekstityksen on kuuluttava sivulle.",
    canvas: "Valittua sivua ei voitu ladata.",
    manifest: "Valittua kohdetta ei voitu ladata.",
  },
  form: {
    vttHelp:
      "Linkitä olemassa oleva WebVTT (.vtt) -tiedosto tälle sivulle. Isännöi tiedosto julkisessa URL:ssa ennen sen lisäämistä.",
    createRange: "Luo osio",
  },
  resource: {
    create: "Lisää jotain",
    chooseType: "Valitse, mitä haluat lisätä",
  },
  canvas: {
    create: "Lisää sivu",
  },
} as const;
