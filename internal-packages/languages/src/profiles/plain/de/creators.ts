/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Leere Seite",
      summary: "Beginnen Sie mit einem Bildlayout oder einer leeren Seite",
    },
    internalCanvas: {
      label: "Vorhandene Seite",
      summary: "Wählen Sie eine Seite aus diesem Element aus.",
    },
    example: {
      label: "Beispiel für eine leere Seite",
      summary: "Erstellen Sie eine große leere Seite mit einem Titel.",
    },
    contents: {
      summary: "Erstellen Sie einen Abschnitt, um den Inhalt dieses Elements zu organisieren.",
    },
    range: {
      summary: "Gruppieren Sie Seiten oder andere Abschnitte in einem Abschnitt.",
    },
    highlight: {
      summary: "Markieren Sie einen Bereich der Seite, ohne Inhalte hinzuzufügen.",
    },
    html: {
      summary: "Schreiben Sie formatierten Text zur Anzeige auf einer Seite.",
    },
    browser: {
      summary:
        "Durchsuchen Sie ein IIIF-Element, eine Sammlung oder eine unterstützte Sammlungswebseite und wählen Sie den hinzuzufügenden Inhalt aus.",
      copyMetadata: "Artikeldetails auf importierte Seiten kopieren",
      copyMetadataHelp: "Kopiert beschreibende Details aus dem Quellelement, wenn der Browser eine Seite erstellt.",
    },
    manifestBrowser: {
      summary: "Durchsuchen Sie IIIF-Artikel und -Sammlungen, um etwas auszuwählen, das Sie hinzufügen möchten.",
    },
    vtt: {
      summary:
        "Fügen Sie Untertitel oder Bildunterschriften aus einer WebVTT-Datei zu einer Audio- oder Videoseite hinzu.",
    },
  },
  browser: {
    selectCanvas: "Seite auswählen",
    addToManifest: "Zum Artikel hinzufügen",
  },
  errors: {
    vttCanvas: "WebVTT Beschriftungen müssen zu einer Seite gehören.",
    canvas: "Die ausgewählte Seite konnte nicht geladen werden.",
    manifest: "Das ausgewählte Element konnte nicht geladen werden.",
  },
  form: {
    vttHelp:
      "Verknüpfen Sie eine vorhandene WebVTT-Datei (.vtt) mit dieser Seite. Hosten Sie die Datei auf einem öffentlichen URL, bevor Sie sie hinzufügen.",
    createRange: "Abschnitt erstellen",
  },
  resource: {
    create: "Füge etwas hinzu",
    chooseType: "Wählen Sie aus, was Sie hinzufügen möchten",
  },
  canvas: {
    create: "Seite hinzufügen",
  },
} as const;
