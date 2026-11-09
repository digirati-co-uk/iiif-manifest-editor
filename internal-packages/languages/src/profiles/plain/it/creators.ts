/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Pagina vuota",
      summary: "Inizia con un layout di immagine o una pagina vuota",
    },
    internalCanvas: {
      label: "Pagina esistente",
      summary: "Scegli una pagina da questo elemento.",
    },
    example: {
      label: "Esempio di pagina vuota",
      summary: "Crea una grande pagina vuota con un titolo.",
    },
    contents: {
      summary: "Crea una sezione per organizzare i contenuti di questo elemento.",
    },
    range: {
      summary: "Raggruppa pagine o altre sezioni in una sezione.",
    },
    highlight: {
      summary: "Contrassegna un'area della pagina senza aggiungere contenuto.",
    },
    html: {
      summary: "Scrivere testo formattato da visualizzare su una pagina.",
    },
    browser: {
      summary:
        "Sfoglia un elemento IIIF, una raccolta o una pagina Web di una raccolta supportata e scegli il contenuto da aggiungere.",
      copyMetadata: "Copia i dettagli dell'articolo nelle pagine importate",
      copyMetadataHelp: "Copia i dettagli descrittivi dall'elemento di origine quando il browser crea una pagina.",
    },
    manifestBrowser: {
      summary: "Sfoglia gli articoli e le collezioni IIIF per scegliere qualcosa da aggiungere.",
    },
    vtt: {
      summary: "Aggiungi sottotitoli o didascalie da un file WebVTT a una pagina audio o video.",
    },
  },
  browser: {
    selectCanvas: "Seleziona pagina",
    addToManifest: "Aggiungi all'articolo",
  },
  errors: {
    vttCanvas: "Le didascalie WebVTT devono appartenere a una pagina.",
    canvas: "Impossibile caricare la pagina selezionata.",
    manifest: "Impossibile caricare l'elemento selezionato.",
  },
  form: {
    vttHelp:
      "Collega un file WebVTT (.vtt) esistente a questa pagina. Ospitare il file in un URL pubblico prima di aggiungerlo.",
    createRange: "Crea sezione",
  },
  resource: {
    create: "Aggiungi qualcosa",
    chooseType: "Scegli cosa aggiungere",
  },
  canvas: {
    create: "Aggiungi pagina",
  },
} as const;
