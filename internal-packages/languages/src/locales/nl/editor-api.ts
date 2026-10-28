/** System display metadata only. IIIF identifiers and authored content stay unchanged.
 * Documentation summaries adapted from IIIF Presentation 3.0 (CC-BY); attribution and links
 * are retained in packages/editor-api/src/meta/documentation.ts.
 * Behavior values and Creative Commons abbreviations are protocol data, not translated payloads.
 */
export const catalog = {
  resources: {
    collection: "Collectie",
    manifest: "Manifest",
    canvas: "Canvas",
    annotation: "Annotatie",
    annotationPage: "Annotatiepagina",
    range: "Range",
    annotationCollection: "Annotatiecollectie",
    contentResource: "Inhoudsresource",
    agent: "Persoon of organisatie",
  },
  fields: {
    label: "Label",
    metadata: "Metadata",
    summary: "Samenvatting",
    requiredStatement: "Verplichte vermelding",
    rights: "Rechten",
    provider: "Aanbieder",
    thumbnail: "Miniatuur",
    navDate: "Navigatiedatum",
    placeholderCanvas: "Plaatsaanduidingscanvas",
    accompanyingCanvas: "Begeleidend canvas",
    language: "Taal",
    id: "Identificatie",
    type: "Type",
    format: "Formaat",
    profile: "Profiel",
    height: "Hoogte",
    width: "Breedte",
    duration: "Duur",
    viewingDirection: "Leesrichting",
    behavior: "Gedrag",
    timeMode: "Tijdsmodus",
    motivation: "Doel",
    homepage: "Webpagina",
    logo: "Logo",
    rendering: "Alternatieve weergave",
    service: "Dienst",
    services: "Diensten",
    seeAlso: "Gerelateerde beschrijving",
    partOf: "Onderdeel van",
    start: "Begincanvas",
    supplementary: "Aanvullende inhoud",
    items: "Items",
    structures: "Structuren",
    annotations: "Annotaties",
    target: "Doelresource",
    body: "Inhoud",
    navPlace: "Navigatielocatie",
    textGranularity: "Tekstgranulariteit",
    value: "Waarde",
  },
  behavior: {
    groups: {
      autoAdvance: "Automatisch doorgaan",
      repeat: "Herhalen",
      manifestOrdering: "Volgorde van het manifest",
      canvasOrdering: "Volgorde van canvassen",
      collection: "Collectie",
      range: "Range",
      collectionOrdering: "Volgorde van de collectie",
      rangeOrdering: "Volgorde van de range",
      hidden: "Zichtbaarheid",
    },
    values: {
      "auto-advance": "Automatisch doorgaan",
      "no-auto-advance": "Niet automatisch doorgaan",
      repeat: "Herhalen",
      "no-repeat": "Niet herhalen",
      unordered: "Ongeordend",
      individuals: "Afzonderlijke canvassen",
      continuous: "Doorlopend",
      paged: "Gepagineerd",
      "facing-pages": "Tegenoverliggende pagina’s",
      "non-paged": "Niet gepagineerd",
      "multi-part": "Meerdelig",
      together: "Samen",
      sequence: "Reeks",
      "thumbnail-nav": "Miniatuurnavigatie",
      "no-nav": "Geen navigatie",
      hidden: "Verborgen",
    },
  },
  documentation: {
    definedTypes: {
      Collection:
        "Een geordende lijst van manifesten en/of verdere collecties. Met collecties kunnen manifesten en onderliggende collecties voor presentatie in een hiërarchische structuur worden gegroepeerd. Dit kan dienen om navigatie te genereren, dynamische zoekresultaten te tonen of vaste verzamelingen gerelateerde resources voor andere doeleinden aan te bieden.",
      Manifest:
        "Een beschrijving van de structuur en eigenschappen van het samengestelde object. Deze bevat de informatie die de client nodig heeft om de inhoud aan de gebruiker te presenteren, zoals een titel en andere beschrijvende informatie over het object of het intellectuele werk dat het weergeeft. Elk manifest beschrijft doorgaans hoe één samengesteld object moet worden gepresenteerd, zoals een boek, een standbeeld of een muziekalbum.",
      Canvas:
        "Een virtuele container die een bepaalde weergave van het object vertegenwoordigt en waaraan inhoudsresources zijn gekoppeld, als geheel of aan delen ervan. Het canvas biedt een referentiekader voor de ruimtelijke en temporele indeling van de inhoud. Het concept canvas is ontleend aan standaarden zoals PDF en HTML en toepassingen zoals Photoshop en PowerPoint, waarbij afbeeldingen, video, tekst en andere inhoud met annotaties op een aanvankelijk leeg weergaveoppervlak worden ‘geschilderd’. Deze annotaties worden verzameld in annotatiepagina’s.",
      Range:
        "Een geordende lijst van canvassen en/of verdere ranges. Met ranges kunnen canvassen of delen daarvan op een bepaalde manier worden gegroepeerd. Dit kan om inhoudelijke redenen zijn, zoals bij een inhoudsopgave of de scènes van een toneelstuk. Ook fysieke kenmerken kunnen van belang zijn, zoals katernen in een oud boek of opgenomen muziek die over verschillende fysieke dragers is verdeeld, bijvoorbeeld twee cd’s.",
      AnnotationPage:
        "Een geordende lijst van annotaties die doorgaans bij een canvas hoort, maar ook vanuit andere soorten resources kan worden verwezen. Annotatiepagina’s verzamelen en ordenen lijsten van annotaties, die op hun beurt commentaar op een resource leveren of inhoud die deel uitmaakt van een canvas.",
      Annotation:
        "Annotaties koppelen inhoudsresources aan canvassen. Hetzelfde mechanisme wordt gebruikt voor zichtbare en/of hoorbare resources als voor transcripties, commentaar, tags en andere inhoud. Dit biedt één uniforme methode om informatie op elkaar af te stemmen en een op standaarden gebaseerd kader om delen van resources en delen van canvassen te onderscheiden. Omdat annotaties later kunnen worden toegevoegd, ondersteunt dit een gedistribueerd systeem waarin uitgevers hun inhoud kunnen afstemmen op beschrijvingen die anderen hebben gemaakt. Functionaliteit rond annotaties kan ook gebruikmaken van aanvullende klassen zoals SpecificResource, Choice of Selectors.",
      ContentResource:
        "Webresources zoals afbeeldingen, audio, video of tekst die via een annotatie aan een canvas zijn gekoppeld of die een weergave van een resource bieden.",
      AnnotationCollection:
        "Een geordende lijst van annotatiepagina’s. Met annotatiecollecties kunnen annotaties op een hoger niveau worden gegroepeerd. Zo kunnen alle annotaties met Engelse vertalingen van een middeleeuws Frans document gescheiden blijven van de transcriptie of een editie in modern Frans, of kan het commentaar van de regisseur bij een film gescheiden blijven van het script.",
    },
    descriptive: {
      label:
        "Een voor mensen leesbaar label, naam of titel. De eigenschap label is bedoeld als korte tekstuele aanduiding van de resource wanneer iemand deze moet kunnen onderscheiden van vergelijkbare resources, bijvoorbeeld objecten, pagina’s of keuzemogelijkheden voor weer te geven afbeeldingen. De eigenschap label kan volledig meertalig zijn en elke taal kan meerdere waarden hebben.",
      metadata:
        "Een geordende lijst van beschrijvingen die aan de gebruiker worden getoond bij interactie met de resource, opgegeven als paren van voor mensen leesbare labels en waarden. De inhoud van deze vermeldingen is uitsluitend bedoeld voor presentatie; er mag geen beschrijvende semantiek uit worden afgeleid. Een vermelding kan informatie geven over het ontstaan van het object, een fysieke beschrijving, eigendomsinformatie of andere zaken.",
      summary:
        "Een korte tekstuele samenvatting voor de gebruiker wanneer de metadatavermeldingen van de resource niet worden getoond. Deze kan dienen als beknopte beschrijving in zoekresultaten op itemniveau, op kleine schermen of in een alternatieve gebruikersinterface wanneer de eigenschap metadata niet wordt weergegeven. De eigenschap summary volgt hetzelfde patroon als de hierboven beschreven eigenschap label.",
      requiredStatement:
        "Tekst die moet worden getoond wanneer de resource wordt weergegeven of gebruikt. De eigenschap requiredStatement kan bijvoorbeeld auteursrecht- of eigendomsvermeldingen bevatten, een erkenning van de beherende en/of publicerende instelling of andere tekst die de publicerende organisatie essentieel vindt om aan de gebruiker te tonen. Door de grote verscheidenheid aan mogelijke clientinterfaces is het niet altijd mogelijk deze vermelding direct bij het openen te tonen. Als de vermelding aanvankelijk verborgen is, moeten clients zo duidelijk mogelijk aangeven hoe deze zichtbaar kan worden gemaakt.",
      rights:
        "Een tekenreeks die een licentie of rechtenverklaring identificeert die geldt voor de inhoud van de resource, zoals de JSON van een manifest of de pixels van een afbeelding. De waarde moet afkomstig zijn uit de verzameling URI’s van Creative Commons-licenties, rechtenverklaringen van RightsStatements.org of via het uitbreidingsmechanisme toegevoegde verklaringen. Deze eigenschap is informatief en kan bijvoorbeeld worden gebruikt om een pictogram te tonen dat de rechtenaanspraken weergeeft.",
      provider:
        "Een organisatie of persoon die heeft bijgedragen aan het beschikbaar stellen van de inhoud van de resource. Clients kunnen deze informatie aan de gebruiker tonen om de bijdragen van de aanbieder te erkennen. Dit verschilt van de eigenschap requiredStatement doordat de gegevens gestructureerd zijn: de client kan meer doen dan tekst tonen en beschikt over rijkere informatie over personen en organisaties voor gebruik in verschillende interfaces.",
      thumbnail:
        "Een inhoudsresource, zoals een kleine afbeelding of een kort audiofragment, die de resource met de eigenschap thumbnail vertegenwoordigt. Een resource kan meerdere miniatuurresources hebben met hetzelfde of een verschillend type en formaat.",
      navDate:
        "Een datum die clients kunnen gebruiken voor navigatie wanneer zij de resource aan de gebruiker presenteren in een datumgebaseerde interface, zoals een kalender of tijdlijn. Meer beschrijvende datumbereiken die rechtstreeks aan de gebruiker worden getoond, horen in de eigenschap metadata. Als de resource canvassen met de eigenschap duration bevat, komt de opgegeven datum en tijd overeen met de navigatiedatum en -tijd van het begin van de resource. Bij een range met een canvas dat videobeelden van een historische gebeurtenis weergeeft, is navDate bijvoorbeeld de datum en tijd van het eerste moment van de opgenomen gebeurtenis.",
      placeholderCanvas:
        "Eén canvas dat aanvullende inhoud biedt voordat de hoofdinhoud van de resource met de eigenschap placeholderCanvas wordt weergegeven, of als aankondiging of vervanging van die inhoud. Voorbeelden zijn afbeeldingen, tekst en geluid die video-inhoud vervangen voordat de gebruiker het afspelen start, of een filmposter die de aandacht trekt. De inhoud van placeholderCanvas verschilt van een miniatuur: een client kan thumbnail gebruiken om meerdere resources samen te vatten en ertussen te navigeren en vervolgens inhoud uit placeholderCanvas tonen als onderdeel van de eerste presentatie van één resource. Een plaatsaanduidingscanvas heeft waarschijnlijk andere afmetingen dan de canvassen van de resource met de eigenschap placeholderCanvas.",
      accompanyingCanvas:
        "Eén canvas dat aanvullende inhoud biedt tijdens het weergeven van de resource met de eigenschap accompanyingCanvas. Voorbeelden zijn een afbeelding die wordt getoond terwijl een canvas met alleen een duur audio afspeelt, of achtergrondgeluid dat klinkt terwijl een gebruiker door een manifest met uitsluitend afbeeldingen navigeert.",
      language:
        "De taal of talen die in de inhoud van deze externe resource worden gebruikt. Deze eigenschap is al beschikbaar in het Web Annotation-model voor inhoudsresources die de inhoud of het doel van een annotatie vormen, maar kan ook worden gebruikt voor resources waarnaar wordt verwezen vanuit homepage, rendering en partOf.",
    },
    technical: {
      id: "De URI die de resource identificeert. Als de resource alleen ingebed in een andere resource beschikbaar is, zoals een range binnen een manifest, mag de URI die van de omvattende resource zijn, met een uniek fragment aan het einde. Dit geldt niet voor canvassen: die moeten een eigen URI zonder fragment hebben.",
      type: "Het type of de klasse van de resource. Voor klassen die voor deze specificatie zijn gedefinieerd",
      format:
        "Het specifieke mediatype, vaak MIME-type genoemd, van een inhoudsresource, bijvoorbeeld image/jpeg. Dit is belangrijk om verschillende formaten van hetzelfde algemene resourcetype te onderscheiden, zoals tekst in XML en platte tekst.",
      profile:
        "Een schema of benoemde verzameling functies die beschikbaar zijn via de resource. Het profiel kan het type en/of formaat van een externe resource of dienst verder verduidelijken, zodat clients hun verwerking van de resource met de eigenschap profile kunnen aanpassen.",
      height:
        "De hoogte van het canvas of de externe inhoudsresource. Voor inhoudsresources is de waarde in pixels. Voor canvassen heeft de waarde geen eenheid. Samen met de breedte geeft deze de beeldverhouding aan van de ruimte waarin inhoudsresources zich bevinden.",
      width:
        "De breedte van het canvas of de externe inhoudsresource. Voor inhoudsresources is de waarde in pixels. Voor canvassen heeft de waarde geen eenheid. Samen met de hoogte geeft deze de beeldverhouding aan van de ruimte waarin inhoudsresources zich bevinden.",
      duration: "De duur van het canvas of de externe inhoudsresource, uitgedrukt in seconden.",
      viewingDirection:
        "De richting waarin een reeks canvassen aan de gebruiker moet worden getoond. Deze specificatie definieert vier richtingswaarden in de onderstaande tabel. Andere waarden kunnen extern als uitbreiding worden gedefinieerd.",
      behavior:
        "Een verzameling functies voor de gebruikerservaring die de uitgever van de inhoud bij voorkeur door de client laat gebruiken bij het presenteren van de resource. Deze specificatie definieert de waarden in de onderstaande tabel. Andere waarden kunnen extern als uitbreiding worden gedefinieerd.",
      timeMode:
        "Een modus die aan een annotatie is gekoppeld en wordt toegepast bij het weergeven van tijdgebaseerde media, of andere media waaraan een duur kan worden toegekend, die als inhoudsresource van die annotatie worden gebruikt. Omdat timeMode aan de annotatie is gekoppeld, kunnen verschillende resources in de inhoud geen verschillende waarden hebben. Deze specificatie definieert de waarden in de onderstaande tabel. Andere waarden kunnen extern als uitbreiding worden gedefinieerd.",
      motivation:
        "Deze specificatie definieert twee waarden voor de eigenschap motivation van Web Annotation, of purpose bij gebruik op een Specific Resource of Textual Body. Resources die aan een canvas zijn gekoppeld door een annotatie met de waarde painting voor motivation moeten aan de gebruiker worden gepresenteerd als de weergave van het canvas. Resources die via een annotatie met de waarde supplementing aan een canvas zijn gekoppeld, mogen worden getoond als onderdeel van de weergave van het canvas of in een ander deel van de gebruikersinterface.",
    },
    linking: {
      homepage:
        "Een webpagina over het object dat wordt vertegenwoordigd door de resource met de eigenschap homepage. Deze webpagina wordt doorgaans gepubliceerd door de organisatie die voor het object verantwoordelijk is en kan door een contentmanagementsysteem of ander catalogussysteem worden gegenereerd. De resource moet rechtstreeks aan de gebruiker kunnen worden getoond. Resources die wel gerelateerd zijn maar geen homepage vormen, moeten in plaats daarvan worden toegevoegd aan de eigenschap metadata, met een passend label of passende waarde om de relatie te beschrijven.",
      logo: "Een kleine afbeeldingsresource die de bijbehorende Agent-resource vertegenwoordigt. Het logo moet duidelijk worden weergegeven wanneer de resource wordt getoond of gebruikt, zonder bijsnijden, draaien of andere vervorming van de afbeelding. Het wordt aanbevolen een IIIF Image API-dienst voor deze afbeelding beschikbaar te stellen voor andere bewerkingen, zoals het wijzigen van de grootte.",
      rendering:
        "Een resource die een alternatieve weergave buiten IIIF biedt van de resource met de eigenschap rendering. Dergelijke weergaven kunnen doorgaans niet op één canvas worden geschilderd, omdat ze te veel aanzichten bevatten, onverenigbare afmetingen hebben of samengestelde resources zijn die extra weergavefunctionaliteit vereisen. De weergaveresource moet rechtstreeks aan een gebruiker kunnen worden getoond, al kan dit buiten de IIIF-client gebeuren. De resource mag geen welkomstpagina of andere tussenliggende resource hebben die de toegang bemiddelt. Als toegangscontrole nodig is, wordt de IIIF Authentication API aanbevolen. Voorbeelden zijn een boek als PDF of EPUB, een diavoorstelling met afbeeldingen van een gebouw of een 3D-model van een standbeeld.",
      service:
        "Een dienst waarmee de client rechtstreeks kan communiceren om aanvullende informatie of functionaliteit te krijgen voor het gebruik van de resource met de eigenschap service, bijvoorbeeld vanuit een afbeelding naar de basis-URI van een bijbehorende IIIF Image API-dienst. Aan de dienstresource moet aanvullende informatie zijn gekoppeld waarmee de client kan bepalen hoe deze op passende wijze kan worden gebruikt. Raadpleeg het Service Registry-document voor informatie over de momenteel bekende diensttypen.",
      services:
        "Een lijst van een of meer dienstdefinities op de bovenste resource van het document, die doorgaans door meerdere volgende resources worden gedeeld. Zo kunnen gedeelde diensten op één plaats worden verzameld, in plaats van hun informatie mogelijk vele malen in het document te herhalen of een client de volledige documentstructuur te laten doorzoeken. De resource waarop de dienst van toepassing is, moet nog steeds de eigenschap service hebben zoals hierboven beschreven, waarbij de dienstresources minimaal de eigenschappen id en type of @id en @type hebben. Zo weet de client dat de dienst op die resource van toepassing is. Het gebruik van de eigenschap services wordt bepaald door het publicerende systeem.",
      seeAlso:
        "Een machineleesbare resource, zoals een XML- of RDF-beschrijving, die gerelateerd is aan de huidige resource met de eigenschap seeAlso. Geef eigenschappen van de resource op om de client te helpen kiezen tussen meerdere beschrijvingen, indien beschikbaar, en het document passend te gebruiken. Als de relatie tussen resource en document specifieker moet zijn, hoort die relatie in het document te staan en niet in de IIIF-resource. Andere IIIF-resources zijn ook geldige doelen voor seeAlso, bijvoorbeeld een manifest dat een gerelateerd object beschrijft. De URI van het document moet één weergave van de gegevens in een bepaald formaat identificeren. Als dezelfde gegevens bijvoorbeeld in JSON en XML bestaan, moeten voor elke weergave afzonderlijke resources met verschillende id- en format-eigenschappen worden toegevoegd.",
      partOf:
        "Een omvattende resource die de resource met de eigenschap partOf bevat. Wanneer een client partOf tegenkomt, kan deze de genoemde omvattende resource ophalen als die niet in de huidige weergave is ingebed, om de verwerking van de opgenomen resource te ondersteunen. Zo kan partOf op een canvas verwijzen naar een extern manifest om verdere relevante informatie te ontdekken. Op dezelfde manier kan een manifest met partOf naar een omvattende collectie verwijzen om navigatie te ondersteunen.",
      start:
        "Een canvas of deel van een canvas dat de client bij het initialiseren van de resource met de eigenschap start moet tonen. De verwijzing naar een deel van een canvas wordt op dezelfde manier verwerkt als verwijzingen naar delen van canvassen vanuit ranges. Met deze eigenschap kan de client beginnen bij het eerste canvas met interessante inhoud, zodat de gebruiker daar niet zelf naartoe hoeft te navigeren.",
      supplementary:
        "Een koppeling vanuit deze range naar een annotatiecollectie met de aanvullende annotaties van inhoudsresources voor de range. Clients kunnen dit gebruiken om bij interactie met de range aanvullende inhoud van een ander canvas te tonen, of om naar het volgende deel van de range binnen hetzelfde canvas te springen. De range kan bijvoorbeeld een krantenartikel vertegenwoordigen dat over niet-opeenvolgende pagina’s is verspreid en via supplementary verwijzen naar een annotatiecollectie met annotaties die de tekst vastleggen, verdeeld over annotatiepagina’s per krantenpagina. De range kan ook delen van een manuscript vertegenwoordigen die zijn getranscribeerd of vertaald, terwijl andere delen nog niet zijn bewerkt. De annotatiecollectie bevat dan respectievelijk de annotaties die transcriberen of vertalen.",
    },
    structural: {
      items:
        "Een groot deel van de functionaliteit van de IIIF Presentation API bestaat uit het vastleggen van de volgorde waarin onderliggende resources binnen een bovenliggende resource voorkomen, zoals collecties of manifesten binnen een bovenliggende collectie, of canvassen binnen een manifest. Al deze situaties worden afgedekt door één eigenschap: items.",
      structures:
        "De structuur van een object dat als manifest wordt weergegeven, kan worden beschreven met een hiërarchie van ranges. Ranges kunnen de ‘inhoudsopgave’ van het object beschrijven of andere structuren waarmee de gebruiker kan werken naast de volgorde in de eigenschap items van het manifest. De hiërarchie wordt opgebouwd door onderliggende ranges te nesten in de items-array van de range op een hoger niveau. De bovenste ranges van deze hiërarchieën staan in de eigenschap structures.",
      annotations:
        "Een geordende lijst van annotatiepagina’s met commentaar of andere annotaties over deze resource, gescheiden van de annotaties waarmee inhoud op een canvas wordt geschilderd. De motivation van de annotaties mag niet painting zijn en het doel van de annotaties moet deze resource of een deel ervan bevatten.",
    },
    attribution:
      "Copyright © 2012-2023 Redacteuren en bijdragers. Gepubliceerd door het IIIF Consortium onder de CC-BY-licentie, zie de disclaimer.",
  },
  rights: {
    publicDomain: {
      label: "Publiek domein",
      description:
        "De persoon die een werk aan deze verklaring heeft verbonden, heeft het werk aan het publieke domein opgedragen door wereldwijd afstand te doen van alle auteursrechten op het werk, inclusief alle aanverwante en naburige rechten, voor zover wettelijk toegestaan.",
    },
    attribution: {
      label: "Naamsvermelding",
      description:
        "Met deze licentie mogen anderen uw werk verspreiden, remixen, aanpassen en erop voortbouwen, ook voor commerciële doeleinden, zolang zij u als oorspronkelijke maker vermelden. Dit is de ruimste van de aangeboden licenties. Aanbevolen voor een zo breed mogelijke verspreiding en gebruik van gelicentieerd materiaal.",
    },
    attributionShareAlike: {
      label: "Naamsvermelding-GelijkDelen",
      description:
        "Met deze licentie mogen anderen uw werk remixen, aanpassen en erop voortbouwen, ook voor commerciële doeleinden, zolang zij u vermelden en hun nieuwe creaties onder dezelfde voorwaarden in licentie geven. Deze licentie wordt vaak vergeleken met ‘copyleft’-licenties voor vrije en opensourcesoftware. Alle nieuwe werken die op uw werk zijn gebaseerd, krijgen dezelfde licentie, zodat ook afgeleide werken commercieel mogen worden gebruikt. Wikipedia gebruikt deze licentie. Ze wordt aanbevolen voor materiaal dat baat zou hebben bij het opnemen van inhoud uit Wikipedia en projecten met vergelijkbare licenties.",
    },
    attributionNoDerivs: {
      label: "Naamsvermelding-GeenAfgeleideWerken",
      description:
        "Met deze licentie mogen anderen het werk voor elk doel hergebruiken, ook commercieel. Het werk mag echter niet in aangepaste vorm met anderen worden gedeeld en uw naam moet worden vermeld.",
    },
    attributionNonCommercial: {
      label: "Naamsvermelding-NietCommercieel",
      description:
        "Met deze licentie mogen anderen uw werk voor niet-commerciële doeleinden remixen, aanpassen en erop voortbouwen. Hun nieuwe werken moeten u ook vermelden en niet-commercieel zijn, maar afgeleide werken hoeven niet onder dezelfde voorwaarden in licentie te worden gegeven.",
    },
    attributionNonCommercialShareAlike: {
      label: "Naamsvermelding-NietCommercieel-GelijkDelen",
      description:
        "Met deze licentie mogen anderen uw werk voor niet-commerciële doeleinden remixen, aanpassen en erop voortbouwen, zolang zij u vermelden en hun nieuwe creaties onder dezelfde voorwaarden in licentie geven.",
    },
    attributionNonCommercialNoDerivs: {
      label: "Naamsvermelding-NietCommercieel-GeenAfgeleideWerken",
      description:
        "Dit is de meest beperkende van onze zes hoofdlicenties. Anderen mogen uw werken alleen downloaden en met anderen delen zolang zij u vermelden. Zij mogen de werken op geen enkele manier wijzigen of commercieel gebruiken.",
    },
  },
  layout: {
    pair: "Naast elkaar",
    triptych: "Drie kolommen",
    featureLeft: "Links uitgelicht",
    featureAbove: "Boven uitgelicht",
    fourImages: "Vier afbeeldingen",
    sixImages: "Zes afbeeldingen",
    heroInset: "Hoofdafbeelding met inzet",
    offsetPair: "Versprongen paar",
    cascade: "Trapsgewijs",
    stacked: "Gestapeld",
    scatter: "Verspreid",
    galleryWall: "Galerijwand",
    blank: "Leeg canvas",
  },
  sizes: {
    landscape: "12 × 8 · Liggend",
    wide: "12 × 6 · Breed",
    square: "12 × 12 · Vierkant",
    portrait: "8 × 12 · Staand",
  },
} as const;
