/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  resources: {
    collection: "Koleksiyon",
    manifest: "Manifest",
    canvas: "Tuval",
    annotation: "Dipnot",
    annotationPage: "Ek açıklama sayfası",
    range: "Aralık",
    annotationCollection: "Ek açıklama koleksiyonu",
    contentResource: "İçerik kaynağı",
    agent: "Ajan",
  },
  layout: {
    pair: "Yan yana",
    triptych: "Üç sütun",
    featureLeft: "Özellik kaldı",
    featureAbove: "Yukarıdaki özellik",
    fourImages: "Dört resim",
    sixImages: "Altı resim",
    heroInset: "Kahraman + ek",
    offsetPair: "Ofset çifti",
    cascade: "Çağlayan",
    stacked: "Yığılmış",
    scatter: "Dağılım",
    galleryWall: "Galeri duvarı",
    blank: "Boş tuval",
  },
  fields: {
    label: "Etiket",
    metadata: "Üst veriler",
    summary: "Özet",
    requiredStatement: "Zorunlu bildirim",
    rights: "Haklar",
    provider: "sağlayıcı",
    thumbnail: "Küçük resim",
    navDate: "Navigasyon tarihi",
    placeholderCanvas: "Yer tutucu tuval",
    accompanyingCanvas: "Eşlik eden tuval",
    language: "Dil",
    id: "Tanımlayıcı",
    type: "Tür",
    format: "Biçim",
    profile: "Profil",
    height: "Yükseklik",
    width: "Genişlik",
    duration: "Süre",
    viewingDirection: "Görüntüleme yönü",
    behavior: "Davranış",
    timeMode: "Zaman modu",
    motivation: "Motivasyon",
    homepage: "Ana sayfa",
    logo: "Logo",
    rendering: "Alternatif temsil",
    service: "Hizmet",
    services: "Hizmetler",
    seeAlso: "İlgili açıklama",
    partOf: "Bir kısmı",
    start: "Kanvas başlatılıyor",
    supplementary: "Tamamlayıcı içerik",
    items: "Öğeler",
    structures: "Yapılar",
    annotations: "Ek açıklamalar",
    target: "Hedef",
    body: "Vücut",
    navPlace: "Navigasyon konumu",
    textGranularity: "Metin ayrıntı düzeyi",
    value: "Değer",
  },
  documentation: {
    definedTypes: {
      Collection:
        "Manifestlerin ve/veya diğer Koleksiyonların sıralı bir listesi. Koleksiyonlar, Manifest'lerin ve alt Koleksiyonların sunum için hiyerarşik bir yapıda gruplandırılmasına olanak tanır; bu, gezinme oluşturmak, bir aramanın dinamik sonuçlarını göstermek veya başka herhangi bir amaç için ilgili kaynakların sabit kümelerini sağlamak için olabilir.",
      Manifest:
        "Bileşik nesnenin yapısının ve özelliklerinin açıklaması. Bir başlık ve ilettiği nesne veya fikri çalışma hakkındaki diğer açıklayıcı bilgiler gibi, müşterinin içeriği kullanıcıya sunması için gereken bilgileri taşır. Her Manifest genellikle kitap, heykel veya müzik albümü gibi tek bir bileşik nesnenin nasıl sunulacağını açıklar.",
      Canvas:
        'Nesnenin belirli bir görünümünü temsil eden ve onunla veya onun parçalarıyla ilişkili içerik kaynaklarına sahip olan sanal bir kap. Kanvas, içeriğin düzeni için hem mekansal hem de zamansal olarak bir referans çerçevesi sağlar. Kanvas kavramı, PDF ve HTML gibi standartlardan veya Photoshop ve PowerPoint gibi uygulamalardan alınmıştır; burada başlangıçta boş bir ekran yüzeyinde, Ek Açıklama Sayfalarında toplanan Ek Açıklamalar tarafından üzerine "boyanmış" resimler, video, metin ve diğer içerikler bulunur.',
      Range:
        "Kanvasların ve/veya diğer Aralıkların sıralı bir listesi. Aralıklar, Kanvasların veya bunların parçalarının bir şekilde birlikte gruplanmasına olanak tanır. Bu, içindekiler tablosunda veya bir oyundaki sahne dizisinde tanımlanabilecek içerik temelli nedenlerden dolayı olabilir. Aynı şekilde, eski bir kitaptaki sayfaların toplanması veya kaydedilen müziğin iki CD gibi farklı fiziksel taşıyıcılara bölünmesi gibi fiziksel özellikler de önemli olabilir.",
      AnnotationPage:
        "Genellikle bir Kanvas ile ilişkilendirilen ancak diğer kaynak türlerinden de referans alınabilen sıralı Ek Açıklamalar listesi. Ek Açıklama Sayfaları, Kanvas'ın parçası olan bir kaynak veya içerik hakkında yorum sağlayan Ek Açıklama listelerini toplar ve sıralar.",
      Annotation:
        "Ek açıklamalar içerik kaynaklarını Kanvaslarla ilişkilendirir. Transkripsiyonlar, yorumlar, etiketler ve diğer içerikler için kullanılan mekanizmanın aynısı görünür ve/veya işitsel kaynaklar için de kullanılır. Bu, bilgileri hizalamak için tek ve birleşik bir yöntem sağlar ve kaynakların bölümleri ile Kanvasların bölümlerini ayırt etmek için standartlara dayalı bir çerçeve sağlar. Ek Açıklamalar daha sonra eklenebildiğinden, yayıncıların içeriklerini başkaları tarafından oluşturulan açıklamalarla uyumlu hale getirebileceği dağıtılmış bir sistemi destekler. Ek açıklamayla ilgili işlevsellik ayrıca SpecificResource, Seçim veya Seçiciler gibi başka sınıflara da bağlı olabilir.",
      ContentResource:
        "Bir Ek Açıklama aracılığıyla bir Kanvas ile ilişkilendirilen veya herhangi bir kaynağın temsilini sağlayan resimler, ses, video veya metin gibi web kaynakları.",
      AnnotationCollection:
        "Ek Açıklama Sayfalarının sıralı bir listesi. Ek Açıklama Koleksiyonları, Ek Açıklamaların daha yüksek düzeyde gruplandırılmasının kaydedilmesine olanak tanır. Örneğin, bir Orta Çağ Fransızca belgesinin tüm İngilizce çeviri Ek Açıklamaları, transkripsiyondan veya modern Fransızca baskıdan ayrı tutulabilir veya yönetmenin bir filme ilişkin yorumu senaryodan ayrılabilir.",
    },
    descriptive: {
      label:
        "İnsanların okuyabileceği bir etiket, ad veya başlık. Label özelliğinin, bir insanın kaynakla benzer kaynaklar arasında (örneğin nesneler, sayfalar veya görüntülenecek görüntü seçimi için seçenekler arasında) bir ayrım yapması gerekiyorsa, kaynağın kısa, metinsel bir vekili olarak görüntülenmesi amaçlanmaktadır. Label özelliği tamamen uluslararası hale getirilebilir ve her dilin birden fazla değeri olabilir.",
      metadata:
        "Kullanıcı tarafından okunabilen etiket ve değer girişi çiftleri olarak verilen, kaynakla etkileşime girdiğinde kullanıcıya görüntülenecek sıralı bir açıklama listesi. Bu girişlerin içeriği yalnızca sunum amaçlıdır; betimleyici anlambilimden çıkarım yapılmamalıdır. Bir giriş, nesnenin yaratılışı, fiziksel bir tanım, sahiplik bilgisi veya diğer amaçlarla ilgili bilgileri iletmek için kullanılabilir.",
      summary:
        "Kaynağa ilişkin meta veri girişleri görüntülenmediğinde kullanıcıya iletilmesi amaçlanan kısa bir metin özeti. Bu, küçük ekran ortamları için öğe düzeyinde arama sonuçları için kısa bir açıklama olarak veya meta veri özelliği şu anda oluşturulmadığında alternatif bir kullanıcı arayüzü olarak kullanılabilir. Özet özelliği, yukarıda açıklanan label özelliğiyle aynı modeli izler.",
      requiredStatement:
        "Kaynak görüntülendiğinde veya kullanıldığında görüntülenmesi gereken metin. Örneğin, requiredStatement özelliği, telif hakkı veya sahiplik bildirimlerini, sahip olan ve/veya yayınlayan kurumun onayını veya yayın kuruluşunun kullanıcıya gösterilmesinin kritik olduğunu düşündüğü diğer herhangi bir metni sunmak için kullanılabilir. Potansiyel istemci kullanıcı arayüzlerinin geniş çeşitliliği göz önüne alındığında, bu ifadeyi kullanıcıya istemcinin başlangıç ​​durumunda görüntülemek her zaman mümkün olmayacaktır. Başlangıçta gizlenmişse, müşterilerin bunu açığa çıkarma yöntemini mümkün olduğunca açık hale getirmesi gerekir.",
      rights:
        "Bir Bildirimin JSON'su veya bir görüntünün pikselleri gibi, kaynağın içeriği için geçerli olan bir lisans veya hak bildirimini tanımlayan bir dize. Değer, Creative Commons lisans URI'leri kümesinden, RightsStatements.org hak bildirimi URI'lerinden veya uzantı mekanizması yoluyla eklenenlerden alınmalıdır. Bu özelliğin dahil edilmesi bilgilendiricidir ve örneğin hak iddialarını temsil eden bir simgeyi görüntülemek için kullanılabilir.",
      provider:
        "Kaynağın içeriğinin sağlanmasına katkıda bulunan kuruluş veya kişi. Müşteriler daha sonra sağlayıcının katkılarını onaylamak için bu bilgileri kullanıcıya görüntüleyebilir. Bu, requiredStatement özelliğinden farklıdır, çünkü veriler yapılandırılmıştır ve istemcinin yalnızca metni sunmaktan fazlasını yapmasına, bunun yerine farklı arayüzlerde kullanılacak kişiler ve kuruluşlar hakkında daha zengin bilgilere sahip olmasına olanak tanır.",
      thumbnail:
        "Küçük resim özelliğine sahip kaynağı temsil eden, küçük bir resim veya kısa ses klibi gibi bir içerik kaynağı. Bir kaynak, aynı veya farklı türde ve formatta birden fazla küçük resim kaynağına sahip olabilir.",
      navDate:
        "İstemcilerin, kaynağı kullanıcıya takvim veya zaman çizelgesi gibi tarih tabanlı bir kullanıcı arayüzünde sunarken gezinme amacıyla kullanabileceği bir tarih. Doğrudan kullanıcıya görüntülenmesi amaçlanan daha açıklayıcı tarih aralıkları, insanların kullanımına yönelik meta veri özelliğine dahil edilmelidir. Kaynak, süre özelliğine sahip Kanvaslar içeriyorsa, verilen tarihsaat, kaynağın başlangıcındaki gezinme tarihsaatine karşılık gelir. Örneğin, tarihsel bir olayı kaydeden bir dizi video içeriğini temsil eden bir Kanvas içeren bir Aralık olan navDate, kaydedilen olayın ilk anının tarih/saatidir.",
      placeholderCanvas:
        "placeholderCanvas özelliğine sahip kaynağın ana içeriği oluşturulmadan önce veya bu içeriğin reklamı veya dublörü olarak kullanılmak üzere ek içerik sağlayan tek bir Kanvas. Örnekler arasında, kullanıcı oynatmayı başlatmadan önce video içeriği için hazır bulunan görüntüler, metinler ve sesler; veya kullanıcının dikkatini çekecek bir film posteri. placeholderCanvas tarafından sağlanan içerik küçük resimden farklıdır: Bir müşteri, birden fazla kaynağı özetlemek ve gezinmek için küçük resmi kullanabilir, ardından tek bir kaynağın ilk sunumunun bir parçası olarak placeholderCanvas'daki içeriği gösterebilir. Bir yer tutucu Kanvasın, placeholderCanvas özelliğine sahip kaynağın Kanvaslarından farklı boyutları olması muhtemeldir.",
      accompanyingCanvas:
        "accompanyingCanvas özelliğine sahip kaynak oluşturulurken kullanılmak üzere ek içerik sağlayan tek bir Kanvas. Örnekler arasında yalnızca süreye dayalı bir Canvas ses çalarken gösterilecek bir resim; veya kullanıcı yalnızca görselden oluşan bir Manifest'te gezinirken çalınacak arka plan sesi.",
      language:
        "Bu harici kaynağın içeriğinde kullanılan dil veya diller. Bu özellik, bir Ek Açıklamanın gövdesi veya hedefi olan içerik kaynakları için Web Ek Açıklama modelinde zaten mevcuttur, ancak aynı zamanda ana sayfa, oluşturma ve partOf'dan başvurulan kaynaklar için de kullanılabilir.",
    },
    technical: {
      id: "Kaynağı tanımlayan URI. Kaynak yalnızca bir Bildirim içindeki Aralık gibi başka bir kaynak içinde gömülü olarak mevcutsa URI, ucunda benzersiz bir parça bulunan gömme kaynağın URI'su olabilir. Bu, parça olmadan kendi URI'larına sahip olması gereken Kanvaslar için geçerli değildir.",
      type: "Kaynağın türü veya sınıfı. Bu spesifikasyon için tanımlanan sınıflar için",
      format:
        "Bir içerik kaynağı için özel ortam türü (genellikle MIME türü olarak adlandırılır), örneğin resim/jpeg. Bu, XML'daki metni düz metinden ayırmak gibi, aynı genel kaynak türünün farklı formatlarını ayırt etmek için önemlidir.",
      profile:
        "Kaynakta mevcut olan bir şema veya adlandırılmış işlevsellik kümesi. Profil, harici bir kaynağın veya hizmetin türünü ve/veya biçimini daha da netleştirerek müşterilerin profil özelliğine sahip kaynağın işlenmesini özelleştirmesine olanak tanır.",
      height:
        "Canvas'ın veya harici içerik kaynağının yüksekliği. İçerik kaynakları için değer piksel cinsindendir. Kanvaslar için değerin bir birimi yoktur. Genişlikle birlikte içerik kaynaklarının bulunduğu alanın en boy oranını aktarır.",
      width:
        "Canvas'ın veya harici içerik kaynağının genişliği. İçerik kaynakları için değer piksel cinsindendir. Kanvaslar için değerin bir birimi yoktur. Yükseklikle birlikte içerik kaynaklarının bulunduğu alanın en boy oranını aktarır.",
      duration: "Kanvas veya harici içerik kaynağının saniye cinsinden süresi.",
      viewingDirection:
        "Bir Kanvas kümesinin kullanıcıya görüntülenmesi gereken yön. Bu spesifikasyon aşağıdaki tabloda dört yön değerini tanımlar. Diğerleri dışarıdan bir uzantı olarak tanımlanabilir.",
      behavior:
        "İçeriğin yayıncısının, istemcinin kaynağı sunarken kullanmasını tercih edeceği bir dizi kullanıcı deneyimi özelliği. Bu spesifikasyon aşağıdaki tabloda yer alan değerleri tanımlar. Diğerleri dışarıdan bir uzantı olarak tanımlanabilir.",
      timeMode:
        "Herhangi bir zamana dayalı ortamın oluşturulmasına uygulanacak olan bir Ek Açıklama ile ilişkili bir mod veya söz konusu Ek Açıklamanın ana kaynağı olarak kullanılan bir süreye sahip olduğu kabul edilebilir. timeMode'nun Ek Açıklama ile ilişkilendirilmesinin, gövdedeki farklı kaynakların farklı değerlere sahip olamayacağı anlamına geldiğini unutmayın. Bu spesifikasyon aşağıdaki tabloda belirtilen değerleri tanımlar. Diğerleri dışarıdan bir uzantı olarak tanımlanabilir.",
      motivation:
        'Bu spesifikasyon, motivasyonun Web Açıklaması özelliği veya Belirli bir Kaynakta veya Textual Body üzerinde kullanıldığında amaç için iki değer tanımlar. "painting" motivasyon değerine sahip bir Ek Açıklama ile Kanvas ile ilişkilendirilen kaynaklar, Kanvasın temsili olarak kullanıcıya sunulmalıdır. supplementing motivasyon değerine sahip bir Ek Açıklama aracılığıyla Kanvas ile ilişkilendirilen kaynaklar, Kanvas temsilinin bir parçası olarak kullanıcıya sunulabilir veya kullanıcı arayüzünün farklı bir bölümünde sunulabilir.',
    },
    linking: {
      homepage:
        "Ana sayfa özelliğine sahip kaynağın temsil ettiği nesneyle ilgili bir web sayfası. Web sayfası genellikle nesneden sorumlu kuruluş tarafından yayınlanır ve bir içerik yönetim sistemi veya başka bir kataloglama sistemi tarafından oluşturulabilir. Kaynak doğrudan kullanıcıya gösterilebilmelidir. Ana sayfalar dışındaki ilgili kaynaklar, ilişkiyi açıklamak için uygun bir etiket veya değerle birlikte meta veri özelliğine eklenmelidir.",
      logo: "İlişkili olduğu Aracı kaynağını temsil eden küçük bir görüntü kaynağı. Kaynak görüntülendiğinde veya kullanıldığında logo, görüntüyü kırpmadan, döndürmeden veya başka bir şekilde bozmadan açıkça oluşturulmalıdır. Yeniden boyutlandırma gibi diğer işlemler için bu görüntü için bir IIIF Görüntü API hizmetinin mevcut olması önerilir.",
      rendering:
        "Oluşturma özelliğine sahip kaynağın alternatif, IIIF olmayan temsili olan bir kaynak. Bu tür temsiller, çok fazla görünüm içerdikleri, uyumsuz boyutlara sahip oldukları veya ek oluşturma işlevselliği gerektiren bileşik kaynaklar oldukları için genellikle tek bir Kanvas üzerine boyanamaz. Sunum IIIF istemcisinin dışında olabilse de, işleme kaynağı doğrudan bir insan kullanıcıya görüntülenebilmelidir. Kaynağın, erişime aracılık eden bir açılış sayfası veya başka bir geçiş reklamı kaynağı olmamalıdır. Erişim kontrolü gerekiyorsa IIIF Kimlik Doğrulama API'si önerilir. Örnekler arasında bir kitabın PDF veya EPUB olarak oluşturulması, bir bina görsellerinin yer aldığı slayt gösterisi veya bir heykelin 3 boyutlu modeli yer alır.",
      service:
        "İstemcinin doğrudan etkileşimde bulunabileceği ve hizmet özelliğine sahip kaynağı kullanmak için ek bilgi veya işlevsellik kazanabileceği bir hizmet (örneğin, bir Görüntüden ilişkili bir IIIF Görüntü API hizmetinin URI tabanına kadar). Hizmet kaynağının, müşterinin onu nasıl uygun şekilde kullanacağını belirlemesine olanak sağlamak için kendisiyle ilişkili ek bilgilere sahip olması gerekir. Şu anda bilinen hizmet türlerinin ayrıntıları için lütfen Hizmet Tescil belgesine bakın.",
      services:
        "Belgenin en üstteki kaynağında bulunan ve genellikle birden fazla ardışık kaynak tarafından paylaşılan bir veya daha fazla hizmet tanımının listesi. Bu, bilgilerin belge boyunca potansiyel olarak birçok kez kopyalanması veya tüketici bir müşterinin bilgiyi bulmak için tüm belge yapısını dolaşmasını gerektirmek yerine, bu paylaşılan hizmetlerin tek bir yerde bir araya toplanmasına olanak tanır. Hizmetin geçerli olduğu kaynak, yukarıda açıklandığı gibi hâlâ hizmet özelliğine sahip olmalıdır; burada hizmet kaynakları en azından id ve type veya @id ve @type özelliklerine sahiptir. Bu, müşterinin hizmetin söz konusu kaynak için geçerli olduğunu bilmesini sağlar. Hizmet mülkünün kullanımı yayıncılık sisteminin takdirindedir.",
      seeAlso:
        "seeAlso özelliğine sahip geçerli kaynakla ilişkili XML veya RDF açıklaması gibi makine tarafından okunabilen bir kaynak. Kaynağın özellikleri, müşterinin birden fazla açıklama arasında seçim yapmasına (eğer sağlanmışsa) ve belgeyi uygun şekilde kullanmasına yardımcı olmak için verilmelidir. Kaynak ile belge arasındaki ilişkinin daha spesifik olması gerekiyorsa belgenin IIIF kaynağı yerine bu ilişkiyi içermesi gerekir. Diğer IIIF kaynakları da seeAlso için geçerli hedeflerdir; örneğin ilgili bir nesneyi tanımlayan bir Manifest'e bağlantı vermek için. Belgenin URI'su, verilerin belirli bir formattaki tek bir temsilini tanımlamalıdır. Örneğin, JSON ve XML'da aynı veriler mevcutsa, her gösterim için farklı kimlik ve format özelliklerine sahip ayrı kaynaklar eklenmelidir.",
      partOf:
        "partOf özelliğine sahip kaynağı içeren kapsayıcı bir kaynak. Bir istemci partOf özelliğiyle karşılaştığında, kapsanan kaynağın işlenmesine katkıda bulunmak amacıyla, geçerli gösterime katıştırılmamışsa, başvurulan içeren kaynağı alabilir. Örneğin, bir Canvas'taki partOf özelliği, daha fazla ilgili bilginin keşfedilmesini sağlamak amacıyla harici bir Manifest'e referans vermek için kullanılabilir. Benzer şekilde, bir Manifest, gezinmeye yardımcı olmak için partOf kullanarak içeren bir Koleksiyona referans verebilir.",
      start:
        "İstemcinin start özelliğine sahip kaynak için başlatma sırasında göstermesi gereken bir Kanvas veya Kanvas'ın bir kısmı. Bir Kanvasın bir kısmına yapılan referans, Ranges'in Kanvasların bir kısmına referans vermesiyle aynı şekilde ele alınır. Bu özellik, kullanıcının onu bulmak için manuel olarak gezinmesini gerektirmek yerine, istemcinin ilginç içerik içeren ilk Canvas ile başlamasına olanak tanır.",
      supplementary:
        "Bu Aralıktan, Aralık için içerik kaynaklarının supplementing Ek Açıklamalarını içeren Ek Açıklama Koleksiyonuna bağlantı. İstemciler bunu, Range ile etkileşimde bulunurken kullanıcıya farklı bir Canvas'tan ek içerik sunmak veya aynı Canvas içinde Range'in bir sonraki bölümüne atlamak için kullanabilir. Örneğin Aralık, sıralı olmayan sayfalara yayılan bir gazete makalesini temsil edebilir ve ardından, gazete sayfası başına Ek Açıklama Sayfalarına bölünmüş, metni kaydeden Ek Açıklamalardan oluşan bir Ek Açıklama Koleksiyonuna başvuruda bulunmak için ek özelliği kullanabilir. Alternatif olarak Aralık, üzerinde henüz çalışılmamış başka bölümler olduğunda, bir el yazmasının yazıya dökülmüş veya çevrilmiş bölümlerini temsil edebilir. Ek Açıklama Koleksiyonu, sırasıyla yazıya aktaran veya tercüme eden Ek Açıklamalar olacaktır.",
    },
    structural: {
      items:
        "IIIF Sunum API'sinin işlevselliğinin çoğu, bir ana Koleksiyon içindeki Koleksiyonlar veya Manifest'ler veya bir Manifest içindeki Kanvaslar gibi, bir ana kaynak içinde alt kaynakların oluşma sırasını kaydetmektir. Bu durumların tümü tek bir mülk, eşya kapsamındadır.",
      structures:
        'Manifest olarak temsil edilen bir nesnenin yapısı, Aralıklar hiyerarşisi kullanılarak tanımlanabilir. Aralıklar, Manifest\'in items özelliği tarafından verilen sıranın ötesinde kullanıcının etkileşimde bulunabileceği nesnenin veya diğer yapıların "içindekiler tablosunu" tanımlamak için kullanılabilir. Hiyerarşi, alt Range kaynaklarının daha yüksek seviyedeki Range öğeleri dizisine yerleştirilmesiyle oluşturulur. Bu hiyerarşilerin en üst düzey aralıkları yapılar özelliğinde verilmiştir.',
      annotations:
        "İçeriği bir Kanvas'a boyamak için kullanılan Ek Açıklamalardan ayrı olarak, bu kaynakla ilgili yorumları veya diğer Ek Açıklamaları içeren Ek Açıklama Sayfalarının sıralı listesi. Ek Açıklamaların motivasyonu painting olmamalıdır ve Ek Açıklamaların hedefi bu kaynağı veya bir kısmını içermelidir.",
    },
    attribution:
      "Telif hakkı © 2012-2023 Editörler ve katkıda bulunanlar. IIIF Konsorsiyumu tarafından CC-BY lisansı altında yayınlanmıştır, sorumluluk reddi beyanına bakın.",
  },
  behavior: {
    groups: {
      autoAdvance: "Otomatik ilerleme",
      repeat: "Tekrarlamak",
      manifestOrdering: "Bildirim sıralaması",
      canvasOrdering: "Kanvas siparişi",
      collection: "Koleksiyon",
      range: "Aralık",
      collectionOrdering: "Koleksiyon siparişi",
      rangeOrdering: "Aralık sıralaması",
      hidden: "Görünürlük",
    },
    values: {
      "auto-advance": "Otomatik ilerleme",
      "no-auto-advance": "Otomatik ilerleme yok",
      repeat: "Tekrarlamak",
      "no-repeat": "Tekrar yok",
      unordered: "sırasız",
      individuals: "Bireysel tuvaller",
      continuous: "Sürekli",
      paged: "Sayfalanmış",
      "facing-pages": "Karşılıklı sayfalar",
      "non-paged": "Disk belleği olmayan",
      "multi-part": "Çok parçalı",
      together: "Birlikte",
      sequence: "Sekans",
      "thumbnail-nav": "Küçük resimde gezinme",
      "no-nav": "Navigasyon yok",
      hidden: "Gizlenmiş",
    },
  },
  rights: {
    attributionNonCommercialNoDerivs: {
      label: "Atıf-Ticari Olmayan-Derivs Yok",
      description:
        "Bu lisans, altı ana lisansımız arasında en kısıtlayıcı olanıdır; yalnızca başkalarının, size atıfta bulundukları sürece çalışmalarınızı indirmelerine ve başkalarıyla paylaşmalarına izin verir, ancak bunları hiçbir şekilde değiştiremez veya ticari olarak kullanamazlar.",
    },
    attributionNonCommercialShareAlike: {
      label: "Atıf-GayriTicari-AlikePaylaş",
      description:
        "Bu lisans, size kredi verdikleri ve yeni yaratımlarını aynı koşullar altında lisansladıkları sürece, başkalarının çalışmanızı ticari olmayan bir şekilde yeniden düzenlemesine, uyarlamasına ve geliştirmesine olanak tanır.",
    },
    attributionNonCommercial: {
      label: "Atıf-Ticari Olmayan",
      description:
        "Bu lisans, başkalarının çalışmanızı ticari olmayan bir şekilde yeniden düzenlemesine, uyarlamasına ve geliştirmesine olanak tanır ve her ne kadar yeni çalışmalarının da sizi tanıması ve ticari olmaması gerekse de, türetilmiş çalışmalarını aynı şartlarla lisanslamak zorunda değildirler.",
    },
    attributionNoDerivs: {
      label: "Atıf-Türetilmemiş",
      description:
        "Bu lisans, başkalarının çalışmayı ticari amaçlar da dahil olmak üzere herhangi bir amaç için yeniden kullanmasına olanak tanır; ancak uyarlanmış biçimde başkalarıyla paylaşılamaz ve size kredi sağlanması gerekir.",
    },
    attributionShareAlike: {
      label: "Atıf-AynıPaylaş",
      description:
        "Bu lisans, sizi kredilendirdikleri ve yeni yaratımlarını aynı koşullar altında lisansladıkları sürece, başkalarının çalışmanızı ticari amaçlarla bile yeniden düzenlemesine, uyarlamasına ve geliştirmesine olanak tanır. Bu lisans genellikle “copyleft” özgür ve açık kaynaklı yazılım lisanslarıyla karşılaştırılır. Sizin çalışmalarınıza dayanan tüm yeni çalışmalar aynı lisansı taşıyacak, dolayısıyla türevler de ticari kullanıma izin verecektir. Bu, Vikipedi tarafından kullanılan lisanstır ve Vikipedi'den ve benzer lisanslı projelerden içerik eklenmesinden yararlanacak materyaller için önerilir.",
    },
    attribution: {
      label: "İlişkilendirme",
      description:
        "Bu lisans, orijinal eser için size kredi verdikleri sürece, başkalarının çalışmanızı ticari olarak bile dağıtmasına, yeniden düzenlemesine, uyarlamasına ve geliştirmesine olanak tanır. Bu, sunulan lisanslar arasında en uygun olanıdır. Lisanslı materyallerin maksimum düzeyde yayılması ve kullanılması için önerilir.",
    },
    publicDomain: {
      label: "Kamu Alanı",
      description:
        "Bu senetle bir eseri ilişkilendiren kişi, kanunların izin verdiği ölçüde, ilgili ve komşu haklar da dahil olmak üzere dünya çapında telif hakkı kanunları kapsamında eser üzerindeki tüm haklarından feragat ederek eseri kamu malına tahsis etmiştir.",
    },
  },
  sizes: {
    landscape: "12×8 · Manzara",
    wide: "12 × 6 · Geniş",
    square: "12×12 · Kare",
    portrait: "8 × 12 · Portre",
  },
} as const;
