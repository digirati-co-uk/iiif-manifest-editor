/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Boş tuval",
      summary: "Bir resim düzeniyle veya boş bir tuvalle başlayın",
    },
    internalCanvas: {
      label: "Mevcut tuval",
      summary: "Bu bildirimden bir tuval seçin.",
    },
    example: {
      label: "Boş tuval örneği",
      summary: "Başlığı olan büyük, boş bir tuval oluşturun.",
    },
    thumbnail: {
      label: "IIIF küçük resmi",
      summary: "IIIF görüntü hizmetinden küçük resim oluşturun.",
    },
    vtt: {
      label: "WebVTT altyazıları",
      summary: "Bir WebVTT dosyasından bir ses veya video tuvaline altyazı veya resim yazıları ekleyin.",
    },
    contents: {
      label: "İçindekiler",
      summary: "Bildirinin içeriğini düzenlemek için üst düzey bir aralık oluşturun.",
    },
    provider: {
      summary: "Bu kaynağı sağlamaktan sorumlu kuruluşu ekleyin.",
    },
    browser: {
      label: "IIIF içeriğine göz atın",
      summary:
        "IIIF bildirimine, koleksiyonuna veya desteklenen koleksiyon web sayfasına göz atın ve eklenecek içeriği seçin.",
      copyMetadata: "İçe aktarılan tuvallere manifest meta verileri ekleme",
      copyMetadataHelp: "IIIF Browser bir Kanvas oluşturduğunda kaynak Manifest'ten meta verileri kopyalar.",
    },
    manifestBrowser: {
      summary: "Eklenecek kaynağı seçmek için IIIF bildirimlerine ve koleksiyonlarına göz atın.",
    },
    audio: {
      label: "Ses",
      summary: "Doğrudan ses dosyası bağlantısından ses ekleyin.",
    },
    service: {
      label: "IIIF görseli",
      summary: "IIIF görüntü hizmetini veya info.json bağlantısını kullanarak yakınlaştırılabilir bir görüntü ekleyin.",
    },
    highlight: {
      label: "Vurgula",
      summary: "Herhangi bir içerik eklemeden tuvalin bir bölgesini işaretleyin.",
      create: "Vurgu oluştur",
    },
    annotationPage: {
      label: "Boş ek açıklama sayfası",
      summary: "Ek açıklamaları düzenlemek için boş bir sayfa oluşturun.",
    },
    range: {
      summary: "Kanvasları veya diğer aralıkları bir bölüm halinde gruplandırın.",
    },
    imageList: {
      label: "Çoklu görseller",
      summary: "Her satıra bir doğrudan resim bağlantısı kullanarak birden fazla resim ekleyin.",
    },
    plaintext: {
      label: "Düz metin bağlantısı",
      summary: "Harici bir düz metin dosyasına bağlantı.",
    },
    htmlBody: {
      label: "Biçimlendirilmiş metin",
      summary: "Biçimlendirilmiş metni bir ek açıklamanın içeriği olarak yazın.",
    },
    html: {
      label: "HTML",
      summary: "Tuvalde görüntülenecek biçimlendirilmiş metni yazın.",
    },
    video: {
      label: "Video",
      summary: "Doğrudan video dosyası bağlantısından video ekleyin. YouTube videoları için YouTube kullanın.",
    },
    imageUrl: {
      label: "Görüntü",
      summary: "Doğrudan resim dosyası bağlantısını kullanarak bir resim ekleyin.",
    },
    captionedImage: {
      label: "Altyazılı resim",
      summary: "Doğrudan bağlantıdan bir resim ekleyin ve başlığını yazın.",
    },
    youtube: {
      label: "YouTube",
      summary: "YouTube bağlantısını kullanarak bir video gömün.",
    },
    webpage: {
      label: "web sayfası",
      summary: "Harici bir web sayfasına bağlantı verin.",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} piksel",
    audioUrl: "Ses dosyasına bağlantı",
    addAudio: "Ses ekle",
    videoUrl: "Video dosyasına bağlantı",
    addVideo: "Video ekle",
    serviceUrl: "Görüntü hizmetine bağlantı",
    invalidService: "Geçersiz hizmet",
    imageUrl: "Resme bağlantı",
    caption: "Altyazı",
    describeImage: "Resmi açıklayın",
    textUrl: "Düz metin dosyasına bağlantı",
    youtubeUrl: "YouTube'ya bağlantı",
    link: "Bağlantı",
    createLink: "Bağlantı oluştur",
    createRange: "Aralık oluştur",
    addThumbnail: "Küçük resim ekle",
    selectSize: "Boyutu seçin",
    urlList: "Bir URL listesi girin (her satıra bir tane)",
    homepageLabel: "Ana sayfa etiketi",
    providerId: "Sağlayıcı kimliği",
    providerIdHelp: "Belirtilmezse oluşturulacak, bu kullanıcının takip edebileceği bir URL değil",
    addProvider: "Sağlayıcı ekle",
    vttHelp:
      "Mevcut bir WebVTT (.vtt) dosyasını bu tuvale bağlayın. Dosyayı eklemeden önce genel bir URL'da barındırın.",
    vttUrl: "WebVTT dosyası URL",
    absoluteUrl: "Mutlak bir http:// veya https:// URL girin",
    languageCode: "Dil (BCP 47 kodu)",
    languageCodeHelp: "en, fr veya pt-BR gibi bir dil kodu",
    addCaptions: "Altyazı ekle",
  },
  browser: {
    selectCanvas: "Tuval seç",
    select: "Seç",
    addToManifest: "Manifest'e ekle",
  },
  errors: {
    media: "Bu medya yüklenemedi. Bağlantıyı kontrol edip tekrar deneyin.",
    details: "Teknik detaylar",
    service: "Resim hizmeti yüklenemedi. Bağlantıyı kontrol edip tekrar deneyin.",
    vttUrl: "WebVTT dosyası için mutlak bir HTTP veya HTTPS URL girin.",
    vttCanvas: "WebVTT altyazıları bir Canvas'a ait olmalıdır.",
    manifest: "Seçilen manifest yüklenemedi.",
    collection: "Seçilen koleksiyon yüklenemedi.",
    canvas: "Seçilen tuval yüklenemedi.",
  },
  resource: {
    create: "Kaynak oluştur",
    chooseType: "Bir kaynak türü seçin",
    label: "Etiket",
    url: "URL",
    invalidUrl: "Geçerli bir URL girin",
    createFailed: "Bu kaynak oluşturulamadı",
  },
  canvas: {
    create: "Kanvas oluştur",
    width: "Genişlik",
    height: "Yükseklik",
    duration: "Süre",
  },
  image: {
    fromUrl: "Resim URL",
    fromService: "IIIF görüntü hizmeti",
    browse: "Resimlere göz atın",
    previewAlt: "Seçilen kaynağın önizlemesi",
    use: "Resmi kullan",
  },
  content: {
    webPage: "web sayfası",
    manifest: "Manifest",
    collection: "Koleksiyon",
  },
} as const;
