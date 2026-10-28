/**
 * Dutch (nl) — creators namespace
 *
 * IIIF terms kept untranslated: "canvas", "manifest", "collection".
 * "Collectie" is used for the human-readable label where it appears as a
 * content category; "collection" remains the IIIF term in identifiers.
 *
 * "IIIF-afbeeldingsdienst" – compound with hyphen because IIIF is an abbreviation.
 */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Leeg canvas",
      summary: "Begin met een afbeeldingsindeling of een leeg canvas",
    },
    internalCanvas: {
      label: "Bestaand canvas",
      summary: "Kies een canvas uit dit manifest.",
    },
    example: {
      label: "Voorbeeld van een leeg canvas",
      summary: "Maak een groot leeg canvas met een titel.",
    },
    thumbnail: {
      label: "IIIF-miniatuur",
      summary: "Maak een miniatuur met een IIIF-afbeeldingsdienst.",
    },
    vtt: {
      label: "WebVTT-ondertiteling",
      summary: "Voeg ondertiteling uit een WebVTT-bestand toe aan een audio- of videocanvas.",
    },
    contents: {
      label: "Inhoudsopgave",
      summary: "Maak een overkoepelende range om de inhoud van het manifest te ordenen.",
    },
    provider: {
      summary: "Voeg de organisatie toe die deze resource aanbiedt.",
    },
    browser: {
      label: "IIIF-inhoud doorzoeken",
      summary:
        "Doorzoek een IIIF-manifest, collectie of ondersteunde collectiewebpagina en kies inhoud om toe te voegen.",
      copyMetadata: "Metadata van het manifest aan geïmporteerde canvassen toevoegen",
      copyMetadataHelp: "Kopieert metadata van het bronmanifest wanneer de IIIF-browser een canvas aanmaakt.",
    },
    manifestBrowser: {
      summary: "Doorzoek IIIF-manifesten en collecties om een resource te kiezen die je wilt toevoegen.",
    },
    audio: {
      label: "Geluid",
      summary: "Voeg geluid toe met een rechtstreekse link naar een audiobestand.",
    },
    service: {
      label: "IIIF-afbeelding",
      summary: "Voeg een zoombare afbeelding toe met een IIIF-afbeeldingsdienst of een link naar info.json.",
    },
    highlight: {
      label: "Markering",
      summary: "Markeer een gebied op het canvas zonder inhoud toe te voegen.",
      create: "Markering aanmaken",
    },
    annotationPage: {
      label: "Lege annotatiepagina",
      summary: "Maak een lege pagina om annotaties te ordenen.",
    },
    range: {
      summary: "Groepeer canvassen of andere ranges in een sectie.",
    },
    imageList: {
      label: "Meerdere afbeeldingen",
      summary: "Voeg meerdere afbeeldingen toe met één rechtstreekse afbeeldingslink per regel.",
    },
    plaintext: {
      label: "Link naar platte tekst",
      summary: "Verwijs naar een extern bestand met platte tekst.",
    },
    htmlBody: {
      label: "Opgemaakte tekst",
      summary: "Schrijf opgemaakte tekst als inhoud van een annotatie.",
    },
    html: {
      label: "HTML",
      summary: "Schrijf opgemaakte tekst om op een canvas weer te geven.",
    },
    video: {
      label: "Video",
      summary:
        "Voeg een video toe met een rechtstreekse link naar een videobestand. Gebruik YouTube voor YouTube-video’s.",
    },
    imageUrl: {
      label: "Afbeelding",
      summary: "Voeg een afbeelding toe met een rechtstreekse link naar een afbeeldingsbestand.",
    },
    captionedImage: {
      label: "Afbeelding met bijschrift",
      summary: "Voeg een afbeelding toe met een rechtstreekse link en schrijf het bijschrift.",
    },
    youtube: {
      label: "YouTube",
      summary: "Voeg een video in met de YouTube-link.",
    },
    webpage: {
      label: "Webpagina",
      summary: "Verwijs naar een externe webpagina.",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} pixels",
    audioUrl: "Link naar audiobestand",
    addAudio: "Geluid toevoegen",
    videoUrl: "Link naar videobestand",
    addVideo: "Video toevoegen",
    serviceUrl: "Link naar afbeeldingsdienst",
    invalidService: "Ongeldige afbeeldingsdienst",
    imageUrl: "Link naar afbeelding",
    caption: "Bijschrift",
    describeImage: "Beschrijf de afbeelding",
    textUrl: "Link naar bestand met platte tekst",
    youtubeUrl: "Link naar YouTube",
    link: "Verwijzing",
    createLink: "Link aanmaken",
    createRange: "Range aanmaken",
    addThumbnail: "Miniatuur toevoegen",
    selectSize: "Afmetingen kiezen",
    urlList: "Voer een lijst met URL’s in (één per regel)",
    homepageLabel: "Label van startpagina",
    providerId: "ID van aanbieder",
    providerIdHelp: "Wordt automatisch aangemaakt als je niets invult. Dit is geen link die de gebruiker kan openen.",
    addProvider: "Aanbieder toevoegen",
    vttHelp:
      "Koppel een bestaand WebVTT-bestand (.vtt) aan dit canvas. Zet het bestand op een openbaar toegankelijke URL voordat je het toevoegt.",
    vttUrl: "URL van WebVTT-bestand",
    absoluteUrl: "Voer een volledige URL in die begint met http:// of https://",
    languageCode: "Taal (BCP 47-code)",
    languageCodeHelp: "Een taalcode, zoals en, fr of pt-BR",
    addCaptions: "Ondertiteling toevoegen",
  },
  browser: {
    selectCanvas: "Canvas selecteren",
    select: "Selecteren",
    addToManifest: "Aan manifest toevoegen",
  },
  errors: {
    media: "Deze media kon niet worden geladen. Controleer de link en probeer het opnieuw.",
    details: "Technische details",
    service: "De afbeeldingsdienst kon niet worden geladen. Controleer de link en probeer het opnieuw.",
    vttUrl: "Voer een volledige HTTP- of HTTPS-URL voor het WebVTT-bestand in.",
    vttCanvas: "WebVTT-ondertiteling moet bij een canvas horen.",
    manifest: "Het geselecteerde manifest kon niet worden geladen.",
    collection: "De geselecteerde collectie kon niet worden geladen.",
    canvas: "Het geselecteerde canvas kon niet worden geladen.",
  },
  resource: {
    create: "Resource aanmaken",
    chooseType: "Kies een resourcetype",
    label: "Label",
    url: "URL",
    invalidUrl: "Voer een geldige URL in",
    createFailed: "Deze resource kon niet worden aangemaakt",
  },
  canvas: {
    create: "Canvas aanmaken",
    width: "Breedte",
    height: "Hoogte",
    duration: "Duur",
  },
  image: {
    fromUrl: "URL van afbeelding",
    fromService: "IIIF-afbeeldingsdienst",
    browse: "Afbeeldingen bladeren",
    previewAlt: "Voorbeeld van geselecteerde resource",
    use: "Afbeelding gebruiken",
  },
  content: {
    webPage: "Webpagina",
    manifest: "Manifest",
    collection: "Collectie",
  },
} as const;
