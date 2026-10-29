/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Prázdné plátno",
      summary: "Začněte s rozvržením obrázku nebo prázdným plátnem",
    },
    internalCanvas: {
      label: "Stávající plátno",
      summary: "Vyberte plátno z tohoto manifestu.",
    },
    example: {
      label: "Příklad prázdného plátna",
      summary: "Vytvořte velké prázdné plátno s názvem.",
    },
    thumbnail: {
      label: "Miniatura IIIF",
      summary: "Vytvořte miniaturu z obrazové služby IIIF.",
    },
    vtt: {
      label: "WebVTT titulky",
      summary: "Přidejte titulky nebo titulky ze souboru WebVTT na zvukové nebo video plátno.",
    },
    contents: {
      label: "Obsah",
      summary: "Vytvořte rozsah nejvyšší úrovně pro uspořádání obsahu manifestu.",
    },
    provider: {
      summary: "Přidejte organizaci odpovědnou za poskytování tohoto zdroje.",
    },
    browser: {
      label: "Procházet obsah IIIF",
      summary:
        "Procházejte webovou stránku manifestu, kolekce nebo podporované kolekce IIIF a vyberte obsah, který chcete přidat.",
      copyMetadata: "Přidejte metadata manifestu na importovaná plátna",
      copyMetadataHelp: "Zkopíruje metadata ze zdrojového manifestu, když IIIF Browser vytvoří plátno.",
    },
    manifestBrowser: {
      summary: "Procházejte manifesty a kolekce IIIF a vyberte zdroj, který chcete přidat.",
    },
    audio: {
      label: "Zvuk",
      summary: "Přidejte zvuk z přímého odkazu na zvukový soubor.",
    },
    service: {
      label: "Obrázek IIIF",
      summary: "Přidejte zoomovatelný obrázek pomocí obrazové služby IIIF nebo odkazu info.json.",
    },
    highlight: {
      label: "Zvýrazněte",
      summary: "Označte oblast plátna bez přidání jakéhokoli obsahu.",
      create: "Vytvořte zvýraznění",
    },
    annotationPage: {
      label: "Prázdná stránka s poznámkami",
      summary: "Vytvořte prázdnou stránku pro uspořádání poznámek.",
    },
    range: {
      summary: "Seskupte plátna nebo jiné rozsahy do sekce.",
    },
    imageList: {
      label: "Více obrázků",
      summary: "Přidejte několik obrázků pomocí jednoho přímého odkazu na obrázek na řádek.",
    },
    plaintext: {
      label: "Odkaz na prostý text",
      summary: "Odkaz na externí soubor ve formátu prostého textu.",
    },
    htmlBody: {
      label: "Formátovaný text",
      summary: "Napište formátovaný text jako obsah anotace.",
    },
    html: {
      label: "HTML",
      summary: "Napište formátovaný text pro zobrazení na plátně.",
    },
    video: {
      label: "Video",
      summary: "Přidejte video z přímého odkazu na soubor videa. Pro videa YouTube použijte YouTube.",
    },
    imageUrl: {
      label: "Obrázek",
      summary: "Přidejte obrázek pomocí přímého odkazu na soubor obrázku.",
    },
    captionedImage: {
      label: "Obrázek s titulkem",
      summary: "Přidejte obrázek z přímého odkazu a napište jeho popisek.",
    },
    youtube: {
      label: "YouTube",
      summary: "Vložte video pomocí odkazu YouTube.",
    },
    webpage: {
      label: "Webová stránka",
      summary: "Odkaz na externí webovou stránku.",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} pixelů",
    audioUrl: "Odkaz na zvukový soubor",
    addAudio: "Přidat zvuk",
    videoUrl: "Odkaz na soubor videa",
    addVideo: "Přidat video",
    serviceUrl: "Odkaz na obrázkovou službu",
    invalidService: "Neplatná služba",
    imageUrl: "Odkaz na obrázek",
    caption: "Titulek",
    describeImage: "Popište obrázek",
    textUrl: "Odkaz na soubor ve formátu prostého textu",
    youtubeUrl: "Odkaz na YouTube",
    link: "Odkaz",
    createLink: "Vytvořit odkaz",
    createRange: "Vytvořte rozsah",
    addThumbnail: "Přidat miniaturu",
    selectSize: "Vyberte velikost",
    urlList: "Zadejte seznam adres URL (jedna na řádek)",
    homepageLabel: "Štítek domovské stránky",
    providerId: "ID poskytovatele",
    providerIdHelp: "Bude vygenerováno, pokud není zadáno, toto není URL, které může uživatel sledovat",
    addProvider: "Přidat poskytovatele",
    vttHelp:
      "Propojte existující soubor WebVTT (.vtt) s tímto plátnem. Před přidáním soubor hostujte na veřejném serveru URL.",
    vttUrl: "WebVTT soubor URL",
    absoluteUrl: "Zadejte absolutní http:// nebo https:// URL",
    languageCode: "Jazyk (kód BCP 47)",
    languageCodeHelp: "Kód jazyka, jako je en, fr nebo pt-BR",
    addCaptions: "Přidejte titulky",
  },
  browser: {
    selectCanvas: "Vyberte plátno",
    select: "Vybrat",
    addToManifest: "Přidat do manifestu",
  },
  errors: {
    media: "Toto médium nelze načíst. Zkontrolujte odkaz a zkuste to znovu.",
    details: "Technické detaily",
    service: "Nelze načíst obrázkovou službu. Zkontrolujte odkaz a zkuste to znovu.",
    vttUrl: "Zadejte absolutní HTTP nebo HTTPS URL pro soubor WebVTT.",
    vttCanvas: "Titulky WebVTT musí patřit k plátnu.",
    manifest: "Vybraný manifest nelze načíst.",
    collection: "Vybranou sbírku nelze načíst.",
    canvas: "Vybrané plátno se nepodařilo načíst.",
  },
  resource: {
    create: "Vytvořit zdroj",
    chooseType: "Vyberte typ zdroje",
    label: "Popisek",
    url: "URL",
    invalidUrl: "Zadejte platný URL",
    createFailed: "Tento zdroj nelze vytvořit",
  },
  canvas: {
    create: "Vytvořte plátno",
    width: "Šířka",
    height: "Výška",
    duration: "Trvání",
  },
  image: {
    fromUrl: "Obrázek URL",
    fromService: "Obrazová služba IIIF",
    browse: "Procházet obrázky",
    previewAlt: "Náhled vybraného zdroje",
    use: "Použít obrázek",
  },
  content: {
    webPage: "Webová stránka",
    manifest: "Manifest",
    collection: "Sbírka",
  },
} as const;
