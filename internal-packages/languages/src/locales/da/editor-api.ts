/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  resources: {
    collection: "Samling",
    manifest: "Manifest",
    canvas: "Lærred",
    annotation: "Anmærkning",
    annotationPage: "Anmærkningsside",
    range: "Område",
    annotationCollection: "Anmærkningssamling",
    contentResource: "Indholdsressource",
    agent: "Agent",
  },
  layout: {
    pair: "Side om side",
    triptych: "Tre søjler",
    featureLeft: "Funktion til venstre",
    featureAbove: "Funktion ovenfor",
    fourImages: "Fire billeder",
    sixImages: "Seks billeder",
    heroInset: "Helt + indsat",
    offsetPair: "Offset par",
    cascade: "Kaskade",
    stacked: "Stablet",
    scatter: "Sprede",
    galleryWall: "Galleri væg",
    blank: "Blankt lærred",
  },
  fields: {
    label: "Etiket",
    metadata: "Metadata",
    summary: "Resumé",
    requiredStatement: "Obligatorisk angivelse",
    rights: "Rettigheder",
    provider: "Udbyder",
    thumbnail: "Miniaturebillede",
    navDate: "Navigationsdato",
    placeholderCanvas: "Pladsholder lærred",
    accompanyingCanvas: "Medfølgende lærred",
    language: "Sprog",
    id: "Identifikator",
    type: "Type",
    format: "Format",
    profile: "Profil",
    height: "Højde",
    width: "Bredde",
    duration: "Varighed",
    viewingDirection: "Visningsretning",
    behavior: "Opførsel",
    timeMode: "Tidstilstand",
    motivation: "Motivering",
    homepage: "Hjemmeside",
    logo: "Logo",
    rendering: "Alternativ repræsentation",
    service: "Service",
    services: "Tjenester",
    seeAlso: "Relateret beskrivelse",
    partOf: "En del af",
    start: "Startlærred",
    supplementary: "Supplerende indhold",
    items: "genstande",
    structures: "Strukturer",
    annotations: "Anmærkninger",
    target: "Mål",
    body: "Legeme",
    navPlace: "Navigationsplacering",
    textGranularity: "Tekstgranularitet",
    value: "Værdi",
  },
  documentation: {
    definedTypes: {
      Collection:
        "En bestilt liste over manifester og/eller yderligere samlinger. Samlinger gør det muligt for manifester og underordnede samlinger at blive grupperet i en hierarkisk struktur til præsentation, som kan være til at generere navigation, vise dynamiske resultater fra en søgning eller tilvejebringe faste sæt af relaterede ressourcer til ethvert andet formål.",
      Manifest:
        "En beskrivelse af det sammensatte objekts struktur og egenskaber. Den indeholder oplysninger, der er nødvendige for, at klienten kan præsentere indholdet for brugeren, såsom en titel og andre beskrivende oplysninger om objektet eller det intellektuelle arbejde, som det formidler. Hvert manifest beskriver normalt, hvordan man præsenterer et enkelt sammensat objekt såsom en bog, en statue eller et musikalbum.",
      Canvas:
        'En virtuel beholder, der repræsenterer en bestemt visning af objektet og har indholdsressourcer knyttet til det eller med dele af det. Lærredet giver en referenceramme for layoutet af indholdet, både rumligt og tidsmæssigt. Konceptet med et lærred er lånt fra standarder som PDF og HTML, eller applikationer som Photoshop og PowerPoint, hvor en oprindeligt tom visningsflade har billeder, video, tekst og andet indhold "malet" på sig af Annotations, samlet i Annotation Pages.',
      Range:
        "En ordnet liste over lærreder og/eller yderligere rækker. Områder gør det muligt at gruppere lærreder eller dele deraf på en eller anden måde. Dette kan være af indholdsbaserede årsager, såsom det kan være beskrevet i en indholdsfortegnelse eller scenesættet i et teaterstykke. Ligeledes kan fysiske funktioner være vigtige, såsom sidesamlinger i en tidlig bog, eller når optaget musik er opdelt på tværs af forskellige fysiske bærere, såsom to cd'er.",
      AnnotationPage:
        "En ordnet liste over annoteringer, der typisk er knyttet til et lærred, men som også kan refereres fra andre typer ressourcer. Annotationssider samler og bestiller lister over annoteringer, som igen giver kommentarer om en ressource eller indhold, der er en del af et lærred.",
      Annotation:
        "Annoteringer knytter indholdsressourcer til Canvases. Den samme mekanisme bruges til de synlige og/eller hørbare ressourcer, som bruges til transskriptioner, kommentarer, tags og andet indhold. Dette giver en enkelt, samlet metode til at justere information og giver en standardbaseret ramme til at skelne mellem dele af ressourcer og dele af Canvases. Da annoteringer kan tilføjes senere, fremmer det et distribueret system, hvor udgivere kan tilpasse deres indhold med de beskrivelser, der er oprettet af andre. Annoteringsrelateret funktionalitet kan også være afhængig af andre klasser såsom SpecificResource, Choice eller Selectors.",
      ContentResource:
        "Webressourcer såsom billeder, lyd, video eller tekst, der er knyttet til et lærred via en annotering, eller giver en repræsentation af enhver ressource.",
      AnnotationCollection:
        "En ordnet liste over anmærkningssider. Annotationssamlinger gør det muligt at optage grupper af annoteringer på højere niveau. For eksempel kan alle de engelske oversættelser Annoteringer af et fransk middelalderdokument holdes adskilt fra transskriptionen eller en udgave på moderne fransk, eller instruktørens kommentar til en film kan adskilles fra manuskriptet.",
    },
    descriptive: {
      label:
        "En menneskelig læsbar etiket, navn eller titel. Etiketegenskaben er beregnet til at blive vist som et kort tekstmæssigt surrogat for ressourcen, hvis et menneske har behov for at skelne mellem den og lignende ressourcer, for eksempel mellem objekter, sider eller muligheder for et valg af billeder, der skal vises. Etiketegenskaben kan internationaliseres fuldt ud, og hvert sprog kan have flere værdier.",
      metadata:
        "En ordnet liste over beskrivelser, der skal vises for brugeren, når de interagerer med ressourcen, givet som par af menneskelig læsbare etiket- og værdiindgange. Indholdet af disse indlæg er kun beregnet til præsentation; beskrivende semantik bør ikke udledes. En post kan bruges til at formidle information om oprettelsen af ​​objektet, en fysisk beskrivelse, ejerskabsoplysninger eller andre formål.",
      summary:
        "Et kort tekstresumé beregnet til at blive formidlet til brugeren, når metadataindtastningerne for ressourcen ikke vises. Dette kan bruges som en kort beskrivelse af søgeresultater på emneniveau, til miljøer med små skærme eller som en alternativ brugergrænseflade, når metadataegenskaben ikke gengives i øjeblikket. Opsummeringsegenskaben følger det samme mønster som etiketegenskaben beskrevet ovenfor.",
      requiredStatement:
        "Tekst, der skal vises, når ressourcen vises eller bruges. For eksempel kan requiredStatement-egenskaben bruges til at præsentere copyright- eller ejerskabserklæringer, en anerkendelse af ejeren og/eller den udgiver-institution eller enhver anden tekst, som udgiverorganisationen anser for kritisk at vise til brugeren. I betragtning af den store variation af potentielle klientbrugergrænseflader, vil det ikke altid være muligt at vise denne erklæring til brugeren i klientens oprindelige tilstand. Hvis den oprindeligt er skjult, skal klienter gøre metoden til at afsløre det så indlysende som muligt.",
      rights:
        "En streng, der identificerer en licens- eller rettighedserklæring, der gælder for indholdet af ressourcen, såsom JSON af et manifest eller pixels i et billede. Værdien skal hentes fra sættet af Creative Commons-licens-URI'er, RightsStatements.org-rettighedserklæring-URI'erne eller dem, der tilføjes via udvidelsesmekanismen. Inkluderingen af ​​denne egenskab er informativ og kan for eksempel bruges til at vise et ikon, der repræsenterer rettighedspåstandene.",
      provider:
        "En organisation eller person, der har bidraget til at levere indholdet af ressourcen. Kunder kan derefter vise denne information til brugeren for at anerkende udbyderens bidrag. Dette adskiller sig fra requiredStatement-egenskaben ved, at dataene er strukturerede, så klienten kan gøre mere end blot at præsentere tekst, men i stedet have mere rig information om de personer og organisationer, der skal bruges i forskellige grænseflader.",
      thumbnail:
        "En indholdsressource, såsom et lille billede eller et kort lydklip, der repræsenterer den ressource, der har miniatureegenskaben. En ressource kan have flere miniatureressourcer, der har samme eller forskellig type og format.",
      navDate:
        "En dato, som klienter kan bruge til navigationsformål, når de præsenterer ressourcen for brugeren i en datobaseret brugergrænseflade, såsom en kalender eller tidslinje. Mere beskrivende datointervaller, beregnet til visning direkte til brugeren, bør inkluderes i metadataegenskaben til konsum. Hvis ressourcen indeholder lærreder, der har varighedsegenskaben, svarer den angivne dato og klokkeslæt til navigationsdatoen for start af ressourcen. For eksempel, et område, der inkluderer et lærred, der repræsenterer et sæt videoindhold, der optager en historisk begivenhed, er navDate datoen for det første øjeblik af den optagede begivenhed.",
      placeholderCanvas:
        "Et enkelt lærred, der leverer yderligere indhold til brug, før hovedindholdet af den ressource, der har placeholderCanvas-egenskaben, gengives, eller som en annonce eller stand-in for det pågældende indhold. Eksempler omfatter billeder, tekst og lyd, der står for videoindhold, før brugeren starter afspilning; eller en filmplakat for at tiltrække brugerens opmærksomhed. Indholdet leveret af placeholderCanvas adskiller sig fra et miniaturebillede: en klient kan bruge miniaturebilleder til at opsummere og navigere i flere ressourcer og derefter vise indhold fra placeholderCanvas som en del af den indledende præsentation af en enkelt ressource. Et pladsholderlærred har sandsynligvis andre dimensioner end lærredet(erne) for den ressource, der har egenskaben placeholderCanvas.",
      accompanyingCanvas:
        "Et enkelt lærred, der giver yderligere indhold til brug, mens den gengiver ressourcen, der har accompanyingCanvas-egenskaben. Eksempler inkluderer et billede, der skal vises, mens et Canvas kun varighed afspiller lyd; eller baggrundslyd til at afspille, mens en bruger navigerer i et kun billedmanifest.",
      language:
        "Det eller de sprog, der bruges i indholdet af denne eksterne ressource. Denne egenskab er allerede tilgængelig fra webannotationsmodellen for indholdsressourcer, der er hovedteksten eller målet for en annotering, men den kan også bruges til ressourcer, der refereres fra hjemmesiden, gengivelsen og partOf.",
    },
    technical: {
      id: "URI, der identificerer ressourcen. Hvis ressourcen kun er tilgængelig, indlejret i en anden ressource, såsom et område inden for et manifest, så kan URI være URI for indlejringsressourcen med et unikt fragment i slutningen. Dette gælder ikke for lærreder, som skal have deres egen URI uden et fragment.",
      type: "Ressourcens type eller klasse. For klasser defineret til denne specifikation",
      format:
        "Den specifikke medietype (ofte kaldet en MIME-type) for en indholdsressource, for eksempel image/jpeg. Dette er vigtigt for at skelne mellem forskellige formater af den samme overordnede type ressource, såsom at skelne tekst i XML fra almindelig tekst.",
      profile:
        "Et skema eller navngivet funktionalitetssæt tilgængelig fra ressourcen. Profilen kan yderligere tydeliggøre typen og/eller formatet af en ekstern ressource eller tjeneste, hvilket giver kunderne mulighed for at tilpasse deres håndtering af den ressource, der har profilegenskaben.",
      height:
        "Højden på lærredet eller ekstern indholdsressource. For indholdsressourcer er værdien i pixels. For lærreder har værdien ikke en enhed. I kombination med bredden giver det et billedformat for det rum, hvor indholdsressourcerne er placeret.",
      width:
        "Bredden af ​​Canvas eller ekstern indholdsressource. For indholdsressourcer er værdien i pixels. For lærreder har værdien ikke en enhed. I kombination med højden formidler det et aspektforhold for det rum, hvor indholdsressourcerne er placeret.",
      duration: "Varigheden af ​​Canvas eller ekstern indholdsressource angivet i sekunder.",
      viewingDirection:
        "Den retning, som et sæt lærreder skal vises i for brugeren. Denne specifikation definerer fire retningsværdier i tabellen nedenfor. Andre kan defineres eksternt som en udvidelse.",
      behavior:
        "Et sæt brugeroplevelsesfunktioner, som udgiveren af ​​indholdet foretrækker, at klienten bruger, når ressourcen præsenteres. Denne specifikation definerer værdierne i tabellen nedenfor. Andre kan defineres eksternt som en udvidelse.",
      timeMode:
        "En tilstand, der er knyttet til en annotering, der skal anvendes til gengivelse af et hvilket som helst tidsbaseret medie, eller på anden måde kunne anses for at have en varighed, brugt som en hovedressource for den annotering. Bemærk, at associeringen af ​​timeMode med annotationen betyder, at forskellige ressourcer i kroppen ikke kan have forskellige værdier. Denne specifikation definerer de værdier, der er angivet i tabellen nedenfor. Andre kan defineres eksternt som en udvidelse.",
      motivation:
        'Denne specifikation definerer to værdier for webannoteringsegenskaben for motivation eller formål, når den bruges på en specifik ressource eller Textual Body. Ressourcer knyttet til et lærred af en annotation, der har motivationsværdien "painting", skal præsenteres for brugeren som repræsentation af lærredet. Ressourcer knyttet til et lærred af en annotation, der har motivationsværdien supplementing, kan præsenteres for brugeren som en del af repræsentationen af ​​lærredet eller kan præsenteres i en anden del af brugergrænsefladen.',
    },
    linking: {
      homepage:
        "En webside, der handler om objektet repræsenteret af den ressource, der har hjemmesideegenskaben. Websiden udgives normalt af den organisation, der er ansvarlig for objektet, og kan være genereret af et indholdsstyringssystem eller et andet katalogiseringssystem. Ressourcen skal kunne vises direkte til brugeren. Ressourcer, der er relaterede, men ikke hjemmesider, skal i stedet tilføjes til metadataegenskaben med en passende etiket eller værdi til at beskrive forholdet.",
      logo: "En lille billedressource, der repræsenterer den agentressource, den er knyttet til. Logoet skal være tydeligt gengivet, når ressourcen vises eller bruges, uden at beskære, rotere eller på anden måde forvrænge billedet. Det anbefales, at en IIIF Image API-tjeneste er tilgængelig for dette billede til andre manipulationer, såsom ændring af størrelse.",
      rendering:
        "En ressource, der er en alternativ, ikke-IIIF-repræsentation af den ressource, der har gengivelsesegenskaben. Sådanne repræsentationer kan typisk ikke males på et enkelt lærred, da de enten indeholder for mange visninger, har inkompatible dimensioner eller er sammensatte ressourcer, der kræver yderligere gengivelsesfunktionalitet. Gengivelsesressourcen skal kunne vises direkte til en menneskelig bruger, selvom præsentationen kan være uden for IIIF-klienten. Ressourcen må ikke have en splash-side eller anden mellemliggende ressource, der formidler adgang til den. Hvis adgangskontrol er påkrævet, anbefales IIIF Authentication API. Eksempler inkluderer en gengivelse af en bog som en PDF eller EPUB, et diasdæk med billeder af en bygning eller en 3D-model af en statue.",
      service:
        "En tjeneste, som klienten muligvis interagerer med direkte og får yderligere information eller funktionalitet for at bruge ressourcen, der har tjenesteegenskaben, såsom fra et billede til basis URI af en tilknyttet IIIF Image API-tjeneste. Tjenesteressourcen bør have yderligere information knyttet til sig for at give klienten mulighed for at bestemme, hvordan den skal gøre passende brug af den. Se venligst Service Registry-dokumentet for detaljer om aktuelt kendte servicetyper.",
      services:
        "En liste over en eller flere tjenestedefinitioner på den øverste ressource i dokumentet, som typisk deles af mere end én efterfølgende ressource. Dette giver mulighed for, at disse delte tjenester kan samles sammen på et enkelt sted, i stedet for enten at få deres information duplikeret potentielt mange gange gennem hele dokumentet, eller at kræve, at en forbrugende klient skal gennemse hele dokumentstrukturen for at finde informationen. Den ressource, som tjenesten gælder for, skal stadig have tjenesteegenskaben, som beskrevet ovenfor, hvor serviceressourcerne mindst har egenskaberne id og type eller @id og @type. Dette giver kunden mulighed for at vide, at tjenesten gælder for den pågældende ressource. Brugen af ​​tjenesternes ejendom sker efter udgivelsessystemets skøn.",
      seeAlso:
        "En maskinlæsbar ressource, såsom en XML- eller RDF-beskrivelse, der er relateret til den aktuelle ressource, der har seeAlso-egenskaben. Egenskaber for ressourcen skal gives for at hjælpe klienten med at vælge mellem flere beskrivelser (hvis de er angivet) og for at gøre passende brug af dokumentet. Hvis forholdet mellem ressourcen og dokumentet skal være mere specifik, skal dokumentet indeholde denne relation i stedet for IIIF-ressourcen. Andre IIIF-ressourcer er også gyldige mål for seeAlso, for eksempel at linke til et Manifest, der beskriver et relateret objekt. Dokumentets URI skal identificere en enkelt repræsentation af dataene i et bestemt format. For eksempel, hvis de samme data findes i JSON og XML, skal der tilføjes separate ressourcer for hver repræsentation med forskellige id- og formategenskaber.",
      partOf:
        "En indeholdende ressource, der inkluderer den ressource, der har egenskaben partOf. Når en klient støder på egenskaben partOf, kan den muligvis hente den refererede indeholdende ressource, hvis den ikke er indlejret i den aktuelle repræsentation, for at bidrage til behandlingen af ​​den indeholdte ressource. For eksempel kan partOf-egenskaben på et lærred bruges til at referere til et eksternt manifest for at muliggøre opdagelsen af ​​yderligere relevant information. På samme måde kan et manifest referere til en indeholdende samling ved hjælp af partOf for at hjælpe med navigation.",
      start:
        "Et Canvas, eller en del af et Canvas, som klienten skal vise ved initialisering for den ressource, der har startegenskaben. Referencen til en del af et lærred håndteres på samme måde, som Ranges refererer til dele af lærreder. Denne egenskab giver klienten mulighed for at begynde med det første lærred, der indeholder interessant indhold i stedet for at kræve, at brugeren manuelt navigerer for at finde det.",
      supplementary:
        "Et link fra dette område til en annotationssamling, der inkluderer supplementing-annoteringer af indholdsressourcer for området. Klienter kan bruge dette til at præsentere yderligere indhold for brugeren fra et andet lærred, når de interagerer med området, eller til at springe til næste del af området inden for det samme lærred. For eksempel kan området repræsentere en avisartikel, der strækker sig over ikke-sekventielle sider, og derefter bruger den supplerende egenskab til at referere til en anmærkningssamling, der består af de anmærkninger, der registrerer teksten, opdelt i anmærkningssider pr. avisside. Alternativt kan området repræsentere de dele af et manuskript, der er blevet transskriberet eller oversat, når der er andre dele, der endnu ikke skal arbejdes på. Annotationssamlingen ville være de annoteringer, der henholdsvis transskriberer eller oversætter.",
    },
    structural: {
      items:
        "Meget af funktionaliteten i IIIF Presentation API er simpelthen at registrere den rækkefølge, som underordnede ressourcer forekommer i en overordnet ressource, såsom samlinger eller manifester i en overordnet samling, eller lærreder i et manifest. Alle disse situationer er dækket af en enkelt ejendom, genstande.",
      structures:
        'Strukturen af ​​et objekt repræsenteret som et manifest kan beskrives ved hjælp af et hierarki af områder. Områder kan bruges til at beskrive objektets "indholdsfortegnelse" eller andre strukturer, som brugeren kan interagere med ud over den rækkefølge, der er givet af manifestets egenskab. Hierarkiet opbygges ved at indlejre de underordnede Range-ressourcer i elementarrayet i Range på højere niveau. Topniveauintervallerne for disse hierarkier er angivet i strukturegenskaben.',
      annotations:
        "En ordnet liste over anmærkningssider, der indeholder kommentarer eller andre anmærkninger om denne ressource, adskilt fra de anmærkninger, der bruges til at male indhold på et lærred. Motivationen for annoteringerne må ikke være painting, og målet for annoteringerne skal omfatte denne ressource eller en del af den.",
    },
    attribution:
      "Copyright © 2012-2023 Redaktører og bidragydere. Udgivet af IIIF Consortium under CC-BY-licensen, se ansvarsfraskrivelse.",
  },
  behavior: {
    groups: {
      autoAdvance: "Automatisk fremrykning",
      repeat: "Gentage",
      manifestOrdering: "Manifest bestilling",
      canvasOrdering: "Bestilling af lærred",
      collection: "Samling",
      range: "Område",
      collectionOrdering: "Samling bestilling",
      rangeOrdering: "Rækkefølge bestilling",
      hidden: "Sigtbarhed",
    },
    values: {
      "auto-advance": "Automatisk fremrykning",
      "no-auto-advance": "Ingen automatisk fremrykning",
      repeat: "Gentage",
      "no-repeat": "Ingen gentagelse",
      unordered: "Uordnet",
      individuals: "Individuelle lærreder",
      continuous: "Sammenhængende",
      paged: "Bladet",
      "facing-pages": "Modstående sider",
      "non-paged": "Ikke-sidet",
      "multi-part": "Flerdelt",
      together: "Sammen",
      sequence: "Sekvens",
      "thumbnail-nav": "Miniaturenavigation",
      "no-nav": "Ingen navigation",
      hidden: "Skjult",
    },
  },
  rights: {
    attributionNonCommercialNoDerivs: {
      label: "Attribution-NonCommercial-NoDerivas",
      description:
        "Denne licens er den mest restriktive af vores seks hovedlicenser, og tillader kun andre at downloade dine værker og dele dem med andre, så længe de krediterer dig, men de kan ikke ændre dem på nogen måde eller bruge dem kommercielt.",
    },
    attributionNonCommercialShareAlike: {
      label: "Navngivelse-Ikke-kommerciel-Del på samme måde",
      description:
        "Denne licens lader andre remixe, tilpasse og bygge videre på dit arbejde, ikke-kommercielt, så længe de krediterer dig og licenserer deres nye kreationer under de identiske vilkår.",
    },
    attributionNonCommercial: {
      label: "Attribution-Ikke-kommerciel",
      description:
        "Denne licens giver andre mulighed for at remixe, tilpasse og bygge videre på dit arbejde, ikke-kommercielt, og selvom deres nye værker også skal anerkende dig og være ikke-kommercielle, behøver de ikke at licensere deres afledte værker på samme vilkår.",
    },
    attributionNoDerivs: {
      label: "Attribution-NoDerivas",
      description:
        "Denne licens tillader andre at genbruge værket til ethvert formål, herunder kommercielt; den kan dog ikke deles med andre i tilpasset form, og kredit skal gives til dig.",
    },
    attributionShareAlike: {
      label: "Attribution-ShareAlike",
      description:
        'Denne licens lader andre remixe, tilpasse og bygge videre på dit arbejde, selv til kommercielle formål, så længe de krediterer dig og licenserer deres nye kreationer under de identiske vilkår. Denne licens sammenlignes ofte med "copyleft" gratis og open source softwarelicenser. Alle nye værker baseret på dit vil bære den samme licens, så alle afledte produkter vil også tillade kommerciel brug. Dette er den licens, der bruges af Wikipedia og anbefales til materialer, der ville have gavn af at inkorporere indhold fra Wikipedia og lignende licenserede projekter.',
    },
    attribution: {
      label: "Tilskrivning",
      description:
        "Denne licens lader andre distribuere, remixe, tilpasse og bygge videre på dit arbejde, selv kommercielt, så længe de krediterer dig for den originale skabelse. Dette er den mest imødekommende af licenser, der tilbydes. Anbefales til maksimal spredning og brug af licenserede materialer.",
    },
    publicDomain: {
      label: "Offentligt domæne",
      description:
        "Den person, der associerede et værk med dette skøde, har dedikeret værket til det offentlige domæne ved at give afkald på alle hans eller hendes rettigheder til værket på verdensplan i henhold til loven om ophavsret, herunder alle beslægtede og beslægtede rettigheder, i det omfang loven tillader det.",
    },
  },
  sizes: {
    landscape: "12 × 8 · Landskab",
    wide: "12 × 6 · Bred",
    square: "12 × 12 · Firkantet",
    portrait: "8 × 12 · Portræt",
  },
} as const;
