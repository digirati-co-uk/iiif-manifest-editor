/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  resources: {
    collection: "Koleksi",
    manifest: "Manifest",
    canvas: "Kanvas",
    annotation: "Anotasi",
    annotationPage: "Halaman anotasi",
    range: "Julat",
    annotationCollection: "Koleksi anotasi",
    contentResource: "Sumber kandungan",
    agent: "ejen",
  },
  layout: {
    pair: "sebelah menyebelah",
    triptych: "Tiga lajur",
    featureLeft: "Ciri ditinggalkan",
    featureAbove: "Ciri di atas",
    fourImages: "Empat imej",
    sixImages: "Enam imej",
    heroInset: "Wira + sisipan",
    offsetPair: "Pasangan mengimbangi",
    cascade: "Lata",
    stacked: "Bertindan",
    scatter: "berselerak",
    galleryWall: "Dinding galeri",
    blank: "Kanvas kosong",
  },
  fields: {
    label: "Label",
    metadata: "Metadata",
    summary: "Ringkasan",
    requiredStatement: "Pernyataan wajib",
    rights: "Hak",
    provider: "Pembekal",
    thumbnail: "Gambar kecil",
    navDate: "Tarikh navigasi",
    placeholderCanvas: "Kanvas pemegang tempat",
    accompanyingCanvas: "Kanvas yang mengiringi",
    language: "Bahasa",
    id: "Pengecam",
    type: "Jenis",
    format: "Format",
    profile: "Profil",
    height: "Ketinggian",
    width: "Lebar",
    duration: "Tempoh",
    viewingDirection: "Arah pandangan",
    behavior: "Tingkah laku",
    timeMode: "Mod masa",
    motivation: "Motivasi",
    homepage: "Laman utama",
    logo: "Logo",
    rendering: "Perwakilan alternatif",
    service: "Perkhidmatan",
    services: "Perkhidmatan",
    seeAlso: "Penerangan berkaitan",
    partOf: "sebahagian daripada",
    start: "Memulakan kanvas",
    supplementary: "Kandungan tambahan",
    items: "barang",
    structures: "Struktur",
    annotations: "Anotasi",
    target: "Sasaran",
    body: "Badan",
    navPlace: "Lokasi navigasi",
    textGranularity: "Kebutiran teks",
    value: "Nilai",
  },
  documentation: {
    definedTypes: {
      Collection:
        "Senarai tertib Manifes dan/atau Koleksi selanjutnya. Koleksi membenarkan Manifes dan Koleksi anak dikumpulkan dalam struktur hierarki untuk pembentangan, yang boleh untuk menjana navigasi, menunjukkan hasil dinamik daripada carian atau menyediakan set tetap sumber berkaitan untuk sebarang tujuan lain.",
      Manifest:
        "Penerangan tentang struktur dan sifat objek majmuk. Ia membawa maklumat yang diperlukan untuk klien membentangkan kandungan kepada pengguna, seperti tajuk dan maklumat deskriptif lain tentang objek atau karya intelektual yang disampaikannya. Setiap Manifest biasanya menerangkan cara mempersembahkan objek majmuk tunggal seperti buku, patung atau album muzik.",
      Canvas:
        'Bekas maya yang mewakili pandangan tertentu objek dan mempunyai sumber kandungan yang dikaitkan dengannya atau dengan sebahagian daripadanya. Kanvas menyediakan rangka rujukan untuk susun atur kandungan, secara spatial dan sementara. Konsep Kanvas dipinjam daripada standard seperti PDF dan HTML, atau aplikasi seperti Photoshop dan PowerPoint, di mana permukaan paparan pada mulanya kosong mempunyai imej, video, teks dan kandungan lain yang "dilukis" padanya oleh Anotasi, yang dikumpulkan dalam Halaman Anotasi.',
      Range:
        "Senarai tertib Kanvas, dan/atau Julat selanjutnya. Julat membenarkan Kanvas, atau bahagiannya, dikumpulkan bersama dalam beberapa cara. Ini mungkin atas sebab berasaskan kandungan, seperti yang mungkin diterangkan dalam jadual kandungan atau set adegan dalam drama. Begitu juga, ciri fizikal mungkin penting seperti pengumpulan halaman dalam buku awal, atau apabila muzik yang dirakam dipecahkan pada pembawa fizikal yang berbeza seperti dua CD.",
      AnnotationPage:
        "Senarai tertib Anotasi yang biasanya dikaitkan dengan Kanvas tetapi boleh dirujuk daripada jenis sumber lain juga. Halaman Anotasi mengumpul dan menyusun senarai Anotasi, yang seterusnya memberikan ulasan tentang sumber atau kandungan yang merupakan sebahagian daripada Kanvas.",
      Annotation:
        "Anotasi mengaitkan sumber kandungan dengan Kanvas. Mekanisme yang sama digunakan untuk sumber yang boleh dilihat dan/atau boleh didengar seperti yang digunakan untuk transkripsi, ulasan, teg dan kandungan lain. Ini menyediakan kaedah tunggal yang bersatu untuk menjajarkan maklumat dan menyediakan rangka kerja berasaskan piawai untuk membezakan bahagian sumber dan bahagian Kanvas. Memandangkan Anotasi boleh ditambahkan kemudian, ia mempromosikan sistem yang diedarkan di mana penerbit boleh menyelaraskan kandungan mereka dengan huraian yang dibuat oleh orang lain. Kefungsian berkaitan anotasi juga mungkin bergantung pada kelas selanjutnya seperti SpecificResource, Choice atau Selectors.",
      ContentResource:
        "Sumber web seperti imej, audio, video atau teks yang dikaitkan dengan Kanvas melalui Anotasi, atau menyediakan perwakilan mana-mana sumber.",
      AnnotationCollection:
        "Senarai tertib Halaman Anotasi. Koleksi Anotasi membolehkan kumpulan Anotasi peringkat lebih tinggi direkodkan. Contohnya, semua Anotasi terjemahan bahasa Inggeris bagi dokumen Perancis zaman pertengahan boleh dipisahkan daripada transkripsi atau edisi dalam bahasa Perancis moden, atau ulasan pengarah tentang filem boleh diasingkan daripada skrip.",
    },
    descriptive: {
      label:
        "Label, nama atau tajuk yang boleh dibaca manusia. Sifat label bertujuan untuk dipaparkan sebagai pengganti tekstual pendek untuk sumber jika manusia perlu membuat perbezaan antaranya dan sumber yang serupa, contohnya antara objek, halaman atau pilihan untuk pilihan imej untuk dipaparkan. Sifat label boleh diantarabangsakan sepenuhnya dan setiap bahasa boleh mempunyai berbilang nilai.",
      metadata:
        "Senarai tertib perihalan untuk dipaparkan kepada pengguna apabila mereka berinteraksi dengan sumber, diberikan sebagai pasangan label boleh dibaca manusia dan entri nilai. Kandungan penyertaan ini bertujuan untuk persembahan sahaja; semantik deskriptif tidak boleh disimpulkan. Entri mungkin digunakan untuk menyampaikan maklumat tentang penciptaan objek, penerangan fizikal, maklumat pemilikan atau tujuan lain.",
      summary:
        "Ringkasan teks pendek yang bertujuan untuk disampaikan kepada pengguna apabila entri metadata untuk sumber tidak dipaparkan. Ini boleh digunakan sebagai penerangan ringkas untuk hasil carian peringkat item, untuk persekitaran skrin kecil atau sebagai antara muka pengguna alternatif apabila sifat metadata tidak dipaparkan pada masa ini. Sifat ringkasan mengikut corak yang sama seperti sifat label yang diterangkan di atas.",
      requiredStatement:
        "Teks yang mesti dipaparkan apabila sumber dipaparkan atau digunakan. Contohnya, sifat requiredStatement boleh digunakan untuk membentangkan penyata hak cipta atau pemilikan, pengakuan pemilik dan/atau institusi penerbitan, atau sebarang teks lain yang organisasi penerbitan anggap kritikal untuk dipaparkan kepada pengguna. Memandangkan variasi luas antara muka pengguna pelanggan berpotensi, ia tidak selalu dapat memaparkan pernyataan ini kepada pengguna dalam keadaan awal klien. Jika pada mulanya tersembunyi, pelanggan mesti membuat kaedah mendedahkannya sejelas mungkin.",
      rights:
        "Rentetan yang mengenal pasti lesen atau pernyataan hak yang digunakan pada kandungan sumber, seperti JSON Manifes atau piksel imej. Nilai mesti diambil daripada set URI lesen Creative Commons, URI pernyataan hak RightsStatements.org atau yang ditambahkan melalui mekanisme sambungan. Kemasukan harta ini adalah bermaklumat, dan sebagai contoh boleh digunakan untuk memaparkan ikon yang mewakili penegasan hak.",
      provider:
        "Organisasi atau orang yang menyumbang kepada penyediaan kandungan sumber. Pelanggan kemudiannya boleh memaparkan maklumat ini kepada pengguna untuk mengiktiraf sumbangan pembekal. Ini berbeza daripada sifat requiredStatement, kerana data berstruktur, membolehkan pelanggan melakukan lebih daripada sekadar menyampaikan teks tetapi sebaliknya mempunyai maklumat yang lebih kaya tentang orang dan organisasi untuk digunakan dalam antara muka yang berbeza.",
      thumbnail:
        "Sumber kandungan, seperti imej kecil atau klip audio pendek, yang mewakili sumber yang mempunyai sifat lakaran kenit. Sumber mungkin mempunyai berbilang sumber lakaran kecil yang mempunyai jenis dan format yang sama atau berbeza.",
      navDate:
        "Tarikh yang boleh digunakan oleh pelanggan untuk tujuan navigasi apabila membentangkan sumber kepada pengguna dalam antara muka pengguna berasaskan tarikh, seperti kalendar atau garis masa. Lebih banyak julat tarikh deskriptif, bertujuan untuk paparan terus kepada pengguna, harus disertakan dalam sifat metadata untuk kegunaan manusia. Jika sumber mengandungi Kanvas yang mempunyai sifat tempoh, masa tarikh yang diberikan sepadan dengan tarikh masa navigasi permulaan sumber. Sebagai contoh, Julat yang merangkumi Kanvas yang mewakili satu set kandungan video yang merakam peristiwa bersejarah, navDate ialah masa tarikh detik pertama peristiwa yang dirakam.",
      placeholderCanvas:
        "Kanvas tunggal yang menyediakan kandungan tambahan untuk digunakan sebelum kandungan utama sumber yang mempunyai sifat placeholderCanvas dipaparkan, atau sebagai iklan atau stand-in untuk kandungan tersebut. Contohnya termasuk imej, teks dan bunyi berdiri untuk kandungan video sebelum pengguna memulakan main semula; atau poster filem untuk menarik perhatian pengguna. Kandungan yang disediakan oleh placeholderCanvas berbeza daripada lakaran kecil: pelanggan mungkin menggunakan lakaran kecil untuk meringkaskan dan menavigasi berbilang sumber, kemudian menunjukkan kandungan daripada placeholderCanvas sebagai sebahagian daripada pembentangan awal sumber tunggal. Kanvas pemegang tempat mungkin mempunyai dimensi yang berbeza dengan Kanvas sumber yang mempunyai sifat placeholderCanvas.",
      accompanyingCanvas:
        "Kanvas tunggal yang menyediakan kandungan tambahan untuk digunakan semasa memaparkan sumber yang mempunyai sifat accompanyingCanvas. Contohnya termasuk imej untuk ditunjukkan semasa Kanvas tempoh sahaja memainkan audio; atau audio latar belakang untuk dimainkan semasa pengguna menavigasi Manifes imej sahaja.",
      language:
        "Bahasa atau bahasa yang digunakan dalam kandungan sumber luaran ini. Sifat ini sudah tersedia daripada model Anotasi Web untuk sumber kandungan yang merupakan badan atau sasaran Anotasi, namun ia juga boleh digunakan untuk sumber yang dirujuk dari halaman utama, pemaparan dan partOf.",
    },
    technical: {
      id: "URI yang mengenal pasti sumber. Jika sumber hanya tersedia dibenamkan dalam sumber lain, seperti Julat dalam Manifes, maka URI mungkin URI sumber pembenaman dengan serpihan unik di hujungnya. Ini tidak benar untuk Kanvas, yang mesti mempunyai URI sendiri tanpa serpihan.",
      type: "Jenis atau kelas sumber. Untuk kelas yang ditakrifkan untuk spesifikasi ini",
      format:
        "Jenis media tertentu (sering dipanggil jenis MIME) untuk sumber kandungan, contohnya imej/jpeg. Ini penting untuk membezakan format berbeza bagi jenis sumber keseluruhan yang sama, seperti membezakan teks dalam XML daripada teks biasa.",
      profile:
        "Skema atau set fungsi yang dinamakan tersedia daripada sumber. Profil boleh menjelaskan lagi jenis dan/atau format sumber atau perkhidmatan luaran, membolehkan pelanggan menyesuaikan pengendalian mereka terhadap sumber yang mempunyai sifat profil.",
      height:
        "Ketinggian sumber Kanvas atau kandungan luaran. Untuk sumber kandungan, nilainya adalah dalam piksel. Untuk Canvases, nilai tidak mempunyai unit. Dalam kombinasi dengan lebar, ia menyampaikan nisbah aspek untuk ruang di mana sumber kandungan berada.",
      width:
        "Lebar sumber Kanvas atau kandungan luaran. Untuk sumber kandungan, nilainya adalah dalam piksel. Untuk Canvases, nilai tidak mempunyai unit. Dalam kombinasi dengan ketinggian, ia menyampaikan nisbah aspek untuk ruang di mana sumber kandungan berada.",
      duration: "Tempoh sumber Kanvas atau kandungan luaran, diberikan dalam beberapa saat.",
      viewingDirection:
        "Arah di mana satu set Kanvas harus dipaparkan kepada pengguna. Spesifikasi ini mentakrifkan empat nilai arah dalam jadual di bawah. Lain-lain boleh ditakrifkan secara luaran sebagai lanjutan.",
      behavior:
        "Satu set ciri pengalaman pengguna yang penerbit kandungan lebih suka pelanggan gunakan semasa membentangkan sumber. Spesifikasi ini mentakrifkan nilai dalam jadual di bawah. Lain-lain boleh ditakrifkan secara luaran sebagai lanjutan.",
      timeMode:
        "Mod yang dikaitkan dengan Anotasi yang akan digunakan pada pemaparan mana-mana media berasaskan masa, atau sebaliknya boleh dianggap mempunyai tempoh, digunakan sebagai sumber badan Anotasi tersebut. Ambil perhatian bahawa perkaitan timeMode dengan Anotasi bermakna sumber yang berbeza dalam badan tidak boleh mempunyai nilai yang berbeza. Spesifikasi ini mentakrifkan nilai yang dinyatakan dalam jadual di bawah. Lain-lain boleh ditakrifkan secara luaran sebagai lanjutan.",
      motivation:
        'Spesifikasi ini mentakrifkan dua nilai untuk sifat Anotasi Web motivasi, atau tujuan apabila digunakan pada Sumber Tertentu atau Textual Body. Sumber yang dikaitkan dengan Kanvas oleh Anotasi yang mempunyai nilai motivasi "painting" mesti dibentangkan kepada pengguna sebagai perwakilan Kanvas. Sumber yang dikaitkan dengan Kanvas oleh Anotasi yang mempunyai nilai motivasi supplementing boleh dibentangkan kepada pengguna sebagai sebahagian daripada perwakilan Kanvas, atau mungkin dibentangkan dalam bahagian lain antara muka pengguna.',
    },
    linking: {
      homepage:
        "Halaman web yang mengenai objek yang diwakili oleh sumber yang mempunyai sifat halaman utama. Halaman web biasanya diterbitkan oleh organisasi yang bertanggungjawab untuk objek, dan mungkin dihasilkan oleh sistem pengurusan kandungan atau sistem pengkatalogan lain. Sumber mesti boleh dipaparkan terus kepada pengguna. Sumber yang berkaitan, tetapi bukan halaman utama, sebaliknya mesti ditambahkan ke dalam sifat metadata, dengan label atau nilai yang sesuai untuk menerangkan hubungan tersebut.",
      logo: "Sumber imej kecil yang mewakili sumber Agen yang dikaitkan dengannya. Logo mesti dipaparkan dengan jelas apabila sumber dipaparkan atau digunakan, tanpa memotong, memutar atau sebaliknya memesongkan imej. Adalah disyorkan bahawa perkhidmatan API Imej IIIF tersedia untuk imej ini untuk manipulasi lain seperti mengubah saiz.",
      rendering:
        "Sumber yang merupakan representasi alternatif bukan IIIF bagi sumber yang mempunyai sifat pemaparan. Perwakilan sedemikian lazimnya tidak boleh dilukis pada satu Kanvas, kerana ia termasuk terlalu banyak paparan, mempunyai dimensi yang tidak serasi atau sumber kompaun yang memerlukan fungsi pemaparan tambahan. Sumber pemaparan mesti boleh dipaparkan terus kepada pengguna manusia, walaupun pembentangan mungkin di luar klien IIIF. Sumber itu tidak boleh mempunyai halaman percikan atau sumber interstisial lain yang menjadi pengantara akses kepadanya. Jika kawalan akses diperlukan, maka API Pengesahan IIIF disyorkan. Contohnya termasuk rendering buku sebagai PDF atau EPUB, dek slaid dengan imej bangunan atau model 3D patung.",
      service:
        "Perkhidmatan yang pelanggan mungkin berinteraksi secara langsung dan memperoleh maklumat atau fungsi tambahan untuk menggunakan sumber yang mempunyai sifat perkhidmatan, seperti dari Imej ke pangkalan URI perkhidmatan API Imej IIIF yang berkaitan. Sumber perkhidmatan harus mempunyai maklumat tambahan yang dikaitkan dengannya untuk membolehkan pelanggan menentukan cara menggunakannya dengan sewajarnya. Sila lihat dokumen Pendaftaran Perkhidmatan untuk butiran jenis perkhidmatan yang diketahui pada masa ini.",
      services:
        "Senarai satu atau lebih definisi perkhidmatan pada sumber paling teratas dokumen, yang biasanya dikongsi oleh lebih daripada satu sumber berikutnya. Ini membolehkan perkhidmatan kongsi ini dikumpul bersama di satu tempat, dan bukannya sama ada maklumat mereka diduplikasi berkali-kali sepanjang dokumen, atau memerlukan pelanggan yang menggunakan untuk merentasi keseluruhan struktur dokumen untuk mencari maklumat. Sumber yang digunakan oleh perkhidmatan mesti masih mempunyai sifat perkhidmatan, seperti yang diterangkan di atas, dengan sumber perkhidmatan mempunyai sekurang-kurangnya sifat id dan jenis atau @id dan @type. Ini membolehkan pelanggan mengetahui bahawa perkhidmatan tersebut digunakan untuk sumber tersebut. Penggunaan harta perkhidmatan adalah mengikut budi bicara sistem penerbitan.",
      seeAlso:
        "Sumber boleh dibaca mesin seperti penerangan XML atau RDF yang berkaitan dengan sumber semasa yang mempunyai sifat seeAlso. Sifat sumber harus diberikan untuk membantu pelanggan memilih antara berbilang penerangan (jika disediakan), dan untuk menggunakan dokumen yang sesuai. Jika perhubungan antara sumber dan dokumen perlu lebih khusus, maka dokumen itu hendaklah memasukkan perhubungan itu dan bukannya sumber IIIF. Sumber IIIF lain juga merupakan sasaran yang sah untuk seeAlso, contohnya untuk memaut ke Manifes yang menerangkan objek berkaitan. URI dokumen mesti mengenal pasti perwakilan tunggal data dalam format tertentu. Contohnya, jika data yang sama wujud dalam JSON dan XML, maka sumber yang berasingan harus ditambah untuk setiap perwakilan, dengan sifat id dan format yang berbeza.",
      partOf:
        "Sumber yang mengandungi yang merangkumi sumber yang mempunyai sifat partOf. Apabila pelanggan menemui sifat partOf, ia mungkin mendapatkan semula sumber yang mengandungi rujukan, jika ia tidak dibenamkan dalam perwakilan semasa, untuk menyumbang kepada pemprosesan sumber yang terkandung. Sebagai contoh, sifat partOf pada Kanvas boleh digunakan untuk merujuk Manifes luaran untuk membolehkan penemuan maklumat lanjut yang berkaitan. Begitu juga, Manifes boleh merujuk Koleksi yang mengandungi menggunakan partOf untuk membantu dalam navigasi.",
      start:
        "Kanvas, atau sebahagian daripada Kanvas, yang harus ditunjukkan oleh pelanggan pada permulaan untuk sumber yang mempunyai sifat mula. Rujukan kepada sebahagian daripada Kanvas dikendalikan dengan cara yang sama seperti Julat merujuk bahagian Kanvas. Sifat ini membolehkan pelanggan bermula dengan Kanvas pertama yang mengandungi kandungan menarik dan bukannya memerlukan pengguna menavigasi secara manual untuk mencarinya.",
      supplementary:
        "Pautan daripada Julat ini ke Koleksi Anotasi yang merangkumi Anotasi supplementing sumber kandungan untuk Julat. Pelanggan mungkin menggunakan ini untuk membentangkan kandungan tambahan kepada pengguna daripada Kanvas yang berbeza apabila berinteraksi dengan Julat, atau untuk melompat ke bahagian Julat seterusnya dalam Kanvas yang sama. Sebagai contoh, Julat mungkin mewakili artikel akhbar yang merangkumi halaman tidak berurutan, dan kemudian menggunakan sifat tambahan untuk merujuk Koleksi Anotasi yang terdiri daripada Anotasi yang merekodkan teks, dibahagikan kepada Halaman Anotasi setiap halaman akhbar. Sebagai alternatif, Julat mungkin mewakili bahagian manuskrip yang telah ditranskripsi atau diterjemahkan, apabila terdapat bahagian lain yang masih belum diusahakan. Koleksi Anotasi ialah Anotasi yang masing-masing menyalin atau menterjemah.",
    },
    structural: {
      items:
        "Kebanyakan kefungsian API Persembahan IIIF hanyalah merekodkan susunan sumber anak berlaku dalam sumber induk, seperti Koleksi atau Manifes dalam Koleksi induk atau Kanvas dalam Manifes. Semua situasi ini dilindungi dengan satu harta, item.",
      structures:
        'Struktur objek yang diwakili sebagai Manifes boleh diterangkan menggunakan hierarki Julat. Julat boleh digunakan untuk menerangkan "jadual kandungan" objek atau struktur lain yang pengguna boleh berinteraksi dengan melebihi susunan yang diberikan oleh item sifat Manifes. Hierarki dibina dengan menyarangkan sumber Julat anak dalam tatasusunan item Julat peringkat lebih tinggi. Julat peringkat atas hierarki ini diberikan dalam harta struktur.',
      annotations:
        "Senarai tertib Halaman Anotasi yang mengandungi ulasan atau Anotasi lain tentang sumber ini, berasingan daripada Anotasi yang digunakan untuk melukis kandungan pada Kanvas. Motivasi Anotasi mestilah bukan painting dan sasaran Anotasi mesti menyertakan sumber ini atau sebahagian daripadanya.",
    },
    attribution:
      "Hak Cipta © 2012-2023 Editor dan penyumbang. Diterbitkan oleh Konsortium IIIF di bawah lesen CC-BY, lihat penafian.",
  },
  behavior: {
    groups: {
      autoAdvance: "Automajukan",
      repeat: "ulang",
      manifestOrdering: "Pesanan manifes",
      canvasOrdering: "Pesanan kanvas",
      collection: "Koleksi",
      range: "Julat",
      collectionOrdering: "Pesanan koleksi",
      rangeOrdering: "Pesanan pelbagai",
      hidden: "Keterlihatan",
    },
    values: {
      "auto-advance": "Automajukan",
      "no-auto-advance": "Tiada auto-advance",
      repeat: "ulang",
      "no-repeat": "Tiada ulangan",
      unordered: "Tidak tertib",
      individuals: "Kanvas individu",
      continuous: "Berterusan",
      paged: "berhalaman muka surat",
      "facing-pages": "Menghadap muka surat",
      "non-paged": "Tidak berhalaman halaman",
      "multi-part": "Berbilang bahagian",
      together: "bersama-sama",
      sequence: "Urutan",
      "thumbnail-nav": "Navigasi imej kecil",
      "no-nav": "Tiada navigasi",
      hidden: "Tersembunyi",
    },
  },
  rights: {
    attributionNonCommercialNoDerivs: {
      label: "Atribusi-Bukan Komersial-TiadaTerbitan",
      description:
        "Lesen ini adalah yang paling terhad daripada enam lesen utama kami, hanya membenarkan orang lain memuat turun karya anda dan berkongsinya dengan orang lain selagi mereka mengkreditkan anda, tetapi mereka tidak boleh mengubahnya dalam apa jua cara atau menggunakannya secara komersial.",
    },
    attributionNonCommercialShareAlike: {
      label: "Attribution-NonCommercial-ShareAlike",
      description:
        "Lesen ini membenarkan orang lain mengadun semula, menyesuaikan diri dan membina kerja anda secara bukan komersial, selagi mereka mengkreditkan anda dan melesenkan ciptaan baharu mereka di bawah syarat yang sama.",
    },
    attributionNonCommercial: {
      label: "Atribusi-Bukan Komersial",
      description:
        "Lesen ini membenarkan orang lain mengadun semula, menyesuaikan diri dan membina kerja anda secara bukan komersial, dan walaupun karya baharu mereka juga mesti mengiktiraf anda dan bukan komersial, mereka tidak perlu melesenkan karya terbitan mereka dengan syarat yang sama.",
    },
    attributionNoDerivs: {
      label: "Atribusi-TiadaTerbitan",
      description:
        "Lesen ini membenarkan orang lain menggunakan semula kerja untuk sebarang tujuan, termasuk secara komersial; walau bagaimanapun, ia tidak boleh dikongsi dengan orang lain dalam bentuk yang disesuaikan, dan kredit mesti diberikan kepada anda.",
    },
    attributionShareAlike: {
      label: "Atribusi-ShareAlike",
      description:
        'Lesen ini membenarkan orang lain mengadun semula, menyesuaikan dan membina hasil kerja anda walaupun untuk tujuan komersial, selagi mereka mengkreditkan anda dan melesenkan ciptaan baharu mereka di bawah syarat yang sama. Lesen ini sering dibandingkan dengan lesen perisian bebas dan sumber terbuka "copyleft". Semua karya baharu berdasarkan karya anda akan membawa lesen yang sama, jadi sebarang derivatif juga akan membenarkan penggunaan komersial. Ini adalah lesen yang digunakan oleh Wikipedia, dan disyorkan untuk bahan yang akan mendapat manfaat daripada memasukkan kandungan daripada Wikipedia dan projek berlesen yang serupa.',
    },
    attribution: {
      label: "Atribusi",
      description:
        "Lesen ini membenarkan orang lain mengedar, mengadun semula, menyesuaikan diri dan membina hasil kerja anda, walaupun secara komersil, selagi mereka mengkreditkan anda untuk ciptaan asal. Ini adalah lesen yang paling akomodatif yang ditawarkan. Disyorkan untuk penyebaran maksimum dan penggunaan bahan berlesen.",
    },
    publicDomain: {
      label: "Domain Awam",
      description:
        "Orang yang mengaitkan karya dengan surat ikatan ini telah mendedikasikan karya itu kepada domain awam dengan mengetepikan semua haknya terhadap karya di seluruh dunia di bawah undang-undang hak cipta, termasuk semua hak berkaitan dan jiran, setakat yang dibenarkan oleh undang-undang.",
    },
  },
  sizes: {
    landscape: "12 × 8 · Landskap",
    wide: "12 × 6 · Lebar",
    square: "12 × 12 · Segi empat sama",
    portrait: "8 × 12 · Potret",
  },
} as const;
