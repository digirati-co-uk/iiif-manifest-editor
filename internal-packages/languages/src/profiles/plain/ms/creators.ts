/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Halaman kosong",
      summary: "Mulakan dengan susun atur imej atau halaman kosong",
    },
    internalCanvas: {
      label: "Halaman sedia ada",
      summary: "Pilih halaman daripada item ini.",
    },
    example: {
      label: "Contoh halaman kosong",
      summary: "Buat halaman kosong yang besar dengan tajuk.",
    },
    contents: {
      summary: "Buat bahagian untuk menyusun kandungan item ini.",
    },
    range: {
      summary: "Kumpulan halaman atau bahagian lain ke dalam bahagian.",
    },
    highlight: {
      summary: "Tandai kawasan halaman tanpa menambah kandungan.",
    },
    html: {
      summary: "Tulis teks berformat untuk dipaparkan pada halaman.",
    },
    browser: {
      summary:
        "Semak imbas item IIIF, koleksi atau halaman web koleksi yang disokong dan pilih kandungan untuk ditambahkan.",
      copyMetadata: "Salin butiran item ke halaman yang diimport",
      copyMetadataHelp: "Menyalin butiran deskriptif daripada item sumber apabila penyemak imbas mencipta halaman.",
    },
    manifestBrowser: {
      summary: "Semak imbas item dan koleksi IIIF untuk memilih sesuatu untuk ditambah.",
    },
    vtt: {
      summary: "Tambahkan sari kata atau kapsyen daripada fail WebVTT ke halaman audio atau video.",
    },
  },
  browser: {
    selectCanvas: "Pilih halaman",
    addToManifest: "Tambahkan pada item",
  },
  errors: {
    vttCanvas: "Kapsyen WebVTT mesti dimiliki oleh halaman.",
    canvas: "Tidak dapat memuatkan halaman yang dipilih.",
    manifest: "Tidak dapat memuatkan item yang dipilih.",
  },
  form: {
    vttHelp: "Pautkan fail WebVTT (.vtt) sedia ada ke halaman ini. Hos fail di URL awam sebelum menambahkannya.",
    createRange: "Buat bahagian",
  },
  resource: {
    create: "Tambah sesuatu",
    chooseType: "Pilih perkara yang hendak ditambah",
  },
  canvas: {
    create: "Tambah halaman",
  },
} as const;
