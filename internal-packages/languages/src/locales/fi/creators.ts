/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Tyhjä kangas",
      summary: "Aloita kuva-asettelulla tai tyhjällä kankaalla",
    },
    internalCanvas: {
      label: "Olemassa oleva kangas",
      summary: "Valitse kangas tästä luettelosta.",
    },
    example: {
      label: "Esimerkki tyhjästä kankaasta",
      summary: "Luo suuri tyhjä kangas otsikolla.",
    },
    thumbnail: {
      label: "IIIF pikkukuva",
      summary: "Luo pikkukuva IIIF-kuvapalvelusta.",
    },
    vtt: {
      label: "WebVTT tekstitykset",
      summary: "Lisää tekstityksiä WebVTT-tiedostosta ääni- tai videokankaalle.",
    },
    contents: {
      label: "Sisällysluettelo",
      summary: "Luo ylätason alue luettelon sisällön järjestämiseksi.",
    },
    provider: {
      summary: "Lisää tämän resurssin tarjoamisesta vastaava organisaatio.",
    },
    browser: {
      label: "Selaa IIIF sisältöä",
      summary: "Selaa IIIF-luetteloa, kokoelmaa tai tuetun kokoelman verkkosivua ja valitse lisättävä sisältö.",
      copyMetadata: "Lisää luettelon metatiedot tuotuihin kankaisiin",
      copyMetadataHelp: "Kopioi metatiedot lähdeluettelosta, kun IIIF Browser luo kankaan.",
    },
    manifestBrowser: {
      summary: "Selaa IIIF-luetteloita ja kokoelmia ja valitse lisättävä resurssi.",
    },
    audio: {
      label: "Audio",
      summary: "Lisää ääntä suorasta äänitiedostolinkistä.",
    },
    service: {
      label: "IIIF kuva",
      summary: "Lisää zoomattava kuva käyttämällä IIIF-kuvapalvelua tai info.json-linkkiä.",
    },
    highlight: {
      label: "Kohokohta",
      summary: "Merkitse alue kankaalle lisäämättä sisältöä.",
      create: "Luo kohokohta",
    },
    annotationPage: {
      label: "Tyhjä huomautussivu",
      summary: "Luo tyhjä sivu merkintöjen järjestämistä varten.",
    },
    range: {
      summary: "Ryhmittele kankaat tai muut alueet osioon.",
    },
    imageList: {
      label: "Useita kuvia",
      summary: "Lisää useita kuvia käyttämällä yhtä suoraa kuvalinkkiä riviä kohden.",
    },
    plaintext: {
      label: "Pelkkä teksti linkki",
      summary: "Linkki ulkoiseen pelkkää tekstiä sisältävään tiedostoon.",
    },
    htmlBody: {
      label: "Muotoiltu teksti",
      summary: "Kirjoita muotoiltu teksti huomautuksen sisällöksi.",
    },
    html: {
      label: "HTML",
      summary: "Kirjoita muotoiltu teksti näytettäväksi kankaalle.",
    },
    video: {
      label: "Video",
      summary: "Lisää video suorasta videotiedostolinkistä. Käytä YouTube:ta YouTube-videoille.",
    },
    imageUrl: {
      label: "Kuva",
      summary: "Lisää kuva käyttämällä suoraa kuvatiedostolinkkiä.",
    },
    captionedImage: {
      label: "Kuvatekstitetty kuva",
      summary: "Lisää kuva suorasta linkistä ja kirjoita sen kuvateksti.",
    },
    youtube: {
      label: "YouTube",
      summary: "Upota video käyttämällä YouTube-linkkiä.",
    },
    webpage: {
      label: "Web-sivu",
      summary: "Linkki ulkoiselle verkkosivulle.",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} pikseliä",
    audioUrl: "Linkki äänitiedostoon",
    addAudio: "Lisää ääni",
    videoUrl: "Linkki videotiedostoon",
    addVideo: "Lisää video",
    serviceUrl: "Linkki kuvapalveluun",
    invalidService: "Virheellinen palvelu",
    imageUrl: "Linkki kuvaan",
    caption: "Kuvateksti",
    describeImage: "Kuvaile kuvaa",
    textUrl: "Linkki tekstitiedostoon",
    youtubeUrl: "Linkki kohteeseen YouTube",
    link: "Linkki",
    createLink: "Luo linkki",
    createRange: "Luo alue",
    addThumbnail: "Lisää pikkukuva",
    selectSize: "Valitse koko",
    urlList: "Anna luettelo URL-osoitteista (yksi per rivi)",
    homepageLabel: "Kotisivun tunniste",
    providerId: "Palveluntarjoajan tunnus",
    providerIdHelp: "Luodaan, jos sitä ei ole määritetty, tämä ei ole URL, jota käyttäjä voi seurata",
    addProvider: "Lisää palveluntarjoaja",
    vttHelp:
      "Linkitä olemassa oleva WebVTT (.vtt) -tiedosto tähän kankaaseen. Isännöi tiedosto julkisessa URL:ssa ennen sen lisäämistä.",
    vttUrl: "WebVTT tiedosto URL",
    absoluteUrl: "Kirjoita absoluuttinen http:// tai https:// URL",
    languageCode: "Kieli (BCP 47 koodi)",
    languageCodeHelp: "Kielikoodi, kuten en, fr tai pt-BR",
    addCaptions: "Lisää kuvatekstit",
  },
  browser: {
    selectCanvas: "Valitse kangas",
    select: "Valitse",
    addToManifest: "Lisää luetteloon",
  },
  errors: {
    media: "Tätä mediaa ei voitu ladata. Tarkista linkki ja yritä uudelleen.",
    details: "Tekniset tiedot",
    service: "Kuvapalvelua ei voitu ladata. Tarkista linkki ja yritä uudelleen.",
    vttUrl: "Syötä absoluuttinen HTTP tai HTTPS URL WebVTT-tiedostolle.",
    vttCanvas: "WebVTT-tekstitysten on kuuluttava kankaalle.",
    manifest: "Valittua luetteloa ei voitu ladata.",
    collection: "Valittua kokoelmaa ei voitu ladata.",
    canvas: "Valittua kangasta ei voitu ladata.",
  },
  resource: {
    create: "Luo resurssi",
    chooseType: "Valitse resurssityyppi",
    label: "Nimike",
    url: "URL",
    invalidUrl: "Anna kelvollinen URL",
    createFailed: "Tätä resurssia ei voitu luoda",
  },
  canvas: {
    create: "Luo kangas",
    width: "Leveys",
    height: "Korkeus",
    duration: "Kesto",
  },
  image: {
    fromUrl: "Kuva URL",
    fromService: "IIIF kuvapalvelu",
    browse: "Selaa kuvia",
    previewAlt: "Valitun resurssin esikatselu",
    use: "Käytä kuvaa",
  },
  content: {
    webPage: "Web-sivu",
    manifest: "Manifesti",
    collection: "Kokoelma",
  },
} as const;
