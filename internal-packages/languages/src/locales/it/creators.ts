/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Tela vuota",
      summary: "Inizia con un layout di immagine o una tela bianca",
    },
    internalCanvas: {
      label: "Tela esistente",
      summary: "Scegli una tela da questo manifest.",
    },
    example: {
      label: "Esempio di tela bianca",
      summary: "Crea una grande tela bianca con un titolo.",
    },
    thumbnail: {
      label: "Miniatura IIIF",
      summary: "Crea una miniatura da un servizio di immagini IIIF.",
    },
    vtt: {
      label: "Didascalie WebVTT",
      summary: "Aggiungi sottotitoli o didascalie da un file WebVTT a una tela audio o video.",
    },
    contents: {
      label: "Sommario",
      summary: "Crea un intervallo di livello superiore per organizzare i contenuti del manifest.",
    },
    provider: {
      summary: "Aggiungi l'organizzazione responsabile della fornitura di questa risorsa.",
    },
    browser: {
      label: "Sfoglia i contenuti IIIF",
      summary:
        "Sfoglia un manifest IIIF, una raccolta o una pagina Web di raccolta supportata e scegli il contenuto da aggiungere.",
      copyMetadata: "Aggiungi metadati manifest alle tele importate",
      copyMetadataHelp: "Copia i metadati dal manifest di origine quando IIIF Browser crea un Canvas.",
    },
    manifestBrowser: {
      summary: "Sfoglia i manifest e le raccolte IIIF per scegliere una risorsa da aggiungere.",
    },
    audio: {
      label: "Audio",
      summary: "Aggiungi audio da un collegamento diretto a un file audio.",
    },
    service: {
      label: "Immagine IIIF",
      summary: "Aggiungi un'immagine zoomabile utilizzando un servizio immagini IIIF o un collegamento info.json.",
    },
    highlight: {
      label: "Evidenziare",
      summary: "Segna una regione della tela senza aggiungere alcun contenuto.",
      create: "Crea evidenziazione",
    },
    annotationPage: {
      label: "Pagina di annotazione vuota",
      summary: "Crea una pagina vuota per organizzare le annotazioni.",
    },
    range: {
      summary: "Raggruppa tele o altri intervalli in una sezione.",
    },
    imageList: {
      label: "Immagini multiple",
      summary: "Aggiungi più immagini utilizzando un collegamento immagine diretto per riga.",
    },
    plaintext: {
      label: "Collegamento in testo semplice",
      summary: "Collegamento a un file di testo semplice esterno.",
    },
    htmlBody: {
      label: "Testo formattato",
      summary: "Scrivi testo formattato come contenuto di un'annotazione.",
    },
    html: {
      label: "HTML",
      summary: "Scrivi testo formattato da visualizzare su un'area di disegno.",
    },
    video: {
      label: "Video",
      summary: "Aggiungi video da un collegamento diretto a un file video. Utilizza YouTube per i video YouTube.",
    },
    imageUrl: {
      label: "Immagine",
      summary: "Aggiungi un'immagine utilizzando un collegamento diretto al file immagine.",
    },
    captionedImage: {
      label: "Immagine con didascalia",
      summary: "Aggiungi un'immagine da un collegamento diretto e scrivi la sua didascalia.",
    },
    youtube: {
      label: "YouTube",
      summary: "Incorpora un video utilizzando il collegamento YouTube.",
    },
    webpage: {
      label: "Pagina Web",
      summary: "Collegamento a una pagina Web esterna.",
    },
  },
  form: {
    dimensions: "Pixel {{width}} × {{height}}",
    audioUrl: "Collegamento al file audio",
    addAudio: "Aggiungi l'audio",
    videoUrl: "Collegamento al file video",
    addVideo: "Aggiungi video",
    serviceUrl: "Collegamento al servizio immagini",
    invalidService: "Servizio non valido",
    imageUrl: "Collegamento all'immagine",
    caption: "Didascalia",
    describeImage: "Descrivi l'immagine",
    textUrl: "Collegamento al file di testo semplice",
    youtubeUrl: "Collegamento a YouTube",
    link: "Collegamento",
    createLink: "Crea collegamento",
    createRange: "Crea intervallo",
    addThumbnail: "Aggiungi miniatura",
    selectSize: "Seleziona la taglia",
    urlList: "Inserisci un elenco di URL (uno per riga)",
    homepageLabel: "Etichetta della home page",
    providerId: "Identificativo del fornitore",
    providerIdHelp: "Verrà generato se non specificato, non si tratta di uno URL che l'utente può seguire",
    addProvider: "Aggiungi fornitore",
    vttHelp:
      "Collega un file WebVTT (.vtt) esistente a questa tela. Ospitare il file in un URL pubblico prima di aggiungerlo.",
    vttUrl: "WebVTTfile URL",
    absoluteUrl: "Inserisci un http:// o https:// assoluto URL",
    languageCode: "Lingua (codice BCP 47)",
    languageCodeHelp: "Un codice lingua come en, fr o pt-BR",
    addCaptions: "Aggiungi didascalie",
  },
  browser: {
    selectCanvas: "Seleziona tela",
    select: "Seleziona",
    addToManifest: "Aggiungi a manifest",
  },
  errors: {
    media: "Impossibile caricare questo supporto. Controlla il collegamento e riprova.",
    details: "Dettagli tecnici",
    service: "Impossibile caricare il servizio immagini. Controlla il collegamento e riprova.",
    vttUrl: "Immettere un HTTP o HTTPS URL assoluto per il file WebVTT.",
    vttCanvas: "Le didascalie WebVTT devono appartenere a una tela.",
    manifest: "Impossibile caricare il manifest selezionato.",
    collection: "Impossibile caricare la raccolta selezionata.",
    canvas: "Impossibile caricare la tela selezionata.",
  },
  resource: {
    create: "Crea risorsa",
    chooseType: "Scegli un tipo di risorsa",
    label: "Etichetta",
    url: "URL",
    invalidUrl: "Inserisci un URL valido",
    createFailed: "Impossibile creare questa risorsa",
  },
  canvas: {
    create: "Crea tela",
    width: "Larghezza",
    height: "Altezza",
    duration: "Durata",
  },
  image: {
    fromUrl: "Immagine URL",
    fromService: "Servizio immagini IIIF",
    browse: "Sfoglia le immagini",
    previewAlt: "Anteprima della risorsa selezionata",
    use: "Usa l'immagine",
  },
  content: {
    webPage: "Pagina Web",
    manifest: "Manifesto",
    collection: "Collezione",
  },
} as const;
