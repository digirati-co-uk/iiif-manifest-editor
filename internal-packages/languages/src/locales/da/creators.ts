/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Tomt lærred",
      summary: "Start med et billedlayout eller et tomt lærred",
    },
    internalCanvas: {
      label: "Eksisterende lærred",
      summary: "Vælg et lærred fra dette manifest.",
    },
    example: {
      label: "Eksempel på blankt lærred",
      summary: "Lav et stort tomt lærred med en titel.",
    },
    thumbnail: {
      label: "IIIF thumbnail",
      summary: "Opret et miniaturebillede fra en IIIF billedtjeneste.",
    },
    vtt: {
      label: "WebVTT billedtekster",
      summary: "Tilføj undertekster eller billedtekster fra en WebVTT-fil til et lyd- eller videolærred.",
    },
    contents: {
      label: "Indholdsfortegnelse",
      summary: "Opret en række på øverste niveau for at organisere manifestets indhold.",
    },
    provider: {
      summary: "Tilføj den organisation, der er ansvarlig for at levere denne ressource.",
    },
    browser: {
      label: "Gennemse IIIF indhold",
      summary:
        "Gennemse et IIIF-manifest, en samling eller en understøttet samlingswebside, og vælg indhold, der skal tilføjes.",
      copyMetadata: "Tilføj manifestmetadata til importerede lærreder",
      copyMetadataHelp: "Kopierer metadata fra kildemanifestet, når IIIF Browser opretter et lærred.",
    },
    manifestBrowser: {
      summary: "Gennemse IIIF manifester og samlinger for at vælge en ressource at tilføje.",
    },
    audio: {
      label: "Lyd",
      summary: "Tilføj lyd fra et direkte lydfillink.",
    },
    service: {
      label: "IIIF billede",
      summary: "Tilføj et zoombart billede ved hjælp af en IIIF billedtjeneste eller info.json link.",
    },
    highlight: {
      label: "Fremhæv",
      summary: "Marker et område af lærredet uden at tilføje noget indhold.",
      create: "Skab højdepunkter",
    },
    annotationPage: {
      label: "Tom annoteringsside",
      summary: "Opret en tom side for at organisere anmærkninger.",
    },
    range: {
      summary: "Gruppér lærreder eller andre områder i en sektion.",
    },
    imageList: {
      label: "Flere billeder",
      summary: "Tilføj flere billeder ved hjælp af et direkte billedlink pr. linje.",
    },
    plaintext: {
      label: "Almindeligt tekstlink",
      summary: "Link til en ekstern almindelig tekstfil.",
    },
    htmlBody: {
      label: "Formateret tekst",
      summary: "Skriv formateret tekst som indholdet af en annotering.",
    },
    html: {
      label: "HTML",
      summary: "Skriv formateret tekst til visning på et lærred.",
    },
    video: {
      label: "Video",
      summary: "Tilføj video fra et direkte video-fil-link. Brug YouTube til YouTube videoer.",
    },
    imageUrl: {
      label: "Billede",
      summary: "Tilføj et billede ved hjælp af et direkte billedfil-link.",
    },
    captionedImage: {
      label: "Billede med billedtekst",
      summary: "Tilføj et billede fra et direkte link og skriv dets billedtekst.",
    },
    youtube: {
      label: "YouTube",
      summary: "Integrer en video ved hjælp af dens YouTube-link.",
    },
    webpage: {
      label: "Web-side",
      summary: "Link til en ekstern webside.",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} pixels",
    audioUrl: "Link til lydfil",
    addAudio: "Tilføj lyd",
    videoUrl: "Link til videofil",
    addVideo: "Tilføj video",
    serviceUrl: "Link til billedservice",
    invalidService: "Ugyldig tjeneste",
    imageUrl: "Link til billede",
    caption: "Billedtekst",
    describeImage: "Beskriv billedet",
    textUrl: "Link til almindelig tekstfil",
    youtubeUrl: "Link til YouTube",
    link: "Forbindelse",
    createLink: "Opret link",
    createRange: "Opret rækkevidde",
    addThumbnail: "Tilføj thumbnail",
    selectSize: "Vælg størrelse",
    urlList: "Indtast en liste over webadresser (én pr. linje)",
    homepageLabel: "Hjemmeside etiket",
    providerId: "Udbyder-id",
    providerIdHelp: "Vil blive genereret, hvis det ikke er angivet, dette er ikke en URL, som brugeren kan følge",
    addProvider: "Tilføj udbyder",
    vttHelp:
      "Link en eksisterende WebVTT (.vtt) fil til dette lærred. Host filen på en offentlig URL, før du tilføjer den.",
    vttUrl: "WebVTT fil URL",
    absoluteUrl: "Indtast en absolut http:// eller https:// URL",
    languageCode: "Sprog (BCP 47 kode)",
    languageCodeHelp: "En sprogkode såsom en, fr eller pt-BR",
    addCaptions: "Tilføj billedtekster",
  },
  browser: {
    selectCanvas: "Vælg lærred",
    select: "Vælg",
    addToManifest: "Tilføj til manifest",
  },
  errors: {
    media: "Kunne ikke indlæse dette medie. Tjek linket og prøv igen.",
    details: "Tekniske detaljer",
    service: "Billedtjenesten kunne ikke indlæses. Tjek linket og prøv igen.",
    vttUrl: "Indtast en absolut HTTP eller HTTPS URL for WebVTT-filen.",
    vttCanvas: "WebVTT billedtekster skal tilhøre et lærred.",
    manifest: "Det valgte manifest kunne ikke indlæses.",
    collection: "Den valgte samling kunne ikke indlæses.",
    canvas: "Det valgte lærred kunne ikke indlæses.",
  },
  resource: {
    create: "Opret ressource",
    chooseType: "Vælg en ressourcetype",
    label: "Etiket",
    url: "URL",
    invalidUrl: "Indtast en gyldig URL",
    createFailed: "Kunne ikke oprette denne ressource",
  },
  canvas: {
    create: "Opret lærred",
    width: "Bredde",
    height: "Højde",
    duration: "Varighed",
  },
  image: {
    fromUrl: "Billede URL",
    fromService: "IIIF billedtjeneste",
    browse: "Gennemse billeder",
    previewAlt: "Forhåndsvisning af valgt ressource",
    use: "Brug billede",
  },
  content: {
    webPage: "Web-side",
    manifest: "Manifest",
    collection: "Samling",
  },
} as const;
