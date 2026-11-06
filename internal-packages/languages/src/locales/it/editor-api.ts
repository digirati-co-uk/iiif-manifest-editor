/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  resources: {
    collection: "Collezione",
    manifest: "Manifesto",
    canvas: "Canvas",
    annotation: "Annotazione",
    annotationPage: "Pagina di annotazione",
    range: "Intervallo",
    annotationCollection: "Raccolta di annotazioni",
    contentResource: "Risorsa di contenuto",
    agent: "Agente",
  },
  layout: {
    pair: "Fianco a fianco",
    triptych: "Tre colonne",
    featureLeft: "Caratteristica rimasta",
    featureAbove: "Caratteristica sopra",
    fourImages: "Quattro immagini",
    sixImages: "Sei immagini",
    heroInset: "Eroe + inserto",
    offsetPair: "Coppia di compensazione",
    cascade: "Cascata",
    stacked: "Impilato",
    scatter: "Dispersione",
    galleryWall: "Parete della galleria",
    blank: "Tela bianca",
  },
  fields: {
    label: "Etichetta",
    metadata: "Metadati",
    summary: "Riepilogo",
    requiredStatement: "Dichiarazione obbligatoria",
    rights: "Diritti",
    provider: "Fornitore",
    thumbnail: "Miniatura",
    navDate: "Data di navigazione",
    placeholderCanvas: "Tela segnaposto",
    accompanyingCanvas: "Tela di accompagnamento",
    language: "Lingua",
    id: "Identificatore",
    type: "Tipo",
    format: "Formato",
    profile: "Profilo",
    height: "Altezza",
    width: "Larghezza",
    duration: "Durata",
    viewingDirection: "Direzione di visualizzazione",
    behavior: "Comportamento",
    timeMode: "Modalità ora",
    motivation: "Motivazione",
    homepage: "Home page",
    logo: "Logo",
    rendering: "Rappresentazione alternativa",
    service: "Servizio",
    services: "Servizi",
    seeAlso: "Descrizione correlata",
    partOf: "Parte di",
    start: "Tela iniziale",
    supplementary: "Contenuti supplementari",
    items: "Elementi",
    structures: "Strutture",
    annotations: "Annotazioni",
    target: "Bersaglio",
    body: "Corpo",
    navPlace: "Posizione di navigazione",
    textGranularity: "Granularità del testo",
    value: "Valore",
  },
  documentation: {
    definedTypes: {
      Collection:
        "Un elenco ordinato di manifesti e/o ulteriori raccolte. Le raccolte consentono di raggruppare manifesti e raccolte secondarie in una struttura gerarchica per la presentazione, che può essere utilizzata per generare navigazione, mostrare risultati dinamici da una ricerca o fornire insiemi fissi di risorse correlate per qualsiasi altro scopo.",
      Manifest:
        "Una descrizione della struttura e delle proprietà dell'oggetto composto. Contiene le informazioni necessarie al cliente per presentare il contenuto all'utente, come un titolo e altre informazioni descrittive sull'oggetto o sull'opera intellettuale che trasmette. Ogni Manifesto solitamente descrive come presentare un singolo oggetto composto come un libro, una statua o un album musicale.",
      Canvas:
        'Un contenitore virtuale che rappresenta una vista particolare dell\'oggetto e ha risorse di contenuto associate ad esso o a parti di esso. Il Canvas fornisce un quadro di riferimento per la disposizione del contenuto, sia spazialmente che temporalmente. Il concetto di tela è preso in prestito da standard come PDF e HTML, o applicazioni come Photoshop e PowerPoint, in cui una superficie di visualizzazione inizialmente vuota ha immagini, video, testo e altri contenuti "dipinti" su di essa da annotazioni, raccolte in pagine di annotazione.',
      Range:
        "Un elenco ordinato di tele e/o ulteriori intervalli. Gli intervalli consentono di raggruppare insieme in qualche modo le tele, o parti di esse. Ciò potrebbe avvenire per ragioni basate sul contenuto, come potrebbe essere descritto in un sommario o nella serie di scene di un'opera teatrale. Allo stesso modo, le caratteristiche fisiche potrebbero essere importanti, come ad esempio la raccolta delle pagine in uno dei primi libri o quando la musica registrata è suddivisa su diversi supporti fisici, come due CD.",
      AnnotationPage:
        "Un elenco ordinato di annotazioni generalmente associato a un Canvas ma a cui è possibile fare riferimento anche da altri tipi di risorse. Le pagine di annotazione raccolgono e ordinano elenchi di annotazioni, che a loro volta forniscono commenti su una risorsa o un contenuto che fa parte di un Canvas.",
      Annotation:
        "Le annotazioni associano le risorse di contenuto ai Canvas. Per le risorse visibili e/o udibili viene utilizzato lo stesso meccanismo utilizzato per le trascrizioni, i commenti, i tag e altri contenuti. Ciò fornisce un metodo unico e unificato per allineare le informazioni e fornisce un quadro basato su standard per distinguere parti di risorse e parti di Canvas. Poiché le annotazioni possono essere aggiunte in seguito, si promuove un sistema distribuito in cui gli editori possono allineare i propri contenuti con le descrizioni create da altri. Le funzionalità relative alle annotazioni possono anche basarsi su ulteriori classi come SpecificResource, Choice o Selettori.",
      ContentResource:
        "Risorse Web come immagini, audio, video o testo associati a una tela tramite un'annotazione o che forniscono una rappresentazione di qualsiasi risorsa.",
      AnnotationCollection:
        "Un elenco ordinato di pagine di annotazioni. Le raccolte di annotazioni consentono di registrare raggruppamenti di annotazioni di livello superiore. Ad esempio, tutte le Annotazioni della traduzione inglese di un documento francese medievale potrebbero essere tenute separate dalla trascrizione o da un’edizione in francese moderno, oppure il commento del regista a un film può essere separato dalla sceneggiatura.",
    },
    descriptive: {
      label:
        "Un'etichetta, un nome o un titolo leggibile dall'uomo. La proprietà label è concepita per essere visualizzata come un breve surrogato testuale della risorsa se un essere umano ha bisogno di fare una distinzione tra essa e risorse simili, ad esempio tra oggetti, pagine o opzioni per una scelta di immagini da visualizzare. La proprietà label può essere completamente internazionalizzata e ogni lingua può avere più valori.",
      metadata:
        "Un elenco ordinato di descrizioni da visualizzare all'utente quando interagisce con la risorsa, fornito come coppie di etichette leggibili dall'uomo e voci di valore. Il contenuto di queste voci è inteso solo a scopo di presentazione; la semantica descrittiva non dovrebbe essere dedotta. Una voce potrebbe essere utilizzata per trasmettere informazioni sulla creazione dell'oggetto, una descrizione fisica, informazioni sulla proprietà o altri scopi.",
      summary:
        "Un breve riassunto testuale destinato ad essere trasmesso all'utente quando le voci di metadati per la risorsa non vengono visualizzate. Potrebbe essere utilizzata come breve descrizione per i risultati della ricerca a livello di elemento, per ambienti con schermi piccoli o come interfaccia utente alternativa quando la proprietà dei metadati non è attualmente in fase di rendering. La proprietà summary segue lo stesso modello della proprietà label descritta sopra.",
      requiredStatement:
        "Testo che deve essere visualizzato quando la risorsa viene visualizzata o utilizzata. Ad esempio, la proprietà requiredStatement potrebbe essere utilizzata per presentare dichiarazioni di copyright o proprietà, un riconoscimento dell'istituzione proprietaria e/o editrice o qualsiasi altro testo che l'organizzazione editrice ritiene fondamentale da visualizzare all'utente. Data l’ampia variazione delle potenziali interfacce utente del client, non sarà sempre possibile visualizzare questa istruzione all’utente nello stato iniziale del client. Se inizialmente nascosto, i clienti devono rendere il metodo per rivelarlo il più ovvio possibile.",
      rights:
        "Una stringa che identifica una licenza o una dichiarazione sui diritti che si applica al contenuto della risorsa, come JSON di un manifest o i pixel di un'immagine. Il valore deve essere estratto dall'insieme di URI di licenza Creative Commons, dagli URI della dichiarazione dei diritti RightsStatements.org o da quelli aggiunti tramite il meccanismo di estensione. L'inclusione di questa proprietà è informativa e, ad esempio, potrebbe essere utilizzata per visualizzare un'icona che rappresenta le rivendicazioni dei diritti.",
      provider:
        "Un'organizzazione o una persona che ha contribuito a fornire il contenuto della risorsa. I client possono quindi visualizzare queste informazioni all'utente per riconoscere i contributi del fornitore. Ciò differisce dalla proprietà requiredStatement, in quanto i dati sono strutturati, consentendo al client di fare qualcosa di più della semplice presentazione del testo ma di avere invece informazioni più ricche sulle persone e sulle organizzazioni da utilizzare in diverse interfacce.",
      thumbnail:
        "Una risorsa di contenuto, ad esempio una piccola immagine o un breve clip audio, che rappresenta la risorsa con la proprietà miniatura. Una risorsa può avere più risorse in miniatura con tipo e formato uguali o diversi.",
      navDate:
        "Una data che i client possono utilizzare a scopo di navigazione quando presenta la risorsa all'utente in un'interfaccia utente basata sulla data, ad esempio un calendario o una sequenza temporale. Intervalli di date più descrittivi, destinati a essere visualizzati direttamente dall'utente, dovrebbero essere inclusi nella proprietà dei metadati per il consumo umano. Se la risorsa contiene Canvas che hanno la proprietà Duration, il datetime fornito corrisponde al datetime di navigazione dell'inizio della risorsa. Ad esempio, un intervallo che include un Canvas che rappresenta un insieme di contenuti video che registrano un evento storico, navDate è la data/ora del primo momento dell'evento registrato.",
      placeholderCanvas:
        "Un singolo Canvas che fornisce contenuto aggiuntivo da utilizzare prima che venga eseguito il rendering del contenuto principale della risorsa con la proprietà placeholderCanvas o come pubblicità o sostituto di tale contenuto. Gli esempi includono immagini, testo e suoni che sostituiscono i contenuti video prima che l'utente avvii la riproduzione; o un poster di un film per attirare l'attenzione dell'utente. Il contenuto fornito da placeholderCanvas differisce da una miniatura: un cliente potrebbe utilizzare la miniatura per riepilogare e navigare in più risorse, quindi mostrare il contenuto di placeholderCanvas come parte della presentazione iniziale di una singola risorsa. È probabile che una tela segnaposto abbia dimensioni diverse da quelle delle tele della risorsa che ha la proprietà placeholderCanvas.",
      accompanyingCanvas:
        "Un singolo Canvas che fornisce contenuto aggiuntivo da utilizzare durante il rendering della risorsa con la proprietà accompanyingCanvas. Gli esempi includono un'immagine da mostrare mentre un Canvas di sola durata riproduce l'audio; o audio di sottofondo da riprodurre mentre un utente naviga in un manifest di sole immagini.",
      language:
        "La lingua o le lingue utilizzate nel contenuto di questa risorsa esterna. Questa proprietà è già disponibile dal modello di annotazione Web per le risorse di contenuto che sono il corpo o la destinazione di un'annotazione, tuttavia può essere utilizzata anche per le risorse a cui si fa riferimento dalla home page, dal rendering e da partOf.",
    },
    technical: {
      id: "Il URI che identifica la risorsa. Se la risorsa è disponibile solo incorporata all'interno di un'altra risorsa, ad esempio un intervallo all'interno di un manifest, allora URI potrebbe essere URI della risorsa incorporata con un frammento univoco alla fine. Questo non è vero per le Canvas, che devono avere il proprio URI senza frammento.",
      type: "Il tipo o la classe della risorsa. Per le classi definite per questa specifica",
      format:
        "Il tipo di media specifico (spesso chiamato tipo MIME) per una risorsa di contenuto, ad esempio image/jpeg. Ciò è importante per distinguere formati diversi dello stesso tipo complessivo di risorsa, come distinguere il testo in XML dal testo semplice.",
      profile:
        "Uno schema o un insieme denominato di funzionalità disponibile dalla risorsa. Il profilo può chiarire ulteriormente il tipo e/o il formato di una risorsa o servizio esterno, consentendo ai clienti di personalizzare la gestione della risorsa che ha la proprietà del profilo.",
      height:
        "L'altezza della tela o della risorsa di contenuto esterno. Per le risorse di contenuto, il valore è in pixel. Per le tele, il valore non ha un'unità. In combinazione con la larghezza, trasmette le proporzioni dello spazio in cui si trovano le risorse di contenuto.",
      width:
        "La larghezza della tela o della risorsa di contenuto esterno. Per le risorse di contenuto, il valore è in pixel. Per le tele, il valore non ha un'unità. In combinazione con l'altezza, trasmette le proporzioni dello spazio in cui si trovano le risorse di contenuto.",
      duration: "La durata della risorsa Canvas o del contenuto esterno, espressa in secondi.",
      viewingDirection:
        "La direzione in cui una serie di tele deve essere visualizzata all'utente. Questa specifica definisce quattro valori di direzione nella tabella seguente. Altri possono essere definiti esternamente come un'estensione.",
      behavior:
        "Un insieme di funzionalità dell'esperienza utente che l'editore del contenuto preferirebbe che il cliente utilizzasse durante la presentazione della risorsa. Questa specifica definisce i valori nella tabella seguente. Altri possono essere definiti esternamente come un'estensione.",
      timeMode:
        "Una modalità associata a un'Annotazione che deve essere applicata al rendering di qualsiasi media basato sul tempo, o altrimenti potrebbe essere considerata dotata di una durata, utilizzata come risorsa del corpo di quell'Annotazione. Si noti che l'associazione di timeMode con l'Annotazione significa che diverse risorse nel corpo non possono avere valori diversi. Questa specifica definisce i valori specificati nella tabella seguente. Altri possono essere definiti esternamente come un'estensione.",
      motivation:
        "Questa specifica definisce due valori per la proprietà Annotazione Web di motivazione o scopo quando utilizzata su una risorsa specifica o Textual Body. Le risorse associate ad un Canvas da un'Annotazione che ha il valore di motivazione \"painting\" devono essere presentate all'utente come rappresentazione del Canvas. Le risorse associate a una tela da un'annotazione che ha il valore di motivazione supplementing possono essere presentate all'utente come parte della rappresentazione della tela o possono essere presentate in una parte diversa dell'interfaccia utente.",
    },
    linking: {
      homepage:
        "Una pagina Web che riguarda l'oggetto rappresentato dalla risorsa che ha la proprietà homepage. La pagina web è solitamente pubblicata dall'organizzazione responsabile dell'oggetto e potrebbe essere generata da un sistema di gestione dei contenuti o da un altro sistema di catalogazione. La risorsa deve poter essere visualizzata direttamente all'utente. Le risorse correlate, ma non le home page, devono invece essere aggiunte nella proprietà dei metadati, con un'etichetta o un valore appropriato per descrivere la relazione.",
      logo: "Una piccola risorsa immagine che rappresenta la risorsa agente a cui è associata. Il logo deve essere reso chiaramente quando la risorsa viene visualizzata o utilizzata, senza ritagliare, ruotare o distorcere in altro modo l'immagine. Si consiglia di rendere disponibile un servizio API immagine IIIF per questa immagine per altre manipolazioni come il ridimensionamento.",
      rendering:
        "Una risorsa che è una rappresentazione alternativa, non IIIF, della risorsa con la proprietà di rendering. Tali rappresentazioni in genere non possono essere dipinte su una singola tela, poiché includono troppe viste, hanno dimensioni incompatibili o sono risorse composte che richiedono funzionalità di rendering aggiuntive. La risorsa di rendering deve poter essere visualizzata direttamente da un utente umano, sebbene la presentazione possa avvenire all'esterno del client IIIF. La risorsa non deve avere una pagina iniziale o un'altra risorsa interstiziale che ne media l'accesso. Se è richiesto il controllo degli accessi, si consiglia l'API di autenticazione IIIF. Gli esempi includono un rendering di un libro come PDF o EPUB, una presentazione con immagini di un edificio o un modello 3D di una statua.",
      service:
        "Un servizio con cui il client potrebbe interagire direttamente e ottenere informazioni o funzionalità aggiuntive per l'utilizzo della risorsa che ha la proprietà del servizio, ad esempio da un'immagine allo URI di base di un servizio API immagine IIIF associato. Alla risorsa del servizio dovrebbero essere associate informazioni aggiuntive per consentire al cliente di determinare come farne un uso appropriato. Consultare il documento Registro dei servizi per i dettagli sui tipi di servizi attualmente conosciuti.",
      services:
        "Un elenco di una o più definizioni di servizio nella risorsa più in alto del documento, che in genere sono condivise da più di una risorsa successiva. Ciò consente di raccogliere insieme questi servizi condivisi in un unico posto, anziché duplicare potenzialmente le loro informazioni più volte nel documento o richiedere al cliente che li utilizza di attraversare l'intera struttura del documento per trovare le informazioni. La risorsa a cui si applica il servizio deve comunque avere la proprietà service, come descritto sopra, dove le risorse del servizio hanno almeno le proprietà id e type o @id e @type. Ciò consente al client di sapere che il servizio si applica a quella risorsa. L'utilizzo della proprietà dei servizi è a discrezione del sistema di pubblicazione.",
      seeAlso:
        "Una risorsa leggibile dal computer come una descrizione XML o RDF correlata alla risorsa corrente che ha la proprietà seeAlso. Dovrebbero essere fornite le proprietà della risorsa per aiutare il cliente a scegliere tra più descrizioni (se fornite) e a fare un uso appropriato del documento. Se la relazione tra la risorsa e il documento deve essere più specifica, allora il documento dovrebbe includere quella relazione anziché la risorsa IIIF. Anche altre risorse IIIF sono obiettivi validi per seeAlso, ad esempio per collegarsi a un manifest che descrive un oggetto correlato. Lo URI del documento deve identificare un'unica rappresentazione dei dati in un particolare formato. Ad esempio, se gli stessi dati esistono in JSON e XML, è necessario aggiungere risorse separate per ciascuna rappresentazione, con ID e proprietà di formato distinti.",
      partOf:
        "Una risorsa contenitore che include la risorsa con la proprietà partOf. Quando un client incontra la proprietà partOf, potrebbe recuperare la risorsa contenente a cui si fa riferimento, se non è incorporata nella rappresentazione corrente, per contribuire all'elaborazione della risorsa contenuta. Ad esempio, la proprietà partOf su un Canvas può essere utilizzata per fare riferimento a un Manifest esterno per consentire la scoperta di ulteriori informazioni rilevanti. Allo stesso modo, un Manifest può fare riferimento a una Collection che lo contiene utilizzando partOf per facilitare la navigazione.",
      start:
        "Un Canvas, o parte di un Canvas, che il client deve mostrare all'inizializzazione per la risorsa che ha la proprietà start. Il riferimento a una parte di una tela viene gestito nello stesso modo in cui gli intervalli fanno riferimento a parti di tele. Questa proprietà consente al client di iniziare con il primo Canvas che contiene contenuto interessante anziché richiedere all'utente di navigare manualmente per trovarlo.",
      supplementary:
        "Un collegamento da questo intervallo a una raccolta di annotazioni che include le annotazioni supplementing delle risorse di contenuto per l'intervallo. I client potrebbero utilizzarlo per presentare contenuti aggiuntivi all'utente da una tela diversa quando interagiscono con l'intervallo o per passare alla parte successiva dell'intervallo all'interno della stessa tela. Ad esempio, l'intervallo potrebbe rappresentare un articolo di giornale che si estende su pagine non sequenziali e quindi utilizzare la proprietà supplementare per fare riferimento a una raccolta di annotazioni costituita dalle annotazioni che registrano il testo, suddivise in pagine di annotazioni per pagina di giornale. In alternativa, l'Intervallo potrebbe rappresentare le parti di un manoscritto che sono state trascritte o tradotte, quando ci sono altre parti su cui devono ancora essere lavorate. La raccolta di annotazioni sarebbe rispettivamente le annotazioni che trascrivono o traducono.",
    },
    structural: {
      items:
        "Gran parte della funzionalità dell'API di presentazione IIIF consiste semplicemente nella registrazione dell'ordine in cui le risorse secondarie si verificano all'interno di una risorsa principale, ad esempio raccolte o manifest all'interno di una raccolta principale o tele all'interno di un manifest. Tutte queste situazioni sono coperte da un'unica proprietà, items.",
      structures:
        "La struttura di un oggetto rappresentato come Manifest può essere descritta utilizzando una gerarchia di Intervalli. Gli intervalli possono essere utilizzati per descrivere il \"sommario\" dell'oggetto o altre strutture con cui l'utente può interagire oltre l'ordine fornito dalla proprietà items del Manifest. La gerarchia viene creata nidificando le risorse Range secondarie nell'array di elementi del Range di livello superiore. Gli intervalli di livello superiore di queste gerarchie sono forniti nella proprietà delle strutture.",
      annotations:
        "Un elenco ordinato di pagine di annotazioni che contengono commenti o altre annotazioni su questa risorsa, separate dalle annotazioni utilizzate per dipingere il contenuto su una tela. La motivazione delle Annotazioni non deve essere painting e il target delle Annotazioni deve includere questa risorsa o parte di essa.",
    },
    attribution:
      "Copyright © 2012-2023 Redattori e collaboratori. Pubblicato dal Consorzio IIIF sotto la licenza CC-BY, vedere disclaimer.",
  },
  behavior: {
    groups: {
      autoAdvance: "Avanzamento automatico",
      repeat: "Ripetere",
      manifestOrdering: "Ordinamento manifesto",
      canvasOrdering: "Ordinazione della tela",
      collection: "Collezione",
      range: "Intervallo",
      collectionOrdering: "Ordinamento della raccolta",
      rangeOrdering: "Ordinamento della gamma",
      hidden: "Visibilità",
    },
    values: {
      "auto-advance": "Avanzamento automatico",
      "no-auto-advance": "Nessun avanzamento automatico",
      repeat: "Ripetere",
      "no-repeat": "Nessuna ripetizione",
      unordered: "Non ordinato",
      individuals: "Tele individuali",
      continuous: "Continuo",
      paged: "Paginato",
      "facing-pages": "Pagine affiancate",
      "non-paged": "Non paginato",
      "multi-part": "Multiparte",
      together: "Insieme",
      sequence: "Sequenza",
      "thumbnail-nav": "Navigazione in miniatura",
      "no-nav": "Nessuna navigazione",
      hidden: "Nascosto",
    },
  },
  rights: {
    attributionNonCommercialNoDerivs: {
      label: "Attribuzione-Non commerciale-Non derivati",
      description:
        "Questa licenza è la più restrittiva delle nostre sei licenze principali, consentendo solo ad altri di scaricare le tue opere e condividerle con altri fintanto che ti accreditano, ma non possono modificarle in alcun modo o utilizzarle a fini commerciali.",
    },
    attributionNonCommercialShareAlike: {
      label: "Attribuzione-Non commerciale-Condividi allo stesso modo",
      description:
        "Questa licenza consente ad altri di remixare, adattare e sviluppare il tuo lavoro in modo non commerciale, a condizione che ti attribuiscano credito e concedano in licenza le loro nuove creazioni agli stessi termini.",
    },
    attributionNonCommercial: {
      label: "Attribuzione-Non commerciale",
      description:
        "Questa licenza consente ad altri di remixare, adattare e sviluppare il tuo lavoro in modo non commerciale e, sebbene anche i loro nuovi lavori debbano riconoscerti ed essere non commerciali, non sono tenuti a concedere in licenza i loro lavori derivati ​​agli stessi termini.",
    },
    attributionNoDerivs: {
      label: "Attribuzione-NoDerivs",
      description:
        "Questa licenza consente ad altri di riutilizzare l'opera per qualsiasi scopo, anche commerciale; tuttavia, non può essere condiviso con altri in forma adattata e il credito deve essere fornito all'utente.",
    },
    attributionShareAlike: {
      label: "Attribuzione-Condividi allo stesso modo",
      description:
        "Questa licenza consente ad altri di remixare, adattare e sviluppare il tuo lavoro anche per scopi commerciali, purché ti attribuiscano credito e concedano in licenza le loro nuove creazioni agli stessi termini. Questa licenza viene spesso paragonata alle licenze software gratuite e open source “copyleft”. Tutti i nuovi lavori basati sul tuo avranno la stessa licenza, quindi eventuali derivati ​​consentiranno anche l'uso commerciale. Questa è la licenza utilizzata da Wikipedia ed è consigliata per materiali che trarrebbero vantaggio dall'incorporazione di contenuti da Wikipedia e progetti con licenza simile.",
    },
    attribution: {
      label: "Attribuzione",
      description:
        "Questa licenza consente ad altri di distribuire, remixare, adattare e sviluppare il tuo lavoro, anche commercialmente, purché ti attribuiscano la creazione originale. Questa è la più accomodante delle licenze offerte. Consigliato per la massima diffusione e utilizzo dei materiali concessi in licenza.",
    },
    publicDomain: {
      label: "Dominio pubblico",
      description:
        "La persona che ha associato un'opera a questo atto ha dedicato l'opera al pubblico dominio rinunciando a tutti i suoi diritti sull'opera in tutto il mondo ai sensi della legge sul diritto d'autore, inclusi tutti i diritti connessi e confinanti, nella misura consentita dalla legge.",
    },
  },
  sizes: {
    landscape: "12 × 8 · Paesaggio",
    wide: "12 × 6 · Largo",
    square: "12 × 12 · Quadrato",
    portrait: "8 × 12 · Ritratto",
  },
} as const;
