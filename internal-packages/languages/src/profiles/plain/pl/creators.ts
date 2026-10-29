/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Pusta strona",
      summary: "Zacznij od układu obrazu lub pustej strony",
    },
    internalCanvas: {
      label: "Istniejąca strona",
      summary: "Wybierz stronę z tego elementu.",
    },
    example: {
      label: "Przykład pustej strony",
      summary: "Utwórz dużą pustą stronę z tytułem.",
    },
    contents: {
      summary: "Utwórz sekcję, aby uporządkować zawartość tego elementu.",
    },
    range: {
      summary: "Grupuj strony lub inne sekcje w sekcję.",
    },
    highlight: {
      summary: "Zaznacz obszar strony bez dodawania treści.",
    },
    html: {
      summary: "Wpisz sformatowany tekst, który będzie wyświetlany na stronie.",
    },
    browser: {
      summary:
        "Przeglądaj element IIIF, kolekcję lub stronę internetową obsługiwanej kolekcji i wybierz zawartość do dodania.",
      copyMetadata: "Skopiuj szczegóły elementu na zaimportowane strony",
      copyMetadataHelp: "Kopiuje szczegóły opisowe z elementu źródłowego, gdy przeglądarka tworzy stronę.",
    },
    manifestBrowser: {
      summary: "Przeglądaj elementy i kolekcje IIIF, aby wybrać coś do dodania.",
    },
    vtt: {
      summary: "Dodaj napisy lub podpisy z pliku WebVTT do strony audio lub wideo.",
    },
  },
  browser: {
    selectCanvas: "Wybierz stronę",
    addToManifest: "Dodaj do pozycji",
  },
  errors: {
    vttCanvas: "Podpisy WebVTT muszą należeć do strony.",
    canvas: "Nie można załadować wybranej strony.",
    manifest: "Nie można załadować wybranego elementu.",
  },
  form: {
    vttHelp: "Połącz istniejący plik WebVTT (.vtt) z tą stroną. Hostuj plik na publicznym URL przed jego dodaniem.",
    createRange: "Utwórz sekcję",
  },
  resource: {
    create: "Dodaj coś",
    chooseType: "Wybierz, co chcesz dodać",
  },
  canvas: {
    create: "Dodaj stronę",
  },
} as const;
