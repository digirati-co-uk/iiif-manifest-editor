/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Boş sayfa",
      summary: "Bir resim düzeniyle veya boş bir sayfayla başlayın",
    },
    internalCanvas: {
      label: "Mevcut sayfa",
      summary: "Bu öğeden bir sayfa seçin.",
    },
    example: {
      label: "Boş sayfa örneği",
      summary: "Başlığı olan büyük, boş bir sayfa oluşturun.",
    },
    contents: {
      summary: "Bu öğenin içeriğini düzenlemek için bir bölüm oluşturun.",
    },
    range: {
      summary: "Sayfaları veya diğer bölümleri bir bölüm halinde gruplayın.",
    },
    highlight: {
      summary: "İçerik eklemeden sayfanın bir alanını işaretleyin.",
    },
    html: {
      summary: "Bir sayfada görüntülenecek biçimlendirilmiş metni yazın.",
    },
    browser: {
      summary:
        "Bir IIIF öğesine, koleksiyonuna veya desteklenen koleksiyon web sayfasına göz atın ve eklenecek içeriği seçin.",
      copyMetadata: "Öğe ayrıntılarını içe aktarılan sayfalara kopyala",
      copyMetadataHelp: "Tarayıcı bir sayfa oluşturduğunda kaynak öğeden açıklayıcı ayrıntıları kopyalar.",
    },
    manifestBrowser: {
      summary: "Eklenecek bir şey seçmek için IIIF öğelerine ve koleksiyonlarına göz atın.",
    },
    vtt: {
      summary: "Bir WebVTT dosyasından bir ses veya video sayfasına altyazı veya resim yazıları ekleyin.",
    },
  },
  browser: {
    selectCanvas: "Sayfa seç",
    addToManifest: "Öğeye ekle",
  },
  errors: {
    vttCanvas: "WebVTT altyazıları bir sayfaya ait olmalıdır.",
    canvas: "Seçilen sayfa yüklenemedi.",
    manifest: "Seçilen öğe yüklenemedi.",
  },
  form: {
    vttHelp:
      "Mevcut bir WebVTT (.vtt) dosyasını bu sayfaya bağlayın. Dosyayı eklemeden önce genel bir URL'da barındırın.",
    createRange: "Bölüm oluştur",
  },
  resource: {
    create: "Bir şey ekle",
    chooseType: "Ne ekleyeceğinizi seçin",
  },
  canvas: {
    create: "Sayfa ekle",
  },
} as const;
