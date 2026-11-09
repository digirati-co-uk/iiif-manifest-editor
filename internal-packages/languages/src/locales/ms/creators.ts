/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Kanvas kosong",
      summary: "Mulakan dengan reka letak imej atau kanvas kosong",
    },
    internalCanvas: {
      label: "Kanvas sedia ada",
      summary: "Pilih kanvas daripada manifes ini.",
    },
    example: {
      label: "Contoh kanvas kosong",
      summary: "Buat kanvas kosong yang besar dengan tajuk.",
    },
    thumbnail: {
      label: "IIIF lakaran kenit",
      summary: "Cipta lakaran kecil daripada perkhidmatan imej IIIF.",
    },
    vtt: {
      label: "Kapsyen WebVTT",
      summary: "Tambahkan sari kata atau kapsyen daripada fail WebVTT pada kanvas audio atau video.",
    },
    contents: {
      label: "Jadual kandungan",
      summary: "Buat julat peringkat atas untuk mengatur kandungan manifes.",
    },
    provider: {
      summary: "Tambahkan organisasi yang bertanggungjawab menyediakan sumber ini.",
    },
    browser: {
      label: "Semak imbas kandungan IIIF",
      summary:
        "Semak imbas halaman web manifes, koleksi atau koleksi yang disokong IIIF dan pilih kandungan untuk ditambahkan.",
      copyMetadata: "Tambahkan metadata manifes pada kanvas yang diimport",
      copyMetadataHelp: "Menyalin metadata daripada Manifes sumber apabila IIIF Browser mencipta Kanvas.",
    },
    manifestBrowser: {
      summary: "Semak imbas manifes dan koleksi IIIF untuk memilih sumber untuk ditambah.",
    },
    audio: {
      label: "Audio",
      summary: "Tambahkan audio daripada pautan fail audio langsung.",
    },
    service: {
      label: "Imej IIIF",
      summary: "Tambahkan imej boleh zum menggunakan perkhidmatan imej IIIF atau pautan info.json.",
    },
    highlight: {
      label: "Serlahkan",
      summary: "Tandai kawasan kanvas tanpa menambah sebarang kandungan.",
      create: "Buat sorotan",
    },
    annotationPage: {
      label: "Halaman anotasi kosong",
      summary: "Buat halaman kosong untuk mengatur anotasi.",
    },
    range: {
      summary: "Himpunkan kanvas atau julat lain ke dalam bahagian.",
    },
    imageList: {
      label: "Berbilang imej",
      summary: "Tambahkan beberapa imej menggunakan satu pautan imej langsung setiap baris.",
    },
    plaintext: {
      label: "Pautan teks biasa",
      summary: "Pautan ke fail teks biasa luaran.",
    },
    htmlBody: {
      label: "Teks berformat",
      summary: "Tulis teks berformat sebagai kandungan anotasi.",
    },
    html: {
      label: "HTML",
      summary: "Tulis teks berformat untuk dipaparkan pada kanvas.",
    },
    video: {
      label: "Video",
      summary: "Tambahkan video daripada pautan fail video langsung. Gunakan YouTube untuk video YouTube.",
    },
    imageUrl: {
      label: "Imej",
      summary: "Tambahkan imej menggunakan pautan fail imej langsung.",
    },
    captionedImage: {
      label: "Imej berkapsyen",
      summary: "Tambahkan imej daripada pautan terus dan tulis kapsyennya.",
    },
    youtube: {
      label: "YouTube",
      summary: "Benamkan video menggunakan pautan YouTubenya.",
    },
    webpage: {
      label: "laman web",
      summary: "Pautan ke halaman web luaran.",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} piksel",
    audioUrl: "Pautan ke fail audio",
    addAudio: "Tambah audio",
    videoUrl: "Pautan ke fail video",
    addVideo: "Tambah video",
    serviceUrl: "Pautan ke perkhidmatan imej",
    invalidService: "Perkhidmatan tidak sah",
    imageUrl: "Pautan ke imej",
    caption: "Kapsyen",
    describeImage: "Terangkan imej",
    textUrl: "Pautan ke fail teks biasa",
    youtubeUrl: "Pautan ke YouTube",
    link: "Pautan",
    createLink: "Buat pautan",
    createRange: "Cipta julat",
    addThumbnail: "Tambah lakaran kenit",
    selectSize: "Pilih saiz",
    urlList: "Masukkan senarai URL (satu setiap baris)",
    homepageLabel: "Label halaman utama",
    providerId: "ID Pembekal",
    providerIdHelp: "Akan dijana jika tidak dinyatakan, ini bukan URL yang boleh diikuti oleh pengguna",
    addProvider: "Tambah pembekal",
    vttHelp: "Pautkan fail WebVTT (.vtt) sedia ada ke kanvas ini. Hos fail di URL awam sebelum menambahkannya.",
    vttUrl: "Fail WebVTT URL",
    absoluteUrl: "Masukkan http:// atau https:// URL mutlak",
    languageCode: "Bahasa (kod BCP 47)",
    languageCodeHelp: "Kod bahasa seperti en, fr atau pt-BR",
    addCaptions: "Tambah kapsyen",
  },
  browser: {
    selectCanvas: "Pilih kanvas",
    select: "Pilih",
    addToManifest: "Tambahkan pada manifes",
  },
  errors: {
    media: "Tidak dapat memuatkan media ini. Semak pautan dan cuba lagi.",
    details: "Butiran teknikal",
    service: "Tidak dapat memuatkan perkhidmatan imej. Semak pautan dan cuba lagi.",
    vttUrl: "Masukkan HTTP atau HTTPS URL mutlak untuk fail WebVTT.",
    vttCanvas: "Kapsyen WebVTT mestilah milik Kanvas.",
    manifest: "Tidak dapat memuatkan manifes yang dipilih.",
    collection: "Tidak dapat memuatkan koleksi yang dipilih.",
    canvas: "Tidak dapat memuatkan kanvas yang dipilih.",
  },
  resource: {
    create: "Cipta sumber",
    chooseType: "Pilih jenis sumber",
    label: "Label",
    url: "URL",
    invalidUrl: "Masukkan URL yang sah",
    createFailed: "Tidak dapat mencipta sumber ini",
  },
  canvas: {
    create: "Buat kanvas",
    width: "Lebar",
    height: "Ketinggian",
    duration: "Tempoh",
  },
  image: {
    fromUrl: "Imej URL",
    fromService: "Perkhidmatan imej IIIF",
    browse: "Semak imbas imej",
    previewAlt: "Pratonton sumber yang dipilih",
    use: "Gunakan imej",
  },
  content: {
    webPage: "laman web",
    manifest: "Manifest",
    collection: "Koleksi",
  },
} as const;
