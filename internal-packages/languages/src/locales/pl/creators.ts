/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Puste płótno",
      summary: "Zacznij od układu obrazu lub pustego płótna",
    },
    internalCanvas: {
      label: "Istniejące płótno",
      summary: "Wybierz płótno z tego manifestu.",
    },
    example: {
      label: "Przykład pustego płótna",
      summary: "Utwórz duże, puste płótno z tytułem.",
    },
    thumbnail: {
      label: "Miniaturka IIIF",
      summary: "Utwórz miniaturę z usługi obrazów IIIF.",
    },
    vtt: {
      label: "Napisy WebVTT",
      summary: "Dodaj napisy lub podpisy z pliku WebVTT do kanwy audio lub wideo.",
    },
    contents: {
      label: "Spis treści",
      summary: "Utwórz zakres najwyższego poziomu, aby uporządkować zawartość manifestu.",
    },
    provider: {
      summary: "Dodaj organizację odpowiedzialną za udostępnianie tego zasobu.",
    },
    browser: {
      label: "Przeglądaj zawartość IIIF",
      summary:
        "Przeglądaj manifest, kolekcję lub stronę internetową obsługiwanej kolekcji IIIF i wybierz treść do dodania.",
      copyMetadata: "Dodaj metadane manifestu do zaimportowanych płócien",
      copyMetadataHelp: "Kopiuje metadane ze źródłowego Manifestu, gdy IIIF Browser tworzy Canvas.",
    },
    manifestBrowser: {
      summary: "Przeglądaj manifesty i kolekcje IIIF, aby wybrać zasób do dodania.",
    },
    audio: {
      label: "Audio",
      summary: "Dodaj dźwięk z bezpośredniego łącza do pliku audio.",
    },
    service: {
      label: "Obraz IIIF",
      summary: "Dodaj obraz z możliwością powiększania, korzystając z usługi obrazów IIIF lub łącza info.json.",
    },
    highlight: {
      label: "Atrakcja",
      summary: "Zaznacz obszar płótna bez dodawania żadnej treści.",
      create: "Utwórz podświetlenie",
    },
    annotationPage: {
      label: "Pusta strona adnotacji",
      summary: "Utwórz pustą stronę, aby uporządkować adnotacje.",
    },
    range: {
      summary: "Pogrupuj płótna lub inne zakresy w sekcję.",
    },
    imageList: {
      label: "Wiele obrazów",
      summary: "Dodaj kilka obrazów, używając jednego bezpośredniego łącza do obrazu w każdym wierszu.",
    },
    plaintext: {
      label: "Zwykły link tekstowy",
      summary: "Link do zewnętrznego pliku tekstowego.",
    },
    htmlBody: {
      label: "Sformatowany tekst",
      summary: "Zapisz sformatowany tekst jako treść adnotacji.",
    },
    html: {
      label: "HTML",
      summary: "Napisz sformatowany tekst, który będzie wyświetlany na płótnie.",
    },
    video: {
      label: "Wideo",
      summary: "Dodaj wideo z bezpośredniego łącza do pliku wideo. Użyj YouTube dla filmów YouTube.",
    },
    imageUrl: {
      label: "Obraz",
      summary: "Dodaj obraz, korzystając z bezpośredniego łącza obrazu do pliku.",
    },
    captionedImage: {
      label: "Podpisany obraz",
      summary: "Dodaj obraz z bezpośredniego linku i napisz jego podpis.",
    },
    youtube: {
      label: "YouTube",
      summary: "Osadź wideo, korzystając z łącza YouTube.",
    },
    webpage: {
      label: "Strona internetowa",
      summary: "Link do zewnętrznej strony internetowej.",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} pikseli",
    audioUrl: "Link do pliku audio",
    addAudio: "Dodaj dźwięk",
    videoUrl: "Link do pliku wideo",
    addVideo: "Dodaj wideo",
    serviceUrl: "Link do serwisu zdjęć",
    invalidService: "Nieprawidłowa usługa",
    imageUrl: "Link do obrazu",
    caption: "Podpis",
    describeImage: "Opisz obraz",
    textUrl: "Link do pliku tekstowego",
    youtubeUrl: "Link do YouTube",
    link: "Połączyć",
    createLink: "Utwórz łącze",
    createRange: "Utwórz zakres",
    addThumbnail: "Dodaj miniaturę",
    selectSize: "Wybierz rozmiar",
    urlList: "Wprowadź listę adresów URL (po jednym w wierszu)",
    homepageLabel: "Etykieta strony głównej",
    providerId: "Identyfikator dostawcy",
    providerIdHelp:
      "Zostanie wygenerowany, jeśli nie zostanie określony. Nie jest to URL, który użytkownik może śledzić",
    addProvider: "Dodaj dostawcę",
    vttHelp:
      "Połącz istniejący plik WebVTT (.vtt) z tym obszarem roboczym. Hostuj plik na publicznym URL przed jego dodaniem.",
    vttUrl: "WebVTT plik URL",
    absoluteUrl: "Wprowadź bezwzględny http:// lub https:// URL",
    languageCode: "Język (kod BCP 47)",
    languageCodeHelp: "Kod języka, taki jak en, fr lub pt-BR",
    addCaptions: "Dodaj napisy",
  },
  browser: {
    selectCanvas: "Wybierz płótno",
    select: "Wybierz",
    addToManifest: "Dodaj do manifestu",
  },
  errors: {
    media: "Nie można załadować tego nośnika. Sprawdź link i spróbuj ponownie.",
    details: "Szczegóły techniczne",
    service: "Nie można załadować usługi obrazów. Sprawdź link i spróbuj ponownie.",
    vttUrl: "Wprowadź wartość bezwzględną HTTP lub HTTPS URL dla pliku WebVTT.",
    vttCanvas: "Podpisy WebVTT muszą należeć do płótna.",
    manifest: "Nie można załadować wybranego manifestu.",
    collection: "Nie można załadować wybranej kolekcji.",
    canvas: "Nie można załadować wybranego płótna.",
  },
  resource: {
    create: "Utwórz zasób",
    chooseType: "Wybierz typ zasobu",
    label: "Etykieta",
    url: "URL",
    invalidUrl: "Wprowadź prawidłowy URL",
    createFailed: "Nie można utworzyć tego zasobu",
  },
  canvas: {
    create: "Utwórz płótno",
    width: "Szerokość",
    height: "Wysokość",
    duration: "Czas trwania",
  },
  image: {
    fromUrl: "Obraz URL",
    fromService: "Usługa obrazu IIIF",
    browse: "Przeglądaj obrazy",
    previewAlt: "Podgląd wybranego zasobu",
    use: "Użyj obrazu",
  },
  content: {
    webPage: "Strona internetowa",
    manifest: "Manifest",
    collection: "Kolekcja",
  },
} as const;
