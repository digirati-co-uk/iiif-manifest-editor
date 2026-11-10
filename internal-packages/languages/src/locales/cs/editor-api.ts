/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  resources: {
    collection: "Sbírka",
    manifest: "Manifest",
    canvas: "Plátno",
    annotation: "Anotace",
    annotationPage: "Stránka s poznámkami",
    range: "Rozsah",
    annotationCollection: "Sbírka anotací",
    contentResource: "Zdroj obsahu",
    agent: "Činidlo",
  },
  layout: {
    pair: "Bok po boku",
    triptych: "Tři sloupce",
    featureLeft: "Funkce vlevo",
    featureAbove: "Funkce výše",
    fourImages: "Čtyři obrázky",
    sixImages: "Šest obrázků",
    heroInset: "Hrdina + vložka",
    offsetPair: "Offsetový pár",
    cascade: "Kaskáda",
    stacked: "Skládaný",
    scatter: "Rozptyl",
    galleryWall: "Stěna galerie",
    blank: "Prázdné plátno",
  },
  fields: {
    label: "Popisek",
    metadata: "Metadata",
    summary: "Souhrn",
    requiredStatement: "Povinné prohlášení",
    rights: "Práva",
    provider: "Poskytovatel",
    thumbnail: "Náhled",
    navDate: "Datum navigace",
    placeholderCanvas: "Zástupné plátno",
    accompanyingCanvas: "Doprovodné plátno",
    language: "Jazyk",
    id: "Identifikátor",
    type: "Typ",
    format: "Formát",
    profile: "Profil",
    height: "Výška",
    width: "Šířka",
    duration: "Trvání",
    viewingDirection: "Směr pohledu",
    behavior: "Chování",
    timeMode: "Časový režim",
    motivation: "Motivace",
    homepage: "domovská stránka",
    logo: "Logo",
    rendering: "Alternativní zastoupení",
    service: "Servis",
    services: "Služby",
    seeAlso: "Související popis",
    partOf: "Část",
    start: "Počáteční plátno",
    supplementary: "Doplňkový obsah",
    items: "Položky",
    structures: "Struktury",
    annotations: "Anotace",
    target: "Cíl",
    body: "Tělo",
    navPlace: "Umístění navigace",
    textGranularity: "Zrnitost textu",
    value: "Hodnota",
  },
  documentation: {
    definedTypes: {
      Collection:
        "Seřazený seznam Manifestů a/nebo dalších Sbírek. Kolekce umožňují seskupování manifestů a podřízených kolekcí do hierarchické struktury za účelem prezentace, což může být pro generování navigace, zobrazování dynamických výsledků z vyhledávání nebo poskytování pevných sad souvisejících zdrojů pro jakýkoli jiný účel.",
      Manifest:
        "Popis struktury a vlastností složeného objektu. Nese informace potřebné pro klienta k prezentaci obsahu uživateli, jako je název a další popisné informace o předmětu nebo duševním díle, které zprostředkovává. Každý Manifest obvykle popisuje, jak prezentovat jeden složený objekt, jako je kniha, socha nebo hudební album.",
      Canvas:
        "Virtuální kontejner, který představuje konkrétní pohled na objekt a má k němu přidružené prostředky obsahu nebo k jeho částem. Plátno poskytuje referenční rámec pro rozvržení obsahu, a to jak prostorově, tak časově. Koncept plátna je vypůjčen ze standardů jako PDF a HTML nebo aplikací jako Photoshop a PowerPoint, kde na původně prázdnou zobrazovací plochu jsou obrázky, video, text a další obsah „namalovaný“ pomocí poznámek, shromážděných na stránkách s poznámkami.",
      Range:
        "Seřazený seznam pláten a/nebo dalších rozsahů. Rozsahy umožňují, aby plátna nebo jejich části byly nějakým způsobem seskupeny. Může to být z důvodů založených na obsahu, které mohou být popsány v obsahu nebo v sadě scén ve hře. Stejně tak mohou být důležité fyzické prvky, jako je shromažďování stránek v rané knize nebo když je nahraná hudba rozdělena na různé fyzické nosiče, jako jsou dvě CD.",
      AnnotationPage:
        "Seřazený seznam anotací, který je obvykle spojen s plátnem, ale lze na něj odkazovat i z jiných typů zdrojů. Stránky anotací shromažďují a objednávají seznamy anotací, které zase poskytují komentář ke zdroji nebo obsahu, který je součástí plátna.",
      Annotation:
        "Anotace spojují zdroje obsahu s plátnami. Pro viditelné a/nebo slyšitelné zdroje se používá stejný mechanismus, jaký se používá pro přepisy, komentáře, štítky a další obsah. To poskytuje jedinou, jednotnou metodu pro zarovnání informací a poskytuje rámec založený na standardech pro rozlišení částí zdrojů a částí Canvas. Protože lze poznámky přidat později, podporuje distribuovaný systém, ve kterém mohou vydavatelé sladit svůj obsah s popisy vytvořenými ostatními. Funkce související s poznámkami se mohou také spoléhat na další třídy, jako jsou SpecificResource, Choice nebo Selectors.",
      ContentResource:
        "Webové zdroje, jako jsou obrázky, zvuk, video nebo text, které jsou spojeny s plátnem prostřednictvím anotace nebo poskytují reprezentaci jakéhokoli zdroje.",
      AnnotationCollection:
        "Seřazený seznam stránek s poznámkami. Kolekce anotací umožňují zaznamenat seskupení anotací vyšší úrovně. Například všechny anglické překladové anotace středověkého francouzského dokumentu mohou být uchovávány odděleně od přepisu nebo vydání v moderní francouzštině nebo může být režisérův komentář k filmu oddělen od scénáře.",
    },
    descriptive: {
      label:
        "Lidsky čitelný štítek, jméno nebo titul. Vlastnost label je určena k zobrazení jako krátká textová náhrada za zdroj, pokud člověk potřebuje rozlišit mezi ním a podobnými zdroji, například mezi objekty, stránkami nebo možnostmi výběru obrázků, které se mají zobrazit. Vlastnost label může být plně internacionalizována a každý jazyk může mít více hodnot.",
      metadata:
        "Seřazený seznam popisů, které se mají zobrazit uživateli při interakci se zdrojem, daný jako dvojice pro člověka čitelných štítků a hodnot. Obsah těchto záznamů je určen pouze pro prezentaci; popisná sémantika by neměla být vyvozována. Záznam lze použít k předání informací o vytvoření objektu, fyzického popisu, informací o vlastnictví nebo k jiným účelům.",
      summary:
        "Krátké textové shrnutí určené k předání uživateli, když se nezobrazují položky metadat pro zdroj. To lze použít jako stručný popis pro výsledky vyhledávání na úrovni položky, pro prostředí s malou obrazovkou nebo jako alternativní uživatelské rozhraní, když se vlastnost metadat aktuálně nevykresluje. Vlastnost souhrn má stejný vzor jako vlastnost label popsaná výše.",
      requiredStatement:
        "Text, který se musí zobrazit při zobrazení nebo použití prostředku. Vlastnost requiredStatement lze například použít k prezentaci prohlášení o autorských právech nebo vlastnictví, potvrzení vlastníka a/nebo vydavatelské instituce nebo jakéhokoli jiného textu, který vydavatelská organizace považuje za kritický pro zobrazení uživateli. Vzhledem k velké rozmanitosti potenciálních uživatelských rozhraní klienta nebude vždy možné zobrazit toto prohlášení uživateli v počátečním stavu klienta. Pokud je zpočátku skrytý, musí klienti způsob jeho odhalení co nejvíce zřejmý.",
      rights:
        "Řetězec, který identifikuje prohlášení o licenci nebo právech, které se vztahuje na obsah zdroje, jako je JSON manifestu nebo pixely obrázku. Hodnota musí být získána ze sady URI licencí Creative Commons, URI prohlášení o právech RightsStatements.org nebo těch, které byly přidány prostřednictvím mechanismu rozšíření. Zahrnutí této vlastnosti je informativní a lze ji například použít k zobrazení ikony představující uplatnění práv.",
      provider:
        "Organizace nebo osoba, která přispěla k poskytování obsahu zdroje. Klienti pak mohou tyto informace zobrazit uživateli, aby uznali příspěvky poskytovatele. To se liší od vlastnosti requiredStatement v tom, že data jsou strukturovaná, což klientovi umožňuje dělat více než jen prezentovat text, ale místo toho má bohatší informace o lidech a organizacích, které lze použít v různých rozhraních.",
      thumbnail:
        "Zdroj obsahu, jako je malý obrázek nebo krátký zvukový klip, který představuje zdroj, který má vlastnost miniatury. Zdroj může mít více zdrojů miniatur, které mají stejný nebo odlišný typ a formát.",
      navDate:
        "Datum, které mohou klienti použít pro účely navigace při prezentaci zdroje uživateli v uživatelském rozhraní založeném na datu, jako je kalendář nebo časová osa. Do vlastnosti metadat pro lidskou spotřebu by měla být zahrnuta popisnější časová období určená k přímému zobrazení uživateli. Pokud zdroj obsahuje plátna, která mají vlastnost trvání, dané datum a čas odpovídá navigačnímu datu a času začátku zdroje. Například rozsah, který zahrnuje plátno, které představuje sadu video obsahu zaznamenávajícího historickou událost, navDate je datum a čas prvního okamžiku zaznamenané události.",
      placeholderCanvas:
        "Jedno plátno, které poskytuje dodatečný obsah k použití před vykreslením hlavního obsahu zdroje, který má vlastnost placeholderCanvas, nebo jako reklama či záskok pro tento obsah. Příklady zahrnují obrázky, text a zvuk, které zastupují videoobsah předtím, než uživatel spustí přehrávání; nebo filmový plakát k upoutání pozornosti uživatele. Obsah poskytovaný placeholderCanvas se liší od miniatury: klient může použít miniaturu k shrnutí a procházení více zdrojů a poté zobrazit obsah ze placeholderCanvas jako součást úvodní prezentace jednoho zdroje. Zástupný symbol Canvas bude mít pravděpodobně jiné rozměry, než jsou rozměry Canvas zdroje, který má vlastnost placeholderCanvas.",
      accompanyingCanvas:
        "Jediné plátno, které poskytuje další obsah pro použití při vykreslování zdroje, který má vlastnost accompanyingCanvas. Příklady zahrnují obrázek, který se zobrazí, když plátno s pouze dobou trvání přehrává zvuk; nebo zvuk na pozadí, který se přehraje, když uživatel prochází manifestem obsahujícím pouze obrázky.",
      language:
        "Jazyk nebo jazyky použité v obsahu tohoto externího zdroje. Tato vlastnost je již dostupná z modelu Webové poznámky pro zdroje obsahu, které jsou tělem nebo cílem anotace, lze ji však použít také pro zdroje odkazované z domovské stránky, vykreslování a partOf.",
    },
    technical: {
      id: "URI, který identifikuje zdroj. Pokud je zdroj dostupný pouze vložený do jiného zdroje, jako je rozsah v rámci manifestu, pak URI může být URI vloženého zdroje s jedinečným fragmentem na konci. To neplatí pro Canvases, které musí mít vlastní URI bez fragmentu.",
      type: "Typ nebo třída zdroje. Pro třídy definované pro tuto specifikaci",
      format:
        "Specifický typ média (často nazývaný typ MIME) pro zdroj obsahu, například obrázek/jpeg. To je důležité pro rozlišení různých formátů stejného celkového typu zdroje, jako je rozlišení textu v XML od prostého textu.",
      profile:
        "Schéma nebo pojmenovaná sada funkcí dostupných ze zdroje. Profil může dále objasnit typ a/nebo formát externího zdroje nebo služby, což klientům umožňuje přizpůsobit jejich manipulaci se zdrojem, který má vlastnost profilu.",
      height:
        "Výška plátna nebo zdroje externího obsahu. U zdrojů obsahu je hodnota v pixelech. U Canvas hodnota nemá jednotku. V kombinaci s šířkou zprostředkovává poměr stran pro prostor, ve kterém jsou umístěny zdroje obsahu.",
      width:
        "Šířka plátna nebo zdroje externího obsahu. U zdrojů obsahu je hodnota v pixelech. U Canvas hodnota nemá jednotku. V kombinaci s výškou zprostředkovává poměr stran pro prostor, ve kterém jsou umístěny zdroje obsahu.",
      duration: "Trvání zdroje Canvas nebo externího obsahu v sekundách.",
      viewingDirection:
        "Směr, ve kterém se má uživateli zobrazit sada pláten. Tato specifikace definuje čtyři hodnoty směru v tabulce níže. Jiné mohou být definovány externě jako rozšíření.",
      behavior:
        "Sada funkcí uživatelského dojmu, které by vydavatel obsahu preferoval, aby klient při prezentaci zdroje použil. Tato specifikace definuje hodnoty v tabulce níže. Jiné mohou být definovány externě jako rozšíření.",
      timeMode:
        "Režim spojený s anotací, který má být aplikován na vykreslování jakéhokoli časově založeného média, nebo jinak by mohl být považován za režim s trváním, použitý jako hlavní zdroj této anotace. Všimněte si, že spojení timeMode s anotací znamená, že různé zdroje v těle nemohou mít různé hodnoty. Tato specifikace definuje hodnoty specifikované v tabulce níže. Jiné mohou být definovány externě jako rozšíření.",
      motivation:
        "Tato specifikace definuje dvě hodnoty pro vlastnost Webová anotace motivace nebo účelu při použití na konkrétním zdroji nebo Textual Body. Zdroje spojené s plátnem anotací, která má motivační hodnotu „painting“, musí být uživateli prezentovány jako reprezentace plátna. Zdroje spojené s plátnem pomocí anotace, která má motivační hodnotu supplementing, mohou být uživateli prezentovány jako součást reprezentace plátna, nebo mohou být prezentovány v jiné části uživatelského rozhraní.",
    },
    linking: {
      homepage:
        "Webová stránka, která se týká objektu reprezentovaného zdrojem, který má vlastnost homepage. Webovou stránku obvykle publikuje organizace odpovědná za objekt a může být vytvořena systémem pro správu obsahu nebo jiným katalogizačním systémem. Zdroj musí být možné zobrazit přímo uživateli. Zdroje, které souvisejí, ale nikoli s domovskými stránkami, musí být místo toho přidány do vlastnosti metadat s příslušným štítkem nebo hodnotou pro popis vztahu.",
      logo: "Malý obrazový prostředek, který představuje prostředek agenta, ke kterému je přidružen. Logo musí být při zobrazení nebo použití zdroje jasně vykresleno, bez oříznutí, otočení nebo jiného zkreslení obrázku. Doporučuje se, aby byla pro tento obrázek k dispozici služba API IIIF pro další manipulace, jako je změna velikosti.",
      rendering:
        "Zdroj, který je alternativní reprezentací jiného než IIIF zdroje, který má vlastnost vykreslování. Takové reprezentace obvykle nelze nakreslit na jediné plátno, protože buď obsahují příliš mnoho pohledů, mají nekompatibilní rozměry nebo jsou složenými zdroji vyžadujícími další funkce vykreslování. Prostředek vykreslování musí být možné zobrazit přímo lidskému uživateli, ačkoli prezentace může být mimo klienta IIIF. Zdroj nesmí mít úvodní stránku nebo jiný vsunutý zdroj, který k němu zprostředkovává přístup. Pokud je vyžadováno řízení přístupu, pak se doporučuje rozhraní API IIIF Authentication. Mezi příklady patří vykreslení knihy jako PDF nebo EPUB, skluzavka s obrázky budovy nebo 3D model sochy.",
      service:
        "Služba, se kterou může klient přímo interagovat a získat další informace nebo funkce pro použití prostředku, který má vlastnost služby, například z obrázku na základní URI přidružené služby API obrázku IIIF. Prostředek služby by měl mít přidružené další informace, aby klient mohl určit, jak jej vhodně využít. Podrobnosti o aktuálně známých typech služeb naleznete v dokumentu Registr služeb.",
      services:
        "Seznam jedné nebo více definic služeb na nejvyšším zdroji dokumentu, které jsou obvykle sdíleny více než jedním následným zdrojem. To umožňuje, aby tyto sdílené služby byly shromažďovány společně na jednom místě, namísto toho, aby byly jejich informace potenciálně mnohokrát duplikovány v dokumentu nebo aby uživatel musel procházet celou strukturu dokumentu, aby informace našel. Prostředek, na který se služba vztahuje, musí mít stále vlastnost služby, jak je popsáno výše, kde prostředky služby mají alespoň vlastnosti id a typ nebo @id a @type. To umožňuje klientovi vědět, že se služba vztahuje na tento zdroj. Použití majetku služeb je na uvážení publikačního systému.",
      seeAlso:
        "Strojově čitelný zdroj, jako je popis XML nebo RDF, který souvisí s aktuálním zdrojem, který má vlastnost seeAlso. Vlastnosti zdroje by měly být poskytnuty, aby pomohly klientovi vybrat si mezi více popisy (pokud jsou k dispozici) a aby mohly dokument vhodně používat. Pokud musí být vztah mezi zdrojem a dokumentem konkrétnější, pak by měl dokument obsahovat tento vztah spíše než zdroj IIIF. Jiné zdroje IIIF jsou také platnými cíli pro seeAlso, například pro odkaz na manifest, který popisuje související objekt. URI dokumentu musí identifikovat jedinou reprezentaci dat v určitém formátu. Pokud například stejná data existují v JSON a XML, měly by být pro každou reprezentaci přidány samostatné zdroje s odlišnými vlastnostmi id a format.",
      partOf:
        "Obsahující prostředek, který zahrnuje prostředek, který má vlastnost partOf. Když klient narazí na vlastnost partOf, může načíst odkazovaný obsahující zdroj, pokud není vložen do aktuální reprezentace, aby přispěl ke zpracování obsaženého zdroje. Například vlastnost partOf na plátně lze použít k odkazování na externí manifest, aby bylo možné zjistit další relevantní informace. Podobně může Manifest odkazovat na obsahující kolekci pomocí partOf pro usnadnění navigace.",
      start:
        "Plátno nebo část plátna, které by měl klient zobrazit při inicializaci pro prostředek, který má vlastnost start. Odkaz na část plátna je zpracován stejným způsobem jako referenční části plátna Ranges. Tato vlastnost umožňuje klientovi začít s prvním plátnem, které obsahuje zajímavý obsah, namísto toho, aby uživatel musel ručně navigovat, aby jej našel.",
      supplementary:
        "Odkaz z tohoto rozsahu na sbírku anotací, která obsahuje anotace supplementing zdrojů obsahu pro rozsah. Klienti to mohou využít k prezentaci dalšího obsahu uživateli z jiného plátna při interakci s rozsahem nebo k přechodu na další část rozsahu v rámci stejného plátna. Rozsah může například představovat novinový článek, který zahrnuje stránky, které nejsou sekvenční, a poté použije doplňkovou vlastnost k odkazu na kolekci anotací, která se skládá z anotací, které zaznamenávají text, rozdělených na strany anotací na novinovou stránku. Alternativně může rozsah představovat části rukopisu, které byly přepsány nebo přeloženy, pokud existují další části, na kterých se musí ještě pracovat. Sbírka anotací by byly anotace, které přepisují nebo překládají.",
    },
    structural: {
      items:
        "Velká část funkcí rozhraní IIIF Presentation API jednoduše zaznamenává pořadí, ve kterém se podřízené zdroje vyskytují v rámci nadřazeného zdroje, jako jsou kolekce nebo manifesty v rámci nadřazené kolekce nebo plátna v rámci manifestu. Všechny tyto situace jsou pokryty jedinou vlastností, položkami.",
      structures:
        "Strukturu objektu reprezentovaného jako Manifest lze popsat pomocí hierarchie rozsahů. Rozsahy lze použít k popisu „obsahu“ objektu nebo jiných struktur, s nimiž může uživatel interagovat mimo pořadí dané vlastnostmi položky Manifestu. Hierarchie je vytvořena vnořením podřízených zdrojů rozsahu do pole položek rozsahu vyšší úrovně. Nejvyšší úroveň Rozsahy těchto hierarchií jsou uvedeny ve vlastnosti struktur.",
      annotations:
        "Seřazený seznam stránek s poznámkami, které obsahují komentáře nebo jiné poznámky k tomuto zdroji, oddělené od anotací, které se používají k malování obsahu na plátno. Motivace anotací nesmí být painting a cíl anotací musí obsahovat tento zdroj nebo jeho část.",
    },
    attribution:
      "Copyright © 2012-2023 Redaktoři a přispěvatelé. Vydáno konsorciem IIIF pod licencí CC-BY, viz prohlášení o vyloučení odpovědnosti.",
  },
  behavior: {
    groups: {
      autoAdvance: "Automatický posun",
      repeat: "Opakovat",
      manifestOrdering: "Manifestní objednávka",
      canvasOrdering: "Objednávka plátna",
      collection: "Sbírka",
      range: "Rozsah",
      collectionOrdering: "Objednávka sbírky",
      rangeOrdering: "Řazení rozsahu",
      hidden: "Viditelnost",
    },
    values: {
      "auto-advance": "Automatický posun",
      "no-auto-advance": "Žádný automatický posun",
      repeat: "Opakovat",
      "no-repeat": "Žádné opakování",
      unordered: "Neuspořádané",
      individuals: "Jednotlivá plátna",
      continuous: "Kontinuální",
      paged: "Stránkovaný",
      "facing-pages": "Protilehlé stránky",
      "non-paged": "Nestránkované",
      "multi-part": "Vícedílné",
      together: "Spolu",
      sequence: "Sekvence",
      "thumbnail-nav": "Navigace v náhledech",
      "no-nav": "Žádná navigace",
      hidden: "Skrytý",
    },
  },
  rights: {
    attributionNonCommercialNoDerivs: {
      label: "Attribution-Nekomerční-NoDerivs",
      description:
        "Tato licence je nejvíce omezující z našich šesti hlavních licencí a umožňuje ostatním pouze stahovat vaše díla a sdílet je s ostatními, pokud vás uvedou, ale nemohou je žádným způsobem měnit ani je komerčně používat.",
    },
    attributionNonCommercialShareAlike: {
      label: "Attribution-NonCommercial-ShareAlike",
      description:
        "Tato licence umožňuje ostatním remixovat, přizpůsobovat a stavět na vašem díle nekomerčně, pokud vám připisují uznání a licencují své nové výtvory za stejných podmínek.",
    },
    attributionNonCommercial: {
      label: "Uvedení zdroje – nekomerční",
      description:
        "Tato licence umožňuje ostatním remixovat, přizpůsobovat a stavět na vašem díle nekomerčně, a přestože jejich nová díla vás také musí uznávat a být nekomerční, nemusejí licencovat svá odvozená díla za stejných podmínek.",
    },
    attributionNoDerivs: {
      label: "Atribuce-NoDerivs",
      description:
        "Tato licence umožňuje ostatním znovu používat dílo pro jakýkoli účel, včetně komerčního; nelze je však v upravené podobě sdílet s ostatními a musí vám být poskytnut kredit.",
    },
    attributionShareAlike: {
      label: "Attribution-ShareAlike",
      description:
        "Tato licence umožňuje ostatním remixovat, přizpůsobovat a stavět na vaší práci i pro komerční účely, pokud vás uvedou a licencují své nové výtvory za stejných podmínek. Tato licence je často přirovnávána k „copyleftovým“ licencím svobodného a open source softwaru. Všechna nová díla založená na vašich dílech ponesou stejnou licenci, takže jakékoli odvozeniny také umožní komerční použití. Toto je licence používaná Wikipedií a je doporučena pro materiály, kterým by prospělo začlenění obsahu z Wikipedie a podobně licencovaných projektů.",
    },
    attribution: {
      label: "Atribuce",
      description:
        "Tato licence umožňuje ostatním distribuovat, remixovat, přizpůsobovat a stavět na vaší práci, a to i komerčně, pokud vám připisují zásluhy za původní tvorbu. Jedná se o nejvstřícnější z nabízených licencí. Doporučeno pro maximální šíření a použití licencovaných materiálů.",
    },
    publicDomain: {
      label: "Veřejná doména",
      description:
        "Osoba, která spojila dílo s tímto počinem, věnovala dílo volnému dílu tím, že se vzdala všech svých práv k dílu na celém světě podle autorského zákona, včetně všech souvisejících a souvisejících práv, v rozsahu povoleném zákonem.",
    },
  },
  sizes: {
    landscape: "12 × 8 · Krajina",
    wide: "12 × 6 · Široký",
    square: "12 × 12 · Čtverec",
    portrait: "8 × 12 · Portrét",
  },
} as const;
