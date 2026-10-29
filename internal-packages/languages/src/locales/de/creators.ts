/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Leere Leinwand",
      summary: "Beginnen Sie mit einem Bildlayout oder einer leeren Leinwand",
    },
    internalCanvas: {
      label: "Vorhandene Leinwand",
      summary: "Wählen Sie eine Leinwand aus diesem Manifest.",
    },
    example: {
      label: "Beispiel für eine leere Leinwand",
      summary: "Erstellen Sie eine große leere Leinwand mit einem Titel.",
    },
    thumbnail: {
      label: "IIIF Miniaturansicht",
      summary: "Erstellen Sie eine Miniaturansicht aus einem IIIF-Bilddienst.",
    },
    vtt: {
      label: "WebVTT Untertitel",
      summary:
        "Fügen Sie Untertitel oder Bildunterschriften aus einer WebVTT-Datei zu einer Audio- oder Video-Leinwand hinzu.",
    },
    contents: {
      label: "Inhaltsverzeichnis",
      summary: "Erstellen Sie einen Bereich auf oberster Ebene, um den Inhalt des Manifests zu organisieren.",
    },
    provider: {
      summary: "Fügen Sie die Organisation hinzu, die für die Bereitstellung dieser Ressource verantwortlich ist.",
    },
    browser: {
      label: "Durchsuchen Sie IIIF-Inhalte",
      summary:
        "Durchsuchen Sie ein IIIF-Manifest, eine Sammlung oder eine unterstützte Sammlungswebseite und wählen Sie den hinzuzufügenden Inhalt aus.",
      copyMetadata: "Fügen Sie Manifest-Metadaten zu importierten Leinwänden hinzu",
      copyMetadataHelp: "Kopiert Metadaten aus dem Quellmanifest, wenn IIIF Browser einen Canvas erstellt.",
    },
    manifestBrowser: {
      summary: "Durchsuchen Sie IIIF-Manifeste und -Sammlungen, um eine Ressource zum Hinzufügen auszuwählen.",
    },
    audio: {
      label: "Audio",
      summary: "Fügen Sie Audio über einen direkten Audiodatei-Link hinzu.",
    },
    service: {
      label: "IIIF-Bild",
      summary: "Fügen Sie ein zoombares Bild über einen IIIF-Bilddienst oder einen info.json-Link hinzu.",
    },
    highlight: {
      label: "Hervorheben",
      summary: "Markieren Sie einen Bereich der Leinwand, ohne Inhalte hinzuzufügen.",
      create: "Highlight erstellen",
    },
    annotationPage: {
      label: "Leere Anmerkungsseite",
      summary: "Erstellen Sie eine leere Seite, um Anmerkungen zu organisieren.",
    },
    range: {
      summary: "Gruppieren Sie Leinwände oder andere Bereiche in einem Abschnitt.",
    },
    imageList: {
      label: "Mehrere Bilder",
      summary: "Fügen Sie mehrere Bilder hinzu, indem Sie einen direkten Bildlink pro Zeile verwenden.",
    },
    plaintext: {
      label: "Nur-Text-Link",
      summary: "Link zu einer externen Nur-Text-Datei.",
    },
    htmlBody: {
      label: "Formatierter Text",
      summary: "Schreiben Sie formatierten Text als Inhalt einer Anmerkung.",
    },
    html: {
      label: "HTML",
      summary: "Schreiben Sie formatierten Text zur Anzeige auf einer Leinwand.",
    },
    video: {
      label: "Video",
      summary:
        "Fügen Sie ein Video über einen direkten Link zur Videodatei hinzu. Verwenden Sie YouTube für YouTube-Videos.",
    },
    imageUrl: {
      label: "Bild",
      summary: "Fügen Sie ein Bild über einen direkten Bilddatei-Link hinzu.",
    },
    captionedImage: {
      label: "Bild mit Bildunterschrift",
      summary: "Fügen Sie ein Bild über einen direkten Link hinzu und schreiben Sie eine Bildunterschrift.",
    },
    youtube: {
      label: "YouTube",
      summary: "Betten Sie ein Video über den YouTube-Link ein.",
    },
    webpage: {
      label: "Webseite",
      summary: "Link zu einer externen Webseite.",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} Pixel",
    audioUrl: "Link zur Audiodatei",
    addAudio: "Audio hinzufügen",
    videoUrl: "Link zur Videodatei",
    addVideo: "Video hinzufügen",
    serviceUrl: "Link zum Bilderdienst",
    invalidService: "Ungültiger Dienst",
    imageUrl: "Link zum Bild",
    caption: "Untertitel",
    describeImage: "Beschreiben Sie das Bild",
    textUrl: "Link zur Nur-Text-Datei",
    youtubeUrl: "Link zu YouTube",
    link: "Link",
    createLink: "Verknüpfung erstellen",
    createRange: "Sortiment erstellen",
    addThumbnail: "Miniaturansicht hinzufügen",
    selectSize: "Größe auswählen",
    urlList: "Geben Sie eine Liste mit URLs ein (eine pro Zeile).",
    homepageLabel: "Homepage-Label",
    providerId: "Anbieter-ID",
    providerIdHelp: "Wird generiert, wenn nicht angegeben. Dies ist kein URL, dem der Benutzer folgen kann",
    addProvider: "Anbieter hinzufügen",
    vttHelp:
      "Verknüpfen Sie eine vorhandene WebVTT-Datei (.vtt) mit dieser Leinwand. Hosten Sie die Datei auf einem öffentlichen URL, bevor Sie sie hinzufügen.",
    vttUrl: "WebVTT-Datei URL",
    absoluteUrl: "Geben Sie ein absolutes http:// oder https:// URL ein",
    languageCode: "Sprache (BCP 47-Code)",
    languageCodeHelp: "Ein Sprachcode wie en, fr oder pt-BR",
    addCaptions: "Untertitel hinzufügen",
  },
  browser: {
    selectCanvas: "Leinwand auswählen",
    select: "Auswählen",
    addToManifest: "Zum Manifest hinzufügen",
  },
  errors: {
    media: "Dieses Medium konnte nicht geladen werden. Überprüfen Sie den Link und versuchen Sie es erneut.",
    details: "Technische Details",
    service: "Der Bilddienst konnte nicht geladen werden. Überprüfen Sie den Link und versuchen Sie es erneut.",
    vttUrl: "Geben Sie für die WebVTT-Datei einen absoluten Wert HTTP oder HTTPS URL ein.",
    vttCanvas: "WebVTT-Untertitel müssen zu einem Canvas gehören.",
    manifest: "Das ausgewählte Manifest konnte nicht geladen werden.",
    collection: "Die ausgewählte Sammlung konnte nicht geladen werden.",
    canvas: "Die ausgewählte Leinwand konnte nicht geladen werden.",
  },
  resource: {
    create: "Ressource erstellen",
    chooseType: "Wählen Sie einen Ressourcentyp",
    label: "Bezeichnung",
    url: "URL",
    invalidUrl: "Geben Sie einen gültigen URL ein",
    createFailed: "Diese Ressource konnte nicht erstellt werden",
  },
  canvas: {
    create: "Leinwand erstellen",
    width: "Breite",
    height: "Höhe",
    duration: "Dauer",
  },
  image: {
    fromUrl: "Bild URL",
    fromService: "IIIF-Bilddienst",
    browse: "Bilder durchsuchen",
    previewAlt: "Vorschau der ausgewählten Ressource",
    use: "Bild verwenden",
  },
  content: {
    webPage: "Webseite",
    manifest: "Manifest",
    collection: "Sammlung",
  },
} as const;
