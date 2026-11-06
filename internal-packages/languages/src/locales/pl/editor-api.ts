/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  resources: {
    collection: "Kolekcja",
    manifest: "Manifest",
    canvas: "Kanwa",
    annotation: "Adnotacja",
    annotationPage: "Strona z adnotacjami",
    range: "Zakres",
    annotationCollection: "Zbiór adnotacji",
    contentResource: "Zasób treści",
    agent: "Agent",
  },
  layout: {
    pair: "Obok siebie",
    triptych: "Trzy kolumny",
    featureLeft: "Funkcja po lewej stronie",
    featureAbove: "Funkcja powyżej",
    fourImages: "Cztery obrazy",
    sixImages: "Sześć obrazów",
    heroInset: "Bohater + wstawka",
    offsetPair: "Para offsetowa",
    cascade: "Kaskada",
    stacked: "Ułożone w stos",
    scatter: "Rozpraszać",
    galleryWall: "Ściana galerii",
    blank: "Puste płótno",
  },
  fields: {
    label: "Etykieta",
    metadata: "Metadane",
    summary: "Podsumowanie",
    requiredStatement: "Wymagana informacja",
    rights: "Prawa",
    provider: "Dostawca",
    thumbnail: "Zwięzły",
    navDate: "Data nawigacji",
    placeholderCanvas: "Płótno zastępcze",
    accompanyingCanvas: "Dołączone płótno",
    language: "Język",
    id: "Identyfikator",
    type: "Typ",
    format: "Format",
    profile: "Profil",
    height: "Wysokość",
    width: "Szerokość",
    duration: "Czas trwania",
    viewingDirection: "Kierunek patrzenia",
    behavior: "Zachowanie",
    timeMode: "Tryb czasu",
    motivation: "Motywacja",
    homepage: "Strona główna",
    logo: "Logo",
    rendering: "Alternatywna reprezentacja",
    service: "Praca",
    services: "Usługi",
    seeAlso: "Powiązany opis",
    partOf: "Część",
    start: "Początkowe płótno",
    supplementary: "Treść uzupełniająca",
    items: "Rzeczy",
    structures: "Struktury",
    annotations: "Adnotacje",
    target: "Cel",
    body: "Ciało",
    navPlace: "Lokalizacja nawigacji",
    textGranularity: "Szczegółowość tekstu",
    value: "Wartość",
  },
  documentation: {
    definedTypes: {
      Collection:
        "Uporządkowana lista Manifestów i/lub dalszych kolekcji. Kolekcje umożliwiają grupowanie manifestów i kolekcji podrzędnych w hierarchiczną strukturę na potrzeby prezentacji, która może służyć do generowania nawigacji, wyświetlania dynamicznych wyników wyszukiwania lub udostępniania ustalonych zestawów powiązanych zasobów do jakichkolwiek innych celów.",
      Manifest:
        "Opis struktury i właściwości obiektu złożonego. Zawiera informacje potrzebne klientowi do przedstawienia treści użytkownikowi, takie jak tytuł i inne informacje opisowe na temat obiektu lub dzieła intelektualnej, które przekazuje. Każdy Manifest zazwyczaj opisuje sposób zaprezentowania pojedynczego złożonego przedmiotu, takiego jak książka, posąg lub album muzyczny.",
      Canvas:
        "Wirtualny kontener reprezentujący określony widok obiektu i mający zasoby treści powiązane z nim lub z jego częściami. Canvas zapewnia układ odniesienia dla układu treści, zarówno przestrzennie, jak i czasowo. Koncepcja płótna została zapożyczona ze standardów takich jak PDF i HTML lub aplikacji takich jak Photoshop i PowerPoint, gdzie początkowo pusta powierzchnia wyświetlacza zawiera obrazy, wideo, tekst i inną treść „namalowaną” za pomocą adnotacji zebranych na stronach adnotacji.",
      Range:
        "Uporządkowana lista płócien i/lub dalszych zakresów. Zakresy umożliwiają grupowanie płócien lub ich części w jakiś sposób. Może to wynikać z powodów związanych z treścią, na przykład opisanych w spisie treści lub zestawie scen w sztuce. Podobnie ważne mogą być cechy fizyczne, takie jak gromadzenie stron we wczesnej książce lub gdy nagrana muzyka jest dzielona na różne nośniki fizyczne, takie jak dwie płyty CD.",
      AnnotationPage:
        "Uporządkowana lista adnotacji, która jest zwykle powiązana z kanwą, ale może odnosić się do niej również z innych typów zasobów. Strony adnotacji gromadzą i porządkują listy adnotacji, które z kolei zawierają komentarz na temat zasobu lub treści będącej częścią kanwy.",
      Annotation:
        "Adnotacje wiążą zasoby treści z kanwami. W przypadku zasobów widocznych i/lub słyszalnych stosuje się ten sam mechanizm, co w przypadku transkrypcji, komentarzy, tagów i innych treści. Zapewnia to pojedynczą, ujednoliconą metodę dopasowywania informacji i zapewnia opartą na standardach strukturę rozróżniania części zasobów i części Canvas. Ponieważ adnotacje można dodać później, promuje system rozproszony, w którym wydawcy mogą dopasowywać swoje treści do opisów utworzonych przez innych. Funkcjonalność związana z adnotacjami może również opierać się na dalszych klasach, takich jak SpecificResource, Choice lub Selectors.",
      ContentResource:
        "Zasoby internetowe, takie jak obrazy, pliki audio, wideo lub tekst, które są powiązane z kanwą za pośrednictwem adnotacji lub stanowią reprezentację dowolnego zasobu.",
      AnnotationCollection:
        "Uporządkowana lista stron adnotacji. Kolekcje adnotacji umożliwiają rejestrowanie grup adnotacji wyższego poziomu. Na przykład wszystkie adnotacje średniowiecznego francuskiego dokumentu z tłumaczeniem na język angielski można oddzielić od transkrypcji lub wydania we współczesnym języku francuskim, a komentarz reżysera do filmu można oddzielić od scenariusza.",
    },
    descriptive: {
      label:
        "Czytelna dla człowieka etykieta, nazwa lub tytuł. Właściwość label ma być wyświetlana jako krótki, tekstowy odpowiednik zasobu, jeśli użytkownik musi dokonać rozróżnienia między nim a podobnymi zasobami, na przykład obiektami, stronami lub opcjami wyboru obrazów do wyświetlenia. Właściwość label może być w pełni umiędzynarodowiona, a każdy język może mieć wiele wartości.",
      metadata:
        "Uporządkowana lista opisów wyświetlanych użytkownikowi podczas interakcji z zasobem, podana jako pary czytelnych dla człowieka etykiet i wpisów wartości. Treść tych wpisów ma charakter wyłącznie prezentacyjny; nie należy wnioskować o semantyce opisowej. Wpis może zostać wykorzystany do przekazania informacji o stworzeniu obiektu, opisu fizycznego, informacji o własności lub do innych celów.",
      summary:
        "Krótkie podsumowanie tekstowe, które ma zostać przekazane użytkownikowi, gdy wpisy metadanych dla zasobu nie są wyświetlane. Można go użyć jako krótkiego opisu wyników wyszukiwania na poziomie elementu, w środowiskach z małym ekranem lub jako alternatywny interfejs użytkownika, gdy właściwość metadanych nie jest obecnie renderowana. Właściwość podsumowania ma ten sam wzór, co właściwość label opisana powyżej.",
      requiredStatement:
        "Tekst, który musi być wyświetlany, gdy zasób jest wyświetlany lub używany. Na przykład właściwość requiredStatement może zostać użyta do przedstawienia oświadczeń o prawach autorskich lub własności, potwierdzenia właściciela i/lub instytucji wydawniczej lub dowolnego innego tekstu, który organizacja wydawnicza uzna za kluczowy do wyświetlenia użytkownikowi. Biorąc pod uwagę dużą różnorodność potencjalnych interfejsów użytkownika klienta, nie zawsze będzie możliwe wyświetlenie tej instrukcji użytkownikowi w stanie początkowym klienta. Jeśli początkowo były ukryte, klienci muszą uczynić sposób ich ujawnienia tak oczywistym, jak to tylko możliwe.",
      rights:
        "Ciąg znaków identyfikujący licencję lub oświadczenie o prawach odnoszące się do zawartości zasobu, na przykład JSON manifestu lub piksele obrazu. Wartość musi zostać pobrana z zestawu identyfikatorów URI licencji Creative Commons, identyfikatorów URI zestawienia praw RightsStatements.org lub dodanych poprzez mechanizm rozszerzenia. Włączenie tej właściwości ma charakter informacyjny i może zostać użyte na przykład do wyświetlenia ikony reprezentującej potwierdzenia praw.",
      provider:
        "Organizacja lub osoba, która przyczyniła się do udostępnienia zawartości zasobu. Klienci mogą następnie wyświetlić te informacje użytkownikowi, aby potwierdzić wkład dostawcy. Różni się to od właściwości requiredStatement tym, że dane są uporządkowane, co pozwala klientowi na coś więcej niż tylko prezentowanie tekstu, ale zamiast tego ma bogatsze informacje o osobach i organizacjach do wykorzystania w różnych interfejsach.",
      thumbnail:
        "Zasób treści, taki jak mały obraz lub krótki klip audio, który reprezentuje zasób posiadający właściwość miniatury. Zasób może mieć wiele zasobów miniatur tego samego lub innego typu i formatu.",
      navDate:
        "Data, której klienci mogą używać do celów nawigacji podczas prezentowania zasobu użytkownikowi w interfejsie użytkownika opartym na datach, takim jak kalendarz lub oś czasu. Bardziej opisowe zakresy dat, przeznaczone do wyświetlania bezpośrednio użytkownikowi, powinny zostać uwzględnione we właściwości metadanych przeznaczonych do spożycia przez ludzi. Jeśli zasób zawiera płótna posiadające właściwość Duration, podana data/godzina odpowiada godzinie nawigacji początku zasobu. Na przykład zakres obejmujący płótno reprezentujące zestaw treści wideo rejestrujących wydarzenie historyczne, navDate to data i godzina pierwszego momentu zarejestrowanego zdarzenia.",
      placeholderCanvas:
        "Pojedyncze płótno zawierające dodatkową treść do wykorzystania przed wyrenderowaniem głównej treści zasobu mającego właściwość placeholderCanvas lub jako reklama lub substytut tej treści. Przykładami mogą być obrazy, tekst i dźwięk zastępujące treść wideo, zanim użytkownik rozpocznie odtwarzanie; lub plakat filmowy, aby przyciągnąć uwagę użytkownika. Treść dostarczana przez placeholderCanvas różni się od miniatury: klient może użyć miniatury do podsumowania i poruszania się po wielu zasobach, a następnie wyświetlić zawartość placeholderCanvas jako część początkowej prezentacji pojedynczego zasobu. Symbol zastępczy Canvas będzie prawdopodobnie miał inne wymiary niż wymiary Canvas zasobu posiadającego właściwość placeholderCanvas.",
      accompanyingCanvas:
        "Pojedyncza kanwa zapewniająca dodatkową zawartość do wykorzystania podczas renderowania zasobu mającego właściwość accompanyingCanvas. Przykłady obejmują obraz wyświetlany podczas odtwarzania dźwięku przez Canvas; lub dźwięk w tle do odtwarzania, gdy użytkownik porusza się po pliku manifestu zawierającym wyłącznie obraz.",
      language:
        "Język lub języki używane w treści tego zasobu zewnętrznego. Ta właściwość jest już dostępna w modelu adnotacji internetowej dla zasobów treści będących treścią lub celem adnotacji, jednakże można jej również użyć w przypadku zasobów, do których odwołują się strona główna, renderowanie i partOf.",
    },
    technical: {
      id: "URI identyfikujący zasób. Jeśli zasób jest dostępny tylko osadzony w innym zasobie, np. w zakresie w manifeście, wówczas URI może być URI zasobu osadzającego z unikalnym fragmentem na końcu. Nie dotyczy to Canvasów, które muszą posiadać własne URI bez fragmentu.",
      type: "Typ lub klasa zasobu. Dla klas zdefiniowanych dla tej specyfikacji",
      format:
        "Określony typ multimediów (często nazywany typem MIME) dla zasobu treści, na przykład obraz/jpeg. Jest to ważne dla rozróżnienia różnych formatów tego samego ogólnego typu zasobu, na przykład dla odróżnienia tekstu w XML od zwykłego tekstu.",
      profile:
        "Schemat lub nazwany zestaw funkcji dostępnych z zasobu. Profil może dodatkowo wyjaśnić typ i/lub format zewnętrznego zasobu lub usługi, umożliwiając klientom dostosowanie sposobu postępowania z zasobem mającym właściwość profilu.",
      height:
        "Wysokość kanwy lub zasobu treści zewnętrznych. W przypadku zasobów treści wartość jest podana w pikselach. W przypadku płócien wartość nie ma jednostki. W połączeniu z szerokością przekazuje współczynnik proporcji przestrzeni, w której znajdują się zasoby treści.",
      width:
        "Szerokość kanwy lub zasobu treści zewnętrznych. W przypadku zasobów treści wartość jest podana w pikselach. W przypadku płócien wartość nie ma jednostki. W połączeniu z wysokością przekazuje współczynnik kształtu przestrzeni, w której znajdują się zasoby treści.",
      duration: "Czas trwania Canvas lub zasobu treści zewnętrznych, podany w sekundach.",
      viewingDirection:
        "Kierunek, w którym zestaw Canvas powinien być wyświetlany użytkownikowi. Ta specyfikacja definiuje cztery wartości kierunku w poniższej tabeli. Inne można zdefiniować zewnętrznie jako rozszerzenie.",
      behavior:
        "Zestaw funkcji zapewniających wygodę użytkownika, których wydawca treści chciałby, aby klient używał podczas prezentowania zasobu. Specyfikacja ta określa wartości podane w poniższej tabeli. Inne można zdefiniować zewnętrznie jako rozszerzenie.",
      timeMode:
        "Tryb powiązany z adnotacją, który ma być zastosowany do renderowania dowolnych mediów opartych na czasie lub w inny sposób może być uważany za mający czas trwania, używany jako zasób treści tej adnotacji. Należy pamiętać, że powiązanie timeMode z adnotacją oznacza, że ​​różne zasoby w treści nie mogą mieć różnych wartości. Niniejsza specyfikacja określa wartości określone w poniższej tabeli. Inne można zdefiniować zewnętrznie jako rozszerzenie.",
      motivation:
        "Ta specyfikacja definiuje dwie wartości właściwości Adnotacja internetowa dotycząca motywacji lub celu, gdy jest używana w odniesieniu do określonego zasobu lub Textual Body. Zasoby powiązane z Kanwą za pomocą Adnotacji, która ma wartość motywacyjną „painting”, muszą zostać przedstawione użytkownikowi jako reprezentacja Kanwy. Zasoby powiązane z Kanwą poprzez Adnotację posiadającą wartość motywacyjną supplementing mogą być prezentowane użytkownikowi w ramach reprezentacji Kanwy lub mogą być prezentowane w innej części interfejsu użytkownika.",
    },
    linking: {
      homepage:
        "Strona internetowa poświęcona obiektowi reprezentowanemu przez zasób posiadający właściwość homepage. Strona internetowa jest zwykle publikowana przez organizację odpowiedzialną za obiekt i może być generowana przez system zarządzania treścią lub inny system katalogowania. Zasób musi mieć możliwość wyświetlenia go bezpośrednio użytkownikowi. Zamiast tego do właściwości metadanych należy dodać powiązane zasoby, ale nie strony główne, z odpowiednią etykietą lub wartością opisującą relację.",
      logo: "Mały zasób obrazu reprezentujący zasób agenta, z którym jest powiązany. Logo musi być wyraźnie renderowane podczas wyświetlania lub używania zasobu, bez przycinania, obracania lub innego zniekształcania obrazu. Zaleca się, aby dla tego obrazu była dostępna usługa API obrazu IIIF w celu umożliwienia innych manipulacji, takich jak zmiana rozmiaru.",
      rendering:
        "Zasób będący alternatywną reprezentacją zasobu inną niż IIIF, która ma właściwość renderowania. Takich reprezentacji zazwyczaj nie można namalować na pojedynczym płótnie, ponieważ albo zawierają zbyt wiele widoków, mają niezgodne wymiary, albo stanowią złożone zasoby wymagające dodatkowej funkcjonalności renderowania. Zasób renderujący musi umożliwiać bezpośrednie wyświetlenie użytkownikowi, chociaż prezentacja może odbywać się poza klientem IIIF. Zasób nie może mieć strony powitalnej ani innego zasobu pełnoekranowego pośredniczącego w dostępie do niego. Jeśli wymagana jest kontrola dostępu, zalecany jest interfejs API uwierzytelniania IIIF. Przykłady obejmują renderowanie książki jako PDF lub EPUB, slajdy z obrazami budynku lub model 3D posągu.",
      service:
        "Usługa, z którą klient może bezpośrednio wchodzić w interakcję i uzyskiwać dodatkowe informacje lub funkcje w celu wykorzystania zasobu mającego właściwość usługi, na przykład z obrazu do podstawowego URI powiązanej usługi API obrazu IIIF. Z zasobem usługi powinny być powiązane dodatkowe informacje, aby umożliwić klientowi określenie, w jaki sposób właściwie go wykorzystać. Szczegółowe informacje na temat obecnie znanych typów usług można znaleźć w dokumencie Rejestru usług.",
      services:
        "Lista jednej lub większej liczby definicji usług w zasobie znajdującym się najwyżej w dokumencie, które są zazwyczaj współdzielone przez więcej niż jeden kolejny zasób. Pozwala to na zebranie tych wspólnych usług w jednym miejscu, zamiast potencjalnie wielokrotnie powielać ich informacje w całym dokumencie lub wymagać od klienta przeglądania całej struktury dokumentu w celu znalezienia informacji. Zasób, do którego odnosi się usługa, musi nadal mieć właściwość service, jak opisano powyżej, gdzie zasoby usługi mają co najmniej właściwości id i type lub @id i @type. Dzięki temu klient wie, że usługa dotyczy tego zasobu. Korzystanie z właściwości usług zależy od uznania systemu wydawniczego.",
      seeAlso:
        "Zasób czytelny maszynowo, taki jak opis XML lub RDF, który jest powiązany z bieżącym zasobem posiadającym właściwość seeAlso. Należy podać właściwości zasobu, aby pomóc klientowi wybrać pomiędzy wieloma opisami (jeśli zostały podane) i odpowiednio wykorzystać dokument. Jeśli relacja między zasobem a dokumentem musi być bardziej szczegółowa, dokument powinien zawierać tę relację, a nie zasób IIIF. Inne zasoby IIIF są również prawidłowymi celami dla seeAlso, na przykład w celu połączenia z Manifestem opisującym powiązany obiekt. URI dokumentu musi identyfikować pojedynczą reprezentację danych w określonym formacie. Na przykład, jeśli te same dane istnieją w JSON i XML, wówczas dla każdej reprezentacji należy dodać osobne zasoby, z odrębnymi właściwościami identyfikatora i formatu.",
      partOf:
        "Zasób zawierający, który zawiera zasób mający właściwość partOf. Gdy klient napotka właściwość partOf, może pobrać zasób zawierający odwołanie, jeśli nie jest on osadzony w bieżącej reprezentacji, aby przyczynić się do przetwarzania zawartego zasobu. Na przykład właściwość partOf na płótnie może służyć do odwoływania się do zewnętrznego manifestu, aby umożliwić odkrycie dalszych istotnych informacji. Podobnie manifest może odwoływać się do zawierającej kolekcji za pomocą partOf, aby ułatwić nawigację.",
      start:
        "Canvas lub część Canvas, którą klient powinien wyświetlić podczas inicjalizacji zasobu mającego właściwość start. Odwołanie do części Canvas jest obsługiwane w taki sam sposób, jak Ranges odwołuje się do części Canvas. Ta właściwość pozwala klientowi rozpocząć od pierwszego Canvas zawierającego interesującą zawartość, zamiast wymagać od użytkownika ręcznej nawigacji w celu jej znalezienia.",
      supplementary:
        "Link z tego zakresu do zbioru adnotacji, który zawiera adnotacje supplementing dotyczące zasobów treści dla zakresu. Klienci mogą wykorzystać tę opcję do przedstawienia użytkownikowi dodatkowej treści z innego obszaru roboczego podczas interakcji z zakresem lub do przeskoczenia do następnej części zakresu w tym samym obszarze roboczym. Na przykład Range może reprezentować artykuł prasowy obejmujący strony niesekwencyjne, a następnie używać dodatkowej właściwości do odwoływania się do kolekcji adnotacji składającej się z adnotacji rejestrujących tekst podzielonych na strony adnotacji na stronę gazety. Alternatywnie zakres może reprezentować części rękopisu, które zostały przepisane lub przetłumaczone, gdy istnieją inne części, nad którymi jeszcze nie pracowano. Zbiór adnotacji to adnotacje, które odpowiednio dokonują transkrypcji lub tłumaczenia.",
    },
    structural: {
      items:
        "Duża część funkcjonalności interfejsu API prezentacji IIIF polega po prostu na rejestrowaniu kolejności, w jakiej zasoby podrzędne występują w zasobie nadrzędnym, na przykład kolekcje lub manifesty w kolekcji nadrzędnej lub płótna w manifeście. Wszystkie te sytuacje są objęte jedną właściwością, przedmiotami.",
      structures:
        "Strukturę obiektu reprezentowanego jako Manifest można opisać za pomocą hierarchii zakresów. Zakresów można używać do opisu „spisu treści” obiektu lub innych struktur, z którymi użytkownik może wchodzić w interakcję poza kolejnością określoną przez właściwość items Manifestu. Hierarchia jest budowana poprzez zagnieżdżenie zasobów podrzędnych Range w tablicy items wyższego poziomu Range. Zakresy najwyższego poziomu tych hierarchii są podane we właściwości struktur.",
      annotations:
        "Uporządkowana lista stron z adnotacjami, które zawierają komentarz lub inne adnotacje na temat tego zasobu, oddzielna od adnotacji używanych do malowania treści na płótnie. Motywacją adnotacji nie może być painting, a cel adnotacji musi obejmować ten zasób lub jego część.",
    },
    attribution:
      "Prawa autorskie © 2012-2023 Redaktorzy i współpracownicy. Opublikowane przez konsorcjum IIIF na licencji CC-BY, patrz zastrzeżenie.",
  },
  behavior: {
    groups: {
      autoAdvance: "Automatyczny postęp",
      repeat: "Powtarzać",
      manifestOrdering: "Manifestowane porządkowanie",
      canvasOrdering: "Zamawianie płótna",
      collection: "Kolekcja",
      range: "Zakres",
      collectionOrdering: "Zamawianie kolekcji",
      rangeOrdering: "Zamawianie asortymentu",
      hidden: "Widoczność",
    },
    values: {
      "auto-advance": "Automatyczny postęp",
      "no-auto-advance": "Brak automatycznego awansu",
      repeat: "Powtarzać",
      "no-repeat": "Żadnego powtórzenia",
      unordered: "Nieuporządkowane",
      individuals: "Poszczególne płótna",
      continuous: "Ciągły",
      paged: "Stronicowane",
      "facing-pages": "Strony skierowane do przodu",
      "non-paged": "Niestronicowane",
      "multi-part": "Wieloczęściowy",
      together: "Razem",
      sequence: "Sekwencja",
      "thumbnail-nav": "Nawigacja miniaturami",
      "no-nav": "Brak nawigacji",
      hidden: "Ukryty",
    },
  },
  rights: {
    attributionNonCommercialNoDerivs: {
      label: "Uznanie autorstwa-Użycie niekomercyjne-Bez utworów zależnych",
      description:
        "Licencja ta jest najbardziej restrykcyjną z naszych sześciu głównych licencji, zezwalającą innym na pobieranie Twoich utworów i udostępnianie ich innym osobom, pod warunkiem, że uznają Cię za autorkę, ale nie mogą oni ich w żaden sposób zmieniać ani wykorzystywać komercyjnie.",
    },
    attributionNonCommercialShareAlike: {
      label: "Uznanie autorstwa-Użycie niekomercyjne-Na tych samych warunkach",
      description:
        "Niniejsza licencja umożliwia innym remiksowanie, dostosowywanie i rozwijanie Twojej pracy w celach niekomercyjnych, pod warunkiem, że podają Ci informacje i udzielają licencji na swoje nowe dzieła na identycznych warunkach.",
    },
    attributionNonCommercial: {
      label: "Uznanie autorstwa — niekomercyjne",
      description:
        "Licencja ta umożliwia innym remiksowanie, dostosowywanie i rozwijanie Twojego dzieła w celach niekomercyjnych i chociaż ich nowe dzieła muszą również potwierdzać Ciebie i mieć charakter niekomercyjny, nie muszą licencjonować swoich dzieł pochodnych na tych samych warunkach.",
    },
    attributionNoDerivs: {
      label: "Uznanie autorstwa — brak utworów pochodnych",
      description:
        "Niniejsza licencja umożliwia innym ponowne wykorzystanie utworu w dowolnym celu, w tym komercyjnym; jednakże nie można go udostępniać innym w dostosowanej formie i należy zapewnić autoryzację.",
    },
    attributionShareAlike: {
      label: "Uznanie autorstwa – na tych samych warunkach",
      description:
        "Licencja ta umożliwia innym remiksowanie, dostosowywanie i rozwijanie Twojej pracy nawet w celach komercyjnych, pod warunkiem, że uznają Cię za autora i udzielają licencji na swoje nowe dzieła na identycznych warunkach. Licencję tę często porównuje się do licencji na oprogramowanie bezpłatne i typu open source typu „copyleft”. Wszystkie nowe dzieła oparte na Twoim utworze będą objęte tą samą licencją, więc wszelkie utwory pochodne będą pozwalały również na wykorzystanie komercyjne. Jest to licencja używana przez Wikipedię i jest zalecana w przypadku materiałów, które skorzystałyby na włączeniu treści z Wikipedii i projektów objętych podobną licencją.",
    },
    attribution: {
      label: "Atrybucja",
      description:
        "Licencja ta umożliwia innym rozpowszechnianie, remiksowanie, dostosowywanie i rozwijanie Twojego dzieła, nawet komercyjnie, pod warunkiem, że uznają Cię za oryginalne dzieło. Jest to najbardziej dostosowana z oferowanych licencji. Zalecane w celu maksymalnego rozpowszechniania i wykorzystania materiałów licencjonowanych.",
    },
    publicDomain: {
      label: "Domena publiczna",
      description:
        "Osoba, która powiązała utwór z tym aktem, przekazała go do domeny publicznej, zrzekając się wszystkich swoich praw do utworu na całym świecie wynikających z prawa autorskiego, w tym wszelkich praw pokrewnych i pokrewnych, w zakresie dozwolonym przez prawo.",
    },
  },
  sizes: {
    landscape: "12 × 8 · Krajobraz",
    wide: "12 × 6 · Szeroki",
    square: "12 × 12 · Kwadrat",
    portrait: "8 × 12 · Portret",
  },
} as const;
